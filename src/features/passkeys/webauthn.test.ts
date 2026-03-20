/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createRegistrationCredential,
  decodeCreationOptions,
  decodeRequestOptions,
  getAuthenticationCredential,
} from './webauthn';

const createMock = vi.fn();
const getMock = vi.fn();

describe('passkey webauthn helpers', () => {
  beforeEach(() => {
    createMock.mockReset();
    getMock.mockReset();
    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      configurable: true,
      value: class PublicKeyCredentialMock {},
    });
    Object.defineProperty(globalThis.navigator, 'credentials', {
      configurable: true,
      value: {
        create: createMock,
        get: getMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('decodes base64url challenge and user id values for registration options', () => {
    const result = decodeCreationOptions({
      challenge: 'AQIDBA',
      user: {
        id: 'BQYHCA',
      },
      excludeCredentials: [
        {
          id: 'CQoLDA',
          type: 'public-key',
        },
      ],
    });

    expect(result.challenge).toBeInstanceOf(Uint8Array);
    expect(result.user.id).toBeInstanceOf(Uint8Array);
    expect(result.excludeCredentials?.[0]?.id).toBeInstanceOf(Uint8Array);
  });

  it('normalizes numeric-array binary fields from backend registration options', () => {
    const result = decodeCreationOptions({
      challenge: [1, 2, 3, 4],
      user: {
        id: [5, 6, 7, 8],
      },
      excludeCredentials: [
        {
          id: [9, 10, 11, 12],
          type: 'public-key',
        },
      ],
    });

    expect(result.challenge).toBeInstanceOf(Uint8Array);
    expect(result.user.id).toBeInstanceOf(Uint8Array);
    expect(result.excludeCredentials?.[0]?.id).toBeInstanceOf(Uint8Array);
  });

  it('decodes base64url challenge and allowCredentials values for request options', () => {
    const result = decodeRequestOptions({
      challenge: 'AQIDBA',
      allowCredentials: [
        {
          id: 'BQYHCA',
          type: 'public-key',
        },
      ],
    });

    expect(result.challenge).toBeInstanceOf(Uint8Array);
    expect(result.allowCredentials?.[0]?.id).toBeInstanceOf(Uint8Array);
  });

  it('serializes a registration credential returned by the browser', async () => {
    createMock.mockResolvedValue({
      id: 'credential-id',
      rawId: Uint8Array.from([1, 2, 3]).buffer,
      type: 'public-key',
      response: {
        clientDataJSON: Uint8Array.from([4, 5, 6]).buffer,
        attestationObject: Uint8Array.from([7, 8, 9]).buffer,
        transports: ['internal'],
        getPublicKeyAlgorithm: () => -7,
      },
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
      authenticatorAttachment: 'platform',
    });

    const result = await createRegistrationCredential({
      challenge: 'AQIDBA',
      user: {
        id: 'BQYHCA',
        name: 'demo',
        displayName: 'Demo User',
      },
      rp: {
        id: 'localhost',
        name: 'Spring Playground',
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7,
        },
      ],
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'credential-id',
        rawId: 'AQID',
        type: 'public-key',
        authenticatorAttachment: 'platform',
      })
    );
    expect(result.response).toEqual(
      expect.objectContaining({
        clientDataJSON: 'BAUG',
        attestationObject: 'BwgJ',
        transports: ['internal'],
        publicKeyAlgorithm: -7,
      })
    );
  });

  it('calls native attestation helpers with the original response as this', async () => {
    const response = {
      clientDataJSON: Uint8Array.from([4, 5, 6]).buffer,
      attestationObject: Uint8Array.from([7, 8, 9]).buffer,
      transports: ['internal'],
      getTransports(this: unknown) {
        if (this !== response) {
          throw new TypeError('wrong this');
        }

        return ['internal'];
      },
      getPublicKeyAlgorithm(this: unknown) {
        if (this !== response) {
          throw new TypeError('wrong this');
        }

        return -7;
      },
    };

    createMock.mockResolvedValue({
      id: 'credential-id',
      rawId: Uint8Array.from([1, 2, 3]).buffer,
      type: 'public-key',
      response,
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
      authenticatorAttachment: 'platform',
    });

    await expect(
      createRegistrationCredential({
        challenge: 'AQIDBA',
        user: {
          id: 'BQYHCA',
          name: 'demo',
          displayName: 'Demo User',
        },
        rp: {
          id: 'localhost',
          name: 'Spring Playground',
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
        ],
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'credential-id',
      })
    );
  });

  it('throws a friendly unsupported error when WebAuthn is unavailable', async () => {
    Object.defineProperty(globalThis, 'PublicKeyCredential', {
      configurable: true,
      value: undefined,
    });

    await expect(
      getAuthenticationCredential({
        challenge: 'AQIDBA',
      })
    ).rejects.toMatchObject({
      code: 'UNSUPPORTED',
    });
  });

  it('maps AbortError into a cancellation error', async () => {
    getMock.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));

    await expect(
      getAuthenticationCredential({
        challenge: 'AQIDBA',
      })
    ).rejects.toMatchObject({
      code: 'CANCELLED',
    });
  });
});
