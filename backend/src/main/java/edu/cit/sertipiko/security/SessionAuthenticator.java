package edu.cit.sertipiko.security;

import edu.cit.sertipiko.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SessionAuthenticator {

    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public SessionAuthenticator(SecurityContextRepository securityContextRepository) {
        this.securityContextRepository = securityContextRepository;
    }

    public void signIn(User user, Instant authenticatedAt, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        AppUserDetails principal = AppUserDetails.from(user, authenticatedAt);
        SecurityContext context = holder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities()));
        holder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
