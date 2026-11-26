package edu.cit.sertipiko.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Reset link is invalid.")
        @Size(max = 128, message = "Reset link is invalid.")
        String token,

        @NotBlank(message = "New password is required.")
        @Size(min = PasswordRules.MIN, max = PasswordRules.MAX, message = PasswordRules.SIZE_MESSAGE)
        @Pattern(regexp = PasswordRules.PATTERN, message = PasswordRules.PATTERN_MESSAGE)
        String newPassword,

        @NotBlank(message = "Please confirm your new password.")
        String confirmPassword
) {
}
