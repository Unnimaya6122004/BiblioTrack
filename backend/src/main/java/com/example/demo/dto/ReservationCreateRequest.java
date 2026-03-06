package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationCreateRequest {

    @NotNull(message = "User id is required")
    private Integer userId;

    @NotNull(message = "Book id is required")
    private Integer bookId;
}
