package edu.cit.sertipiko.controller;

import edu.cit.sertipiko.security.AppUserDetails;
import edu.cit.sertipiko.service.AdminUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class DashboardController {

    private final AdminUserService adminUserService;

    public DashboardController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/api/participant/dashboard")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public Map<String, Object> participant(@AuthenticationPrincipal AppUserDetails user) {
        return base(user, "Participant dashboard");
    }

    @GetMapping("/api/organizer/dashboard")
    @PreAuthorize("hasRole('ORGANIZER')")
    public Map<String, Object> organizer(@AuthenticationPrincipal AppUserDetails user) {
        return base(user, "Organizer dashboard");
    }

    @GetMapping("/api/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> admin(@AuthenticationPrincipal AppUserDetails user) {
        Map<String, Object> body = base(user, "Administrator dashboard");
        body.put("summary", adminUserService.summary());
        return body;
    }

    private Map<String, Object> base(AppUserDetails user, String title) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", title);
        body.put("role", user.getRole().name());
        body.put("fullName", user.getFullName());
        return body;
    }
}
