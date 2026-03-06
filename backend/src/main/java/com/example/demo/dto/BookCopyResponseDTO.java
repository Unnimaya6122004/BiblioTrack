package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookCopyResponseDTO {

    private Integer id;
    private Integer bookId;
    private String bookTitle;
    private String barcode;
    private String rackLocation;
    private String status;
}
