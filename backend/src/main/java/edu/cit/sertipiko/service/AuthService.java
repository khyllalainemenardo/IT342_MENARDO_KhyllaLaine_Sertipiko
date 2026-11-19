package edu.cit.sertipiko.service;

import edu.cit.sertipiko.config.AppProperties;
import edu.cit.sertipiko.dto.LoginRequest;
import edu.cit.sertipiko.dto.RegisterRequest;
import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.entity.UserStatus;
import edu.cit.sertipiko.exception.ApiException;
import edu.cit.sertipiko.repository.UserRepository;
import edu.cit.sertipiko.security.LoginAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenGenerator tokenGenerator;
    private final LoginAttemptService loginAttemptService;
    private final AppProperties appProperties;
    private final String dummyHash;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       TokenGenerator tokenGenerator,
                       LoginAttemptService loginAttemptService,
                       AppProperties appProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenGenerator = tokenGenerator;
        this.loginAttemptService = loginAttemptService;
        this.appProperties = appProperties;
        this.dummyHash = passwordEncoder.encode(tokenGenerator.newToken());
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String domain = appProperties.normalizedDomain();

        if (!domain.isEmpty() && !email.endsWith("@" + domain)) {
            throw ApiException.field("email", "Use your school email (@" + domain + ").");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw ApiException.field("confirmPassword", "Passwords do not match.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.",
                    Map.of("email", "An account with this email already exists."));
        }

        User user = new User();
        user.setEmail(email);
        user.setFullName(normalizeName(request.fullName()));
        user.setDepartment(request.department().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.PARTICIPANT);
        user.setStatus(UserStatus.ACTIVE);
        user.setQrToken(newUniqueQrToken());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(LoginRequest request) {
        String email = normalizeEmail(request.email());
        loginAttemptService.checkAllowed(email);

        User user = userRepository.findByEmail(email).orElse(null);
        String hash = user != null ? user.getPasswordHash() : dummyHash;
        boolean passwordMatches = passwordEncoder.matches(request.password(), hash);

        if (user == null || !passwordMatches) {
            loginAttemptService.recordFailure(email);
            throw new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS);
        }
        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Your account has been disabled. Please contact the administrator.");
        }

        loginAttemptService.reset(email);
        return user;
    }

    public String newUniqueQrToken() {
        String token;
        do {
            token = tokenGenerator.newToken();
        } while (userRepository.existsByQrToken(token));
        return token;
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeName(String name) {
        return name == null ? "" : name.trim().replaceAll("\\s+", " ");
    }
}
