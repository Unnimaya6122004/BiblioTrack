package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookResponseDTO {

    private Integer id;
    private String title;
    private String isbn;
    private LocalDateTime createdAt;
}
