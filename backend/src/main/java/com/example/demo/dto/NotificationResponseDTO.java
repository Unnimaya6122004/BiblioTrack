package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {

    private Integer id;

    private String title;
    private String message;

    private Integer createdByUserId;
    private String createdByName;

    private LocalDateTime createdAt;

    private boolean read;
    private LocalDateTime readAt;
}
