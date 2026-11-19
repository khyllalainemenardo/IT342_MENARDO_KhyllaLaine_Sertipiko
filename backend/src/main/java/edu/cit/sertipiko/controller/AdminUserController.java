package edu.cit.sertipiko.controller;

import edu.cit.sertipiko.dto.UpdateNameRequest;
import edu.cit.sertipiko.dto.UpdateRoleRequest;
import edu.cit.sertipiko.dto.UpdateStatusRequest;
import edu.cit.sertipiko.dto.UserResponse;
import edu.cit.sertipiko.entity.Role;
import edu.cit.sertipiko.security.AppUserDetails;
import edu.cit.sertipiko.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<UserResponse> list(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) Role role) {
        return adminUserService.search(search, role).stream()
                .map(UserResponse::forAdmin)
                .toList();
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(@AuthenticationPrincipal AppUserDetails admin,
                                   @PathVariable Long id,
                                   @Valid @RequestBody UpdateRoleRequest request) {
        return UserResponse.forAdmin(adminUserService.updateRole(admin.getId(), id, request.role()));
    }

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(@AuthenticationPrincipal AppUserDetails admin,
                                     @PathVariable Long id,
                                     @Valid @RequestBody UpdateStatusRequest request) {
        return UserResponse.forAdmin(adminUserService.updateStatus(admin.getId(), id, request.enabled()));
    }

    @PatchMapping("/{id}/name")
    public UserResponse updateName(@PathVariable Long id,
                                   @Valid @RequestBody UpdateNameRequest request) {
        return UserResponse.forAdmin(adminUserService.updateName(id, request.fullName()));
    }
}
