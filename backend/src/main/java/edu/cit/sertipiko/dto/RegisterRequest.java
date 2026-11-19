package edu.cit.sertipiko.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required.")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters.")
        @Pattern(regexp = "^\\s*\\p{L}[\\p{L} .'-]*$",
                message = "Use letters, spaces, periods, apostrophes, or hyphens only.")
        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 254, message = "Email is too long.")
        String email,

        @NotBlank(message = "Department or organization is required.")
        @Size(max = 120, message = "Department or organization must be at most 120 characters.")
        String department,

        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 72, message = "Password must be 8-72 characters.")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain an uppercase letter, a lowercase letter, and a number.")
        String password,

        @NotBlank(message = "Please confirm your password.")
        String confirmPassword
) {
}
