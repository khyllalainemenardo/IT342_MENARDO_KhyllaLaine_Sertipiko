package edu.cit.sertipiko.service;

import edu.cit.sertipiko.config.AppProperties;
import edu.cit.sertipiko.dto.ChangePasswordRequest;
import edu.cit.sertipiko.dto.ResetPasswordRequest;
import edu.cit.sertipiko.entity.PasswordResetToken;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.exception.ApiException;
import edu.cit.sertipiko.repository.PasswordResetTokenRepository;
import edu.cit.sertipiko.repository.UserRepository;
import edu.cit.sertipiko.security.LoginAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordService {

    private static final String INVALID_LINK = "This reset link is invalid or has expired. Please request a new one.";
    private static final int MAX_RESET_REQUESTS = 3;
    private static final Duration RESET_REQUEST_WINDOW = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenGenerator tokenGenerator;
    private final EmailService emailService;
    private final LoginAttemptService loginAttemptService;
    private final AppProperties appProperties;
    private final Map<String, Deque<Instant>> resetRequests = new ConcurrentHashMap<>();

    public PasswordService(UserRepository userRepository,
                           PasswordResetTokenRepository tokenRepository,
                           PasswordEncoder passwordEncoder,
                           TokenGenerator tokenGenerator,
                           EmailService emailService,
                           LoginAttemptService loginAttemptService,
                           AppProperties appProperties) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenGenerator = tokenGenerator;
        this.emailService = emailService;
        this.loginAttemptService = loginAttemptService;
        this.appProperties = appProperties;
    }

    @Transactional
    public User changePassword(Long userId, ChangePasswordRequest request, Instant changedAt) {
        String attemptKey = "change:" + userId;
        loginAttemptService.checkAllowed(attemptKey);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid."));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            loginAttemptService.recordFailure(attemptKey);
            throw ApiException.field("currentPassword", "Current password is incorrect.");
        }
        loginAttemptService.reset(attemptKey);

        validateNewPassword(user, request.newPassword(), request.confirmPassword());
        applyNewPassword(user, request.newPassword(), changedAt);
        return userRepository.save(user);
    }

    @Transactional
    public void requestReset(String rawEmail) {
        String email = AuthService.normalizeEmail(rawEmail);
        if (!allowResetRequest(email)) {
            return;
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.isActive()) {
            return;
        }

        Instant now = Instant.now();
        invalidateOpenTokens(user.getId(), now);

        String rawToken = tokenGenerator.newToken();
        int minutes = appProperties.resetExpiryMinutes();
        tokenRepository.save(new PasswordResetToken(user, hash(rawToken), now.plus(Duration.ofMinutes(minutes))));

        String link = appProperties.normalizedFrontendUrl() + "/reset-password?token=" + rawToken;
        emailService.sendPasswordReset(user.getEmail(), user.getFullName(), link, minutes);
    }

    @Transactional(readOnly = true)
    public void validateToken(String rawToken) {
        findUsableToken(rawToken, Instant.now());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
        PasswordResetToken token = findUsableToken(request.token(), now);
        User user = token.getUser();
        if (!user.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_LINK);
        }

        validateNewPassword(user, request.newPassword(), request.confirmPassword());
        applyNewPassword(user, request.newPassword(), now);
        userRepository.save(user);

        token.markUsed(now);
        invalidateOpenTokens(user.getId(), now);
        loginAttemptService.reset(user.getEmail());
    }

    private PasswordResetToken findUsableToken(String rawToken, Instant now) {
        if (rawToken == null || rawToken.isBlank() || rawToken.length() > 128) {
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_LINK);
        }
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken.trim()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_LINK));
        if (!token.isUsable(now)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_LINK);
        }
        return token;
    }

    private void validateNewPassword(User user, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw ApiException.field("confirmPassword", "Passwords do not match.");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw ApiException.field("newPassword", "New password must be different from your current password.");
        }
    }

    private void applyNewPassword(User user, String newPassword, Instant changedAt) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(changedAt);
    }

    private void invalidateOpenTokens(Long userId, Instant now) {
        for (PasswordResetToken open : tokenRepository.findAllByUser_IdAndUsedAtIsNull(userId)) {
            open.markUsed(now);
        }
    }

    private boolean allowResetRequest(String email) {
        Instant now = Instant.now();
        Deque<Instant> times = resetRequests.computeIfAbsent(email, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && times.peekFirst().isBefore(now.minus(RESET_REQUEST_WINDOW))) {
                times.pollFirst();
            }
            if (times.size() >= MAX_RESET_REQUESTS) {
                return false;
            }
            times.addLast(now);
            return true;
        }
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
