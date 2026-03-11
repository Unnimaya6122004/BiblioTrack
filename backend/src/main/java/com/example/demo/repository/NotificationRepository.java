package com.example.demo.repository;

import com.example.demo.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Page<Notification> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    @Query("""
            select count(n) from Notification n
            where not exists (
                select 1 from NotificationRead nr
                where nr.notification.id = n.id and nr.user.id = :userId
            )
            """)
    long countUnreadByUserId(@Param("userId") Integer userId);
}
