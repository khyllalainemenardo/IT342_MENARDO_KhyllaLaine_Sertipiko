package edu.cit.sertipiko.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Enabled is required.")
        Boolean enabled
) {
}
