package edu.cit.sertipiko.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.sertipiko.dto.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JsonSecurityHandlers {

    private final ObjectMapper objectMapper;

    public JsonSecurityHandlers(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AuthenticationEntryPoint entryPoint() {
        return (request, response, ex) ->
                write(response, 401, "You need to sign in to access this resource.");
    }

    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> {
            String message = ex instanceof CsrfException
                    ? "Your security token has expired. Refresh the page and try again."
                    : "You do not have permission to access this resource.";
            write(response, 403, message);
        };
    }

    private void write(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ApiError.of(status, message));
    }
}
