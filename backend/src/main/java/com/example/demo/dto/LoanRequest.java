package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoanRequest {

    @NotNull(message = "User id is required")
    private Integer userId;

    @NotNull(message = "Book copy id is required")
    private Integer bookCopyId;
}
