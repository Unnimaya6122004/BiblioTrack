package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {

    private Integer id;
    private String fullName;
    private String email;
    private String role;
    private String phone;
    private String status;
}