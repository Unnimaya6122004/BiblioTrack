package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ReservationResponseDTO {

    private Integer id;

    private Integer userId;
    private String userName;

    private Integer bookId;
    private String bookTitle;

    private LocalDate reservationDate;

    private String status;
}