package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Role is required")
    private String role;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    private String status;

    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String passwordHash;
}
