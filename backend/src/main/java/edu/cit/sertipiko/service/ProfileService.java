package edu.cit.sertipiko.service;

import edu.cit.sertipiko.dto.UpdateProfileRequest;
import edu.cit.sertipiko.entity.User;
import edu.cit.sertipiko.exception.ApiException;
import edu.cit.sertipiko.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User get(Long userId) {
        return find(userId);
    }

    @Transactional
    public User update(Long userId, UpdateProfileRequest request) {
        User user = find(userId);
        user.setDepartment(request.department().trim().replaceAll("\\s+", " "));
        user.setUserType(request.userType());
        return userRepository.save(user);
    }

    private User find(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid."));
    }
}
