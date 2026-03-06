package com.example.demo.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoanRequest;
import com.example.demo.dto.LoanResponseDTO;
import com.example.demo.service.LoanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<LoanResponseDTO> getAll(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return loanService.getAll(status, pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public LoanResponseDTO issue(@Valid @RequestBody LoanRequest request) {
        return loanService.createLoan(request);
    }

    @PutMapping("/{loanId}")
    @PreAuthorize("hasRole('ADMIN')")
    public LoanResponseDTO returnBook(@PathVariable Integer loanId) {
        return loanService.returnBook(loanId);
    }
}
