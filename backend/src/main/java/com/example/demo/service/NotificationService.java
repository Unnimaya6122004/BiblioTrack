package com.example.demo.service;

import com.example.demo.dto.NotificationCreateRequest;
import com.example.demo.dto.NotificationResponseDTO;
import com.example.demo.entity.Notification;
import com.example.demo.entity.NotificationRead;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.NotificationReadRepository;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    private final UserRepository userRepository;

    public Page<NotificationResponseDTO> getAll(Pageable pageable, String userEmail) {
        User currentUser = resolveCurrentUser(userEmail);
        Page<Notification> notificationPage = notificationRepository.findAllByOrderByCreatedAtDescIdDesc(pageable);

        List<Notification> notifications = notificationPage.getContent();
        List<Integer> notificationIds = notifications.stream().map(Notification::getId).toList();
        Map<Integer, LocalDateTime> readAtByNotificationId = new HashMap<>();

        if (!notificationIds.isEmpty()) {
            List<NotificationRead> reads = notificationReadRepository
                    .findByUserIdAndNotificationIdIn(currentUser.getId(), notificationIds);
            for (NotificationRead read : reads) {
                readAtByNotificationId.put(read.getNotification().getId(), read.getReadAt());
            }
        }

        List<NotificationResponseDTO> dtoContent = notifications.stream()
                .map(notification -> mapToDTO(
                        notification,
                        readAtByNotificationId.get(notification.getId())
                ))
                .toList();

        return new PageImpl<>(dtoContent, pageable, notificationPage.getTotalElements());
    }

    @Transactional
    public NotificationResponseDTO create(NotificationCreateRequest request, String creatorEmail) {
        User creator = resolveCurrentUser(creatorEmail);

        Notification notification = Notification.builder()
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        return mapToDTO(savedNotification, null);
    }

    @Transactional
    public NotificationResponseDTO markAsRead(Integer notificationId, String userEmail) {
        User currentUser = resolveCurrentUser(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + notificationId));

        NotificationRead read = notificationReadRepository
                .findByUserIdAndNotificationId(currentUser.getId(), notificationId)
                .orElseGet(() -> NotificationRead.builder()
                        .user(currentUser)
                        .notification(notification)
                        .readAt(LocalDateTime.now())
                        .build());

        if (read.getId() == null) {
            read = notificationReadRepository.save(read);
        }

        return mapToDTO(notification, read.getReadAt());
    }

    public long getUnreadCount(String userEmail) {
        User currentUser = resolveCurrentUser(userEmail);
        return notificationRepository.countUnreadByUserId(currentUser.getId());
    }

    private User resolveCurrentUser(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Unable to resolve current user");
        }

        return userRepository.findByEmailAndDeletedFalse(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with email: " + email));
    }

    private NotificationResponseDTO mapToDTO(Notification notification, LocalDateTime readAt) {
        User creator = notification.getCreatedBy();
        boolean isRead = readAt != null;

        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .createdByUserId(creator != null ? creator.getId() : null)
                .createdByName(creator != null ? creator.getFullName() : "System")
                .createdAt(notification.getCreatedAt())
                .read(isRead)
                .readAt(readAt)
                .build();
    }
}
