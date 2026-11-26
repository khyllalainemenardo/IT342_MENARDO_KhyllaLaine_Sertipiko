package edu.cit.sertipiko.security;

import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public class AppUserDetails implements UserDetails {

    private static final long serialVersionUID = 2L;

    private final Long id;
    private final String email;
    private final String fullName;
    private final Role role;
    private final boolean enabled;
    private final String passwordHash;
    private final Instant authenticatedAt;

    private AppUserDetails(Long id, String email, String fullName, Role role, boolean enabled,
                           String passwordHash, Instant authenticatedAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.enabled = enabled;
        this.passwordHash = passwordHash;
        this.authenticatedAt = authenticatedAt;
    }

    public static AppUserDetails from(User user, Instant authenticatedAt) {
        return new AppUserDetails(user.getId(), user.getEmail(), user.getFullName(),
                user.getRole(), user.isActive(), null, authenticatedAt);
    }

    public static AppUserDetails withPassword(User user) {
        return new AppUserDetails(user.getId(), user.getEmail(), user.getFullName(),
                user.getRole(), user.isActive(), user.getPasswordHash(), null);
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public Role getRole() {
        return role;
    }

    public Instant getAuthenticatedAt() {
        return authenticatedAt;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
