package edu.cit.sertipiko.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String schoolDomain,
        String frontendUrl,
        Admin admin,
        PasswordReset passwordReset,
        Mail mail
) {

    public record Admin(String email, String password, String fullName) {
    }

    public record PasswordReset(int expiryMinutes) {
    }

    public record Mail(String brevoApiKey, String fromEmail, String fromName) {
    }

    public String normalizedDomain() {
        return schoolDomain == null ? "" : schoolDomain.trim().toLowerCase();
    }

    public String normalizedFrontendUrl() {
        String url = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl.trim();
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public int resetExpiryMinutes() {
        return passwordReset == null || passwordReset.expiryMinutes() <= 0 ? 30 : passwordReset.expiryMinutes();
    }
}
