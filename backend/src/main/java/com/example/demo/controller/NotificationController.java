package com.example.demo.controller;

import com.example.demo.dto.NotificationCreateRequest;
import com.example.demo.dto.NotificationResponseDTO;
import com.example.demo.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<NotificationResponseDTO> getAll(Pageable pageable,
                                                Authentication authentication) {
        return notificationService.getAll(pageable, authentication != null ? authentication.getName() : null);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public long getUnreadCount(Authentication authentication) {
        return notificationService.getUnreadCount(authentication != null ? authentication.getName() : null);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationResponseDTO create(@Valid @RequestBody NotificationCreateRequest request,
                                          Authentication authentication) {
        return notificationService.create(request, authentication != null ? authentication.getName() : null);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public NotificationResponseDTO markAsRead(@PathVariable Integer id,
                                              Authentication authentication) {
        return notificationService.markAsRead(id, authentication != null ? authentication.getName() : null);
    }
}
