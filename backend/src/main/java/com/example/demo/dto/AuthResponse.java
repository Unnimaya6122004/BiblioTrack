package com.example.demo.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String email;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(String token, String role, String email, String message) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public String getMessage() {
        return message;
    }
}
