package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BookCopyRequest {

    @NotBlank(message = "Barcode is required")
    @Size(min = 2, max = 50, message = "Barcode must be between 2 and 50 characters")
    private String barcode;

    @Size(max = 50, message = "Rack location must be at most 50 characters")
    private String rackLocation;
}
