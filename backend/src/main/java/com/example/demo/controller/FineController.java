package com.example.demo.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.FineResponseDTO;
import com.example.demo.service.FineService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping(params = {"!loanId", "!userId"})
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<FineResponseDTO> getAll(Pageable pageable) {
        return fineService.getAll(pageable);
    }

    @GetMapping(params = {"loanId", "!userId"})
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public Page<FineResponseDTO> getByLoan(@RequestParam Integer loanId, Pageable pageable) {
        return fineService.getByLoan(loanId, pageable);
    }

    @GetMapping(params = {"userId", "!loanId"})
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public BigDecimal getUnpaidTotal(@RequestParam Integer userId) {
        return fineService.getTotalUnpaidByUser(userId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public FineResponseDTO payFine(@PathVariable Integer id) {
        return fineService.payFine(id);
    }
}
