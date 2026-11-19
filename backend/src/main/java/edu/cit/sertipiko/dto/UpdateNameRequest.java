package edu.cit.sertipiko.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateNameRequest(
        @NotBlank(message = "Full name is required.")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters.")
        @Pattern(regexp = "^\\s*\\p{L}[\\p{L} .'-]*$",
                message = "Use letters, spaces, periods, apostrophes, or hyphens only.")
        String fullName
) {
}
