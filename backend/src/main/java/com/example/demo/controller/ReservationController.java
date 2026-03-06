package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ReservationCreateRequest;
import com.example.demo.dto.ReservationResponseDTO;
import com.example.demo.dto.UpdateReservationStatusRequest;
import com.example.demo.service.ReservationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ReservationResponseDTO create(@Valid @RequestBody ReservationCreateRequest request) {
        return reservationService.createReservation(request.getUserId(), request.getBookId());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<ReservationResponseDTO> getAll(Pageable pageable) {
        return reservationService.getAll(pageable);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ReservationResponseDTO updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request) {

        return reservationService.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public void cancel(@PathVariable Long id) {
        reservationService.cancelReservation(id);
    }
}
