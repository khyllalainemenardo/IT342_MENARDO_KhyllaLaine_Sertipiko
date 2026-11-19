package edu.cit.sertipiko.service;

import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.entity.UserStatus;
import edu.cit.sertipiko.exception.ApiException;
import edu.cit.sertipiko.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<User> search(String search, Role role) {
        String q = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (!q.isEmpty()) {
                String pattern = "%" + q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern, '\\'),
                        cb.like(cb.lower(root.get("email")), pattern, '\\')));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public User updateRole(Long actorId, Long targetId, Role newRole) {
        if (newRole == Role.ADMIN) {
            throw ApiException.field("role", "The administrator role cannot be assigned here.");
        }
        User target = findManageable(actorId, targetId);
        target.setRole(newRole);
        return userRepository.save(target);
    }

    @Transactional
    public User updateStatus(Long actorId, Long targetId, boolean enabled) {
        User target = findManageable(actorId, targetId);
        target.setStatus(enabled ? UserStatus.ACTIVE : UserStatus.DISABLED);
        return userRepository.save(target);
    }

    @Transactional
    public User updateName(Long targetId, String fullName) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        target.setFullName(AuthService.normalizeName(fullName));
        return userRepository.save(target);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> summary() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "participants", userRepository.countByRole(Role.PARTICIPANT),
                "organizers", userRepository.countByRole(Role.ORGANIZER),
                "administrators", userRepository.countByRole(Role.ADMIN),
                "disabled", userRepository.countByStatus(UserStatus.DISABLED)
        );
    }

    private User findManageable(Long actorId, Long targetId) {
        if (actorId.equals(targetId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot change your own account here.");
        }
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
        if (target.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Administrator accounts cannot be changed here.");
        }
        return target;
    }
}
