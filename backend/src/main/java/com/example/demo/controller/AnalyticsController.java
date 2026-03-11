package com.example.demo.controller;

import com.example.demo.dto.AdminAnalyticsResponseDTO;
import com.example.demo.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminAnalyticsResponseDTO getAdminAnalytics() {
        return analyticsService.getAdminAnalytics();
    }
}
