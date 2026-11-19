package edu.cit.sertipiko.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(String schoolDomain, Admin admin) {

    public record Admin(String email, String password, String fullName) {
    }

    public String normalizedDomain() {
        return schoolDomain == null ? "" : schoolDomain.trim().toLowerCase();
    }
}
