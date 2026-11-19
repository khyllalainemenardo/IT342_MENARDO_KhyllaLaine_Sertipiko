package edu.cit.sertipiko.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final Map<String, String> errors;

    public ApiException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public ApiException(HttpStatus status, String message, Map<String, String> errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    public static ApiException field(String field, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message, Map.of(field, message));
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
