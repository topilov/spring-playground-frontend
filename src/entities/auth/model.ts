import type { components } from '../../shared/api/generated/schema';

export type RegisterInput = components['schemas']['RegisterRequest'];
export type RegisterResult = components['schemas']['RegisterResponse'];
export type VerifyEmailInput = components['schemas']['VerifyEmailRequest'];
export type VerifyEmailResult = components['schemas']['VerifyEmailResponse'];
export type ResendVerificationEmailInput =
  components['schemas']['ResendVerificationEmailRequest'];
export type ResendVerificationEmailResult =
  components['schemas']['ResendVerificationEmailResponse'];
export type ForgotPasswordInput = components['schemas']['ForgotPasswordRequest'];
export type ForgotPasswordResult = components['schemas']['ForgotPasswordResponse'];
