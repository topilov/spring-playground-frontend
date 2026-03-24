import type { ProtectionResult } from './types';

interface ProtectedStatusBannerProps {
  errorMessage?: string | null;
  protection?: ProtectionResult | null;
}

function getProtectionMessage(protection: ProtectionResult): string {
  switch (protection.kind) {
    case 'captcha_invalid':
      return 'Please try the verification again before submitting.';
    case 'rate_limited':
      return protection.retryAfterText ?? 'Please wait a moment before trying again.';
    case 'cooldown_active':
      return protection.retryAfterText ?? 'This action is cooling down. Please try again soon.';
    case 'protection_error':
      return 'We could not complete the verification step. Please try again.';
  }
}

export function ProtectedStatusBanner({
  errorMessage,
  protection,
}: ProtectedStatusBannerProps) {
  const message = errorMessage ?? (protection ? getProtectionMessage(protection) : null);

  if (!message) {
    return null;
  }

  return (
    <p className="status-banner status-error" role="alert">
      {message}
    </p>
  );
}
