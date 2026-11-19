package edu.cit.sertipiko.repository;

import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByQrToken(String qrToken);

    boolean existsByRole(Role role);

    long countByRole(Role role);

    long countByStatus(UserStatus status);
}
