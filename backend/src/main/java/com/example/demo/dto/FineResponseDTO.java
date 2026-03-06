package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class FineResponseDTO {

    private Integer id;

    private Integer loanId;

    private Integer userId;
    private String userName;

    private BigDecimal amount;

    private LocalDate issuedDate;
    private LocalDate paidDate;

    private String status;
}