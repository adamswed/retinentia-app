import { CardFormFields } from '@/models/card-form.model';
import { z } from 'zod';

export const indexCardDataSchema = z.object({
  term: z
    .string()
    .min(1, 'Term must contain a valid value')
    .max(
      CardFormFields.TERM_MAX_LENGTH,
      `Term must be less than ${CardFormFields.TERM_MAX_LENGTH} characters`
    )
    .refine(
      (val) => val.trim().length > 0,
      'Term cannot be empty or just whitespace'
    ),
  definition: z
    .string()
    .min(1, 'Definition must contain a valid value')
    .refine((val) => {
      // Extract plain text from HTML for length validation
      const plainText = val.replace(/<[^>]*>/g, '').trim();
      return plainText.length > 0;
    }, 'Definition cannot be empty')
    .refine((val) => {
      const plainText = val.replace(/<[^>]*>/g, '');
      return plainText.length <= CardFormFields.DEFINITION_MAX_LENGTH;
    }, 'Definition content is too long'),
});
