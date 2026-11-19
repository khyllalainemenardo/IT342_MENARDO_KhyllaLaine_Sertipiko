package edu.cit.sertipiko.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(
        int status,
        String message,
        Map<String, String> errors,
        Instant timestamp
) {

    public static ApiError of(int status, String message) {
        return new ApiError(status, message, null, Instant.now());
    }

    public static ApiError of(int status, String message, Map<String, String> errors) {
        return new ApiError(status, message, errors, Instant.now());
    }
}
