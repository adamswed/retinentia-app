import { z } from 'zod';

export const passwordValidation = z.string().refine(
  (value) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(value);
  },
  {
    message:
      'Password must contain at least 6 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
  }
);

export const registerUserSchema = z
  .object({
    email: z
      .string()
      .email()
      .max(100, 'Email must be less than 100 characters'),
    name: z
      .string()
      .min(2, 'Name must be valid and contain at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s\-']+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    password: passwordValidation,
    passwordConfirm: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
    agreedAt: z.string().datetime().optional(),
    agreedVersion: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        message: 'Passwords do not match',
        path: ['passwordConfirm'],
        code: 'custom',
      });
    }
  });
