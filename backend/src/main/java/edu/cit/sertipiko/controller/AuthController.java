package edu.cit.sertipiko.controller;

import edu.cit.sertipiko.dto.LoginRequest;
import edu.cit.sertipiko.dto.RegisterRequest;
import edu.cit.sertipiko.dto.UserResponse;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.exception.ApiException;
import edu.cit.sertipiko.repository.UserRepository;
import edu.cit.sertipiko.security.AppUserDetails;
import edu.cit.sertipiko.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public AuthController(AuthService authService,
                          UserRepository userRepository,
                          SecurityContextRepository securityContextRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/csrf")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void csrf() {
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return UserResponse.forAdmin(authService.register(request));
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest httpRequest,
                              HttpServletResponse httpResponse) {
        User user = authService.authenticate(request);
        AppUserDetails principal = AppUserDetails.from(user);

        if (httpRequest.getSession(false) != null) {
            httpRequest.changeSessionId();
        }

        SecurityContext context = holder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities()));
        holder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return UserResponse.self(user);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AppUserDetails principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "You need to sign in to access this resource.");
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid."));
        return UserResponse.self(user);
    }
}
