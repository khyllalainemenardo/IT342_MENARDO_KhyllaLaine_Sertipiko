package edu.cit.sertipiko.security;

import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

public class SessionUserRefreshFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public SessionUserRefreshFilter(UserRepository userRepository, SecurityContextRepository securityContextRepository) {
        this.userRepository = userRepository;
        this.securityContextRepository = securityContextRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication auth = holder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AppUserDetails principal) {
            Optional<User> current = userRepository.findById(principal.getId());
            if (current.isEmpty() || !current.get().isActive()) {
                holder.clearContext();
                HttpSession session = request.getSession(false);
                if (session != null) {
                    session.invalidate();
                }
            } else if (current.get().getRole() != principal.getRole()
                    || !Objects.equals(current.get().getFullName(), principal.getFullName())) {
                AppUserDetails refreshed = AppUserDetails.from(current.get());
                SecurityContext context = holder.createEmptyContext();
                context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                        refreshed, null, refreshed.getAuthorities()));
                holder.setContext(context);
                securityContextRepository.saveContext(context, request, response);
            }
        }
        chain.doFilter(request, response);
    }
}
