package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.BookCreateRequestDTO;
import com.example.demo.dto.BookResponseDTO;
import com.example.demo.dto.BookUpdateRequestDTO;
import com.example.demo.service.BookService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping(params = "!id")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<BookResponseDTO> getAllBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return bookService.getAllBooks(title, author, category, pageable);
    }

    @GetMapping(params = "id")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public BookResponseDTO getBookById(@RequestParam Integer id) {
        return bookService.getBookById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public BookResponseDTO createBook(@Valid @RequestBody BookCreateRequestDTO request) {
        return bookService.createBook(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public BookResponseDTO updateBook(@PathVariable Integer id,
                                      @Valid @RequestBody BookUpdateRequestDTO request) {
        return bookService.updateBook(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteBook(@PathVariable Integer id) {
        bookService.deleteBook(id);
    }
}
