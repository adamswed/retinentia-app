import { z } from "zod";
import { passwordValidation } from "./registerUser";

export const updatePasswordSchema = z
.object({
  currentPassword: passwordValidation,
  newPassword: passwordValidation,
  newPasswordConfirm: z.string(),
})
.superRefine((data, ctx) => {
  if (data.newPassword !== data.newPasswordConfirm) {
    ctx.addIssue({
      message: "Passwords do not match",
      path: ["newPasswordConfirm"],
      code: "custom",
    });
  }
});

export const deleteAccountSchema = z
.object({
  password: passwordValidation
});
