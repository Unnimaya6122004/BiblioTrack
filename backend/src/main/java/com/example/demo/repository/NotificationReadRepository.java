package com.example.demo.repository;

import com.example.demo.entity.NotificationRead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationReadRepository extends JpaRepository<NotificationRead, Integer> {

    Optional<NotificationRead> findByUserIdAndNotificationId(Integer userId, Integer notificationId);

    List<NotificationRead> findByUserIdAndNotificationIdIn(Integer userId, List<Integer> notificationIds);
}
