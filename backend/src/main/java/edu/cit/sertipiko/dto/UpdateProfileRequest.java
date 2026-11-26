package edu.cit.sertipiko.dto;

import edu.cit.sertipiko.entity.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Department or organization is required.")
        @Size(max = 120, message = "Department or organization must be at most 120 characters.")
        @Pattern(regexp = "^[\\p{L}\\p{N} .,'&()/-]+$",
                message = "Use letters, numbers, spaces, and basic punctuation only.")
        String department,

        @NotNull(message = "Please choose whether you are a student, faculty, or staff.")
        UserType userType
) {
}
