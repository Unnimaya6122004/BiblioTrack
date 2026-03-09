package com.example.demo.controller;

import com.example.demo.dto.AuthorResponseDTO;
import com.example.demo.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public List<AuthorResponseDTO> getAllAuthors() {
        return authorService.getAllAuthors();
    }
}
