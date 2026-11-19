package edu.cit.sertipiko.security;

import edu.cit.sertipiko.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public AppUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        return userRepository.findByEmail(normalized)
                .map(AppUserDetails::withPassword)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
