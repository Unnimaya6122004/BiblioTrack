package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopBookAnalyticsDTO {

    private Integer bookId;
    private String bookTitle;
    private long loanCount;
}
