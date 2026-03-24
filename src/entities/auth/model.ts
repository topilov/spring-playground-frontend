import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  captchaToken: string;
}

export interface RegisterResult {
  userId: number;
  username: string;
  email: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailResult {
  verified: boolean;
}

export interface ResendVerificationEmailInput {
  email: string;
  captchaToken: string;
}

export interface ResendVerificationEmailResult {
  accepted: boolean;
}

export interface ForgotPasswordInput {
  email: string;
  captchaToken: string;
}

export interface ForgotPasswordResult {
  accepted: boolean;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  captchaToken: string;
}

export interface ResetPasswordResult {
  reset: boolean;
}

export type RegisterRequestDto = ApiRequestBody<'/api/auth/register', 'post'>;
export type RegisterResponseDto = ApiResponse<'/api/auth/register', 'post'>;
export type VerifyEmailRequestDto = ApiRequestBody<'/api/auth/verify-email', 'post'>;
export type VerifyEmailResponseDto = ApiResponse<'/api/auth/verify-email', 'post'>;
export type ResendVerificationEmailRequestDto = ApiRequestBody<
  '/api/auth/resend-verification-email',
  'post'
>;
export type ResendVerificationEmailResponseDto = ApiResponse<
  '/api/auth/resend-verification-email',
  'post'
>;
export type ForgotPasswordRequestDto = ApiRequestBody<'/api/auth/forgot-password', 'post'>;
export type ForgotPasswordResponseDto = ApiResponse<'/api/auth/forgot-password', 'post'>;
export type ResetPasswordRequestDto = ApiRequestBody<'/api/auth/reset-password', 'post'>;
export type ResetPasswordResponseDto = ApiResponse<'/api/auth/reset-password', 'post'>;

export function toRegisterRequest(payload: RegisterInput): RegisterRequestDto {
  return { ...payload };
}

export function mapRegisterResponse(payload: RegisterResponseDto): RegisterResult {
  return { ...payload };
}

export function toVerifyEmailRequest(payload: VerifyEmailInput): VerifyEmailRequestDto {
  return { ...payload };
}

export function mapVerifyEmailResponse(payload: VerifyEmailResponseDto): VerifyEmailResult {
  return { ...payload };
}

export function toResendVerificationEmailRequest(
  payload: ResendVerificationEmailInput
): ResendVerificationEmailRequestDto {
  return { ...payload };
}

export function mapResendVerificationEmailResponse(
  payload: ResendVerificationEmailResponseDto
): ResendVerificationEmailResult {
  return { ...payload };
}

export function toForgotPasswordRequest(
  payload: ForgotPasswordInput
): ForgotPasswordRequestDto {
  return { ...payload };
}

export function mapForgotPasswordResponse(
  payload: ForgotPasswordResponseDto
): ForgotPasswordResult {
  return { ...payload };
}

export function toResetPasswordRequest(
  payload: ResetPasswordInput
): ResetPasswordRequestDto {
  return { ...payload };
}

export function mapResetPasswordResponse(
  payload: ResetPasswordResponseDto
): ResetPasswordResult {
  return { ...payload };
}
