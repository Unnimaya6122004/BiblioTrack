package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BookUpdateRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    private String title;

    @Size(max = 20, message = "ISBN must be at most 20 characters")
    private String isbn;

    private List<Integer> authorIds;

    private List<Integer> categoryIds;
}
