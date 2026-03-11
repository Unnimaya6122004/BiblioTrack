package com.example.demo.controller;

import java.time.Duration;
import java.util.Locale;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.security.JwtService;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final String AUTH_COOKIE_NAME = "auth_token";
    private static final Duration AUTH_COOKIE_MAX_AGE = Duration.ofDays(7);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            token = jwtService.generateToken(userDetails);
        } else {
            token = jwtService.generateToken(request.getEmail());
        }

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> normalizeRole(grantedAuthority.getAuthority()))
                .orElse("MEMBER");

        String email = principal instanceof UserDetails userDetails
                ? userDetails.getUsername()
                : request.getEmail().trim();

        ResponseCookie authCookie = ResponseCookie.from(AUTH_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(AUTH_COOKIE_MAX_AGE)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, authCookie.toString());

        // Keep token in response for compatibility with existing clients.
        return new AuthResponse(token, role, email, "Login successful");
    }

    @PostMapping("/logout")
    public AuthResponse logout(HttpServletResponse response) {
        ResponseCookie expiredCookie = ResponseCookie.from(AUTH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
        return new AuthResponse(null, null, null, "Logout successful");
    }

    private String normalizeRole(String authority) {
        if (authority == null) {
            return "MEMBER";
        }

        String normalized = authority.replace("ROLE_", "").trim().toUpperCase(Locale.ROOT);
        if ("USER".equals(normalized)) {
            return "MEMBER";
        }

        if ("ADMIN".equals(normalized)) {
            return "ADMIN";
        }

        return "MEMBER";
    }
}
