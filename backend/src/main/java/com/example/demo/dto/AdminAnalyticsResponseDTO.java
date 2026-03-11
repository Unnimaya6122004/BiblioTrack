package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminAnalyticsResponseDTO {

    private List<TopBookAnalyticsDTO> topBooks;
    private List<DefaulterAnalyticsDTO> defaulters;
    private List<FineTrendPointDTO> fineTrends;
}
