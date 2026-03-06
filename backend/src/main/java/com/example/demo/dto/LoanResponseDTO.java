package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class LoanResponseDTO {

    private Integer id;

    private Integer userId;
    private String userName;
    private String userEmail;

    private Integer bookId;
    private String bookTitle;
    private String barcode;

    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private String status;
}