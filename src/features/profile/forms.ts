import { z } from 'zod';

export const usernameSettingsFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Enter a username.')
    .max(64, 'Username must be 64 characters or fewer.'),
});

export const emailChangeFormSchema = z.object({
  newEmail: z.email('Enter a valid email address.'),
});

export const passwordChangeFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(100, 'Password must be 100 characters or fewer.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });

export type UsernameSettingsFormValues = z.infer<typeof usernameSettingsFormSchema>;
export type EmailChangeFormValues = z.infer<typeof emailChangeFormSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>;
