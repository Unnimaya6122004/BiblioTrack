package com.example.demo.dto;

import com.example.demo.entity.enums.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReservationStatusRequest {

    @NotNull(message = "Status is required")
    private ReservationStatus status;
}
