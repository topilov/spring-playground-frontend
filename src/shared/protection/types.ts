export type ProtectionKind =
  | 'captcha_invalid'
  | 'rate_limited'
  | 'cooldown_active'
  | 'protection_error';

export interface ProtectionResult {
  kind: ProtectionKind;
  retryAfterSeconds?: number;
  retryAfterText?: string;
}
