package edu.cit.sertipiko.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.cit.sertipiko.entity.User;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String userType,
        String department,
        String qrToken,
        boolean enabled,
        Instant createdAt
) {

    public static UserResponse self(User user) {
        return of(user, user.getQrToken());
    }

    public static UserResponse forAdmin(User user) {
        return of(user, null);
    }

    private static UserResponse of(User user, String qrToken) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getUserType() == null ? null : user.getUserType().name(),
                user.getDepartment(),
                qrToken,
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
