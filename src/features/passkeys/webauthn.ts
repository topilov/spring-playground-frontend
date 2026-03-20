type WebAuthnJson = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function toBytes(value: ArrayBuffer | ArrayBufferView): Uint8Array {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}

function encodeBase64Url(value: ArrayBuffer | ArrayBufferView): string {
  const binary = Array.from(toBytes(value), (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getResponseMethod<T>(response: unknown, name: string): (() => T) | undefined {
  if (!isRecord(response)) {
    return undefined;
  }

  const maybeMethod = Reflect.get(response, name);
  return typeof maybeMethod === 'function'
    ? (maybeMethod as (this: unknown) => T).bind(response)
    : undefined;
}

function isNumericByteArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === 'number' && Number.isInteger(item) && item >= 0 && item <= 255
    )
  );
}

function readObjectByteValues(value: Record<string, unknown>) {
  const numericKeys = Object.keys(value)
    .filter((key) => /^\d+$/.test(key))
    .sort((left, right) => Number(left) - Number(right));

  if (numericKeys.length === 0) {
    return undefined;
  }

  const numericValues = numericKeys.map((key) => value[key]);
  return isNumericByteArray(numericValues) ? Uint8Array.from(numericValues) : undefined;
}

function toBufferSource(value: unknown): ArrayBuffer | ArrayBufferView | undefined {
  if (typeof value === 'string') {
    return decodeBase64Url(value);
  }

  if (value instanceof ArrayBuffer) {
    return value;
  }

  if (ArrayBuffer.isView(value)) {
    return value;
  }

  if (isNumericByteArray(value)) {
    return Uint8Array.from(value);
  }

  if (isRecord(value)) {
    if (isNumericByteArray(value.data)) {
      return Uint8Array.from(value.data);
    }

    return readObjectByteValues(value);
  }

  return undefined;
}

function decodeCredentialDescriptor(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const id = toBufferSource(value.id);

  if (!id) {
    return value;
  }

  return {
    ...value,
    id,
  };
}

function isPublicKeyCredentialLike(value: unknown): value is PublicKeyCredential {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.rawId instanceof ArrayBuffer &&
    typeof value.type === 'string' &&
    typeof Reflect.get(value, 'getClientExtensionResults') === 'function' &&
    isRecord(value.response)
  );
}

function serializeCredentialBase(credential: PublicKeyCredential) {
  return {
    id: credential.id,
    rawId: encodeBase64Url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

function ensurePasskeySupport() {
  if (
    typeof PublicKeyCredential === 'undefined' ||
    !navigator.credentials?.create ||
    !navigator.credentials?.get
  ) {
    throw new PasskeyBrowserError(
      'UNSUPPORTED',
      'Passkeys are not supported on this browser.'
    );
  }
}

function normalizeBrowserError(error: unknown): never {
  if (error instanceof PasskeyBrowserError) {
    throw error;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new PasskeyBrowserError(
      'CANCELLED',
      'The passkey prompt was cancelled before it completed.'
    );
  }

  throw error;
}

export class PasskeyBrowserError extends Error {
  readonly code: 'UNSUPPORTED' | 'CANCELLED' | 'INVALID_RESULT';

  constructor(
    code: 'UNSUPPORTED' | 'CANCELLED' | 'INVALID_RESULT',
    message: string
  ) {
    super(message);
    this.name = 'PasskeyBrowserError';
    this.code = code;
  }
}

export function decodeCreationOptions(publicKey: WebAuthnJson) {
  const decoded: Record<string, unknown> = { ...publicKey };
  const challenge = toBufferSource(publicKey.challenge);

  if (challenge) {
    decoded.challenge = challenge;
  }

  if (isRecord(publicKey.user)) {
    const userId = toBufferSource(publicKey.user.id);

    if (userId) {
      decoded.user = {
        ...publicKey.user,
        id: userId,
      };
    }
  }

  if (Array.isArray(publicKey.excludeCredentials)) {
    decoded.excludeCredentials = publicKey.excludeCredentials.map((value) =>
      decodeCredentialDescriptor(value)
    );
  }

  return decoded as unknown as PublicKeyCredentialCreationOptions;
}

export function decodeRequestOptions(publicKey: WebAuthnJson) {
  const decoded: Record<string, unknown> = { ...publicKey };
  const challenge = toBufferSource(publicKey.challenge);

  if (challenge) {
    decoded.challenge = challenge;
  }

  if (Array.isArray(publicKey.allowCredentials)) {
    decoded.allowCredentials = publicKey.allowCredentials.map((value) =>
      decodeCredentialDescriptor(value)
    );
  }

  return decoded as unknown as PublicKeyCredentialRequestOptions;
}

function assertChallengeOption(
  challenge: unknown,
  action: 'registration' | 'sign-in'
) {
  if (challenge instanceof ArrayBuffer || ArrayBuffer.isView(challenge)) {
    return;
  }

  throw new PasskeyBrowserError(
    'INVALID_RESULT',
    `The server returned invalid passkey ${action} options.`
  );
}

export async function createRegistrationCredential(publicKey: WebAuthnJson) {
  ensurePasskeySupport();

  try {
    const options = decodeCreationOptions(publicKey);
    assertChallengeOption(options.challenge, 'registration');

    const credential = await navigator.credentials.create({
      publicKey: options,
    });

    if (!isPublicKeyCredentialLike(credential)) {
      throw new PasskeyBrowserError(
        'INVALID_RESULT',
        'The browser did not return a valid passkey registration result.'
      );
    }

    const response = credential.response as AuthenticatorAttestationResponse;
    const getTransports = getResponseMethod<string[]>(response, 'getTransports');
    const getPublicKeyAlgorithm = getResponseMethod<number>(
      response,
      'getPublicKeyAlgorithm'
    );

    return {
      ...serializeCredentialBase(credential),
      response: {
        clientDataJSON: encodeBase64Url(response.clientDataJSON),
        attestationObject: encodeBase64Url(response.attestationObject),
        transports:
          getTransports?.() ||
          (Array.isArray(Reflect.get(response, 'transports'))
            ? (Reflect.get(response, 'transports') as string[])
            : undefined),
        publicKeyAlgorithm: getPublicKeyAlgorithm?.(),
      },
    };
  } catch (error) {
    normalizeBrowserError(error);
  }
}

export async function getAuthenticationCredential(publicKey: WebAuthnJson) {
  ensurePasskeySupport();

  try {
    const options = decodeRequestOptions(publicKey);
    assertChallengeOption(options.challenge, 'sign-in');

    const credential = await navigator.credentials.get({
      publicKey: options,
    });

    if (!isPublicKeyCredentialLike(credential)) {
      throw new PasskeyBrowserError(
        'INVALID_RESULT',
        'The browser did not return a valid passkey sign-in result.'
      );
    }

    const response = credential.response as AuthenticatorAssertionResponse;

    return {
      ...serializeCredentialBase(credential),
      response: {
        authenticatorData: encodeBase64Url(response.authenticatorData),
        clientDataJSON: encodeBase64Url(response.clientDataJSON),
        signature: encodeBase64Url(response.signature),
        userHandle: response.userHandle
          ? encodeBase64Url(response.userHandle)
          : undefined,
      },
    };
  } catch (error) {
    normalizeBrowserError(error);
  }
}
