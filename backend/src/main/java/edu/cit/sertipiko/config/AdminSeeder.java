package edu.cit.sertipiko.config;

import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.entity.UserStatus;
import edu.cit.sertipiko.repository.UserRepository;
import edu.cit.sertipiko.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final AppProperties appProperties;

    public AdminSeeder(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthService authService,
                       AppProperties appProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.appProperties = appProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }
        AppProperties.Admin admin = appProperties.admin();
        if (admin == null || !StringUtils.hasText(admin.email()) || !StringUtils.hasText(admin.password())) {
            log.warn("No administrator account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.");
            return;
        }

        String email = AuthService.normalizeEmail(admin.email());
        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(AuthService.normalizeName(
                StringUtils.hasText(admin.fullName()) ? admin.fullName() : "System Administrator"));
        user.setPasswordHash(passwordEncoder.encode(admin.password()));
        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        if (user.getQrToken() == null) {
            user.setQrToken(authService.newUniqueQrToken());
        }
        userRepository.save(user);
        log.info("Administrator account ready: {}", email);
    }
}
