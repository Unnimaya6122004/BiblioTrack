package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FineTrendPointDTO {

    private String month;
    private BigDecimal raisedAmount;
    private BigDecimal paidAmount;
}
