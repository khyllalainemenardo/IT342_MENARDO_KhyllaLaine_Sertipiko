package edu.cit.sertipiko.dto;

import edu.cit.sertipiko.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Role is required.")
        Role role
) {
}
