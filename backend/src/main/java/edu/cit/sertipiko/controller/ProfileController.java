package edu.cit.sertipiko.controller;

import edu.cit.sertipiko.dto.UpdateProfileRequest;
import edu.cit.sertipiko.dto.UserResponse;
import edu.cit.sertipiko.security.AppUserDetails;
import edu.cit.sertipiko.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserResponse get(@AuthenticationPrincipal AppUserDetails principal) {
        return UserResponse.self(profileService.get(principal.getId()));
    }

    @PutMapping
    public UserResponse update(@AuthenticationPrincipal AppUserDetails principal,
                               @Valid @RequestBody UpdateProfileRequest request) {
        return UserResponse.self(profileService.update(principal.getId(), request));
    }
}
