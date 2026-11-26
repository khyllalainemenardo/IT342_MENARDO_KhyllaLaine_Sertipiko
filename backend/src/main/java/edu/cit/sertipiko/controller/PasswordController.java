package edu.cit.sertipiko.controller;

import edu.cit.sertipiko.dto.ChangePasswordRequest;
import edu.cit.sertipiko.dto.ForgotPasswordRequest;
import edu.cit.sertipiko.dto.ResetPasswordRequest;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.security.AppUserDetails;
import edu.cit.sertipiko.security.SessionAuthenticator;
import edu.cit.sertipiko.service.PasswordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordController {

    private final PasswordService passwordService;
    private final SessionAuthenticator sessionAuthenticator;

    public PasswordController(PasswordService passwordService, SessionAuthenticator sessionAuthenticator) {
        this.passwordService = passwordService;
        this.sessionAuthenticator = sessionAuthenticator;
    }

    @PostMapping("/change")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> change(@AuthenticationPrincipal AppUserDetails principal,
                                      @Valid @RequestBody ChangePasswordRequest request,
                                      HttpServletRequest httpRequest,
                                      HttpServletResponse httpResponse) {
        Instant changedAt = Instant.now().truncatedTo(ChronoUnit.MICROS);
        User user = passwordService.changePassword(principal.getId(), request, changedAt);
        sessionAuthenticator.signIn(user, changedAt, httpRequest, httpResponse);
        return Map.of("message", "Your password has been changed. Other devices have been signed out.");
    }

    @PostMapping("/forgot")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, String> forgot(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordService.requestReset(request.email());
        return Map.of("message",
                "If an account exists for that email, a password reset link has been sent. Check your inbox.");
    }

    @GetMapping("/reset/validate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void validate(@RequestParam String token) {
        passwordService.validateToken(token);
    }

    @PostMapping("/reset")
    public Map<String, String> reset(@Valid @RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request);
        return Map.of("message", "Your password has been reset. You can now sign in with your new password.");
    }
}
