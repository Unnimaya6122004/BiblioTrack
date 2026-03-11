package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DefaulterAnalyticsDTO {

    private Integer userId;
    private String userName;
    private long overdueLoanCount;
    private BigDecimal unpaidFineTotal;
}
