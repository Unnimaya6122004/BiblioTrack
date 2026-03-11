package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.dto.BookCopyRequest;
import com.example.demo.dto.BookCopyResponseDTO;
import com.example.demo.service.BookCopyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/book-copies")
@RequiredArgsConstructor
public class BookCopyController {

    private final BookCopyService bookCopyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<BookCopyResponseDTO> getAll(
            @RequestParam(required = false) String barcode,
            Pageable pageable) {
        return bookCopyService.getAll(barcode, pageable);
    }

    @PostMapping("/{bookId}")
    @PreAuthorize("hasRole('ADMIN')")
    public BookCopyResponseDTO create(
            @PathVariable Integer bookId,
            @Valid @RequestBody BookCopyRequest request) {

        return bookCopyService.create(bookId, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id) {
        bookCopyService.delete(id);
    }
}
