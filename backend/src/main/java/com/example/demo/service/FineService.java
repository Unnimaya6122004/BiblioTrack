package com.example.demo.service;

import com.example.demo.dto.FineResponseDTO;
import com.example.demo.entity.Fine;
import com.example.demo.entity.enums.FineStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FineService {

    private final FineRepository fineRepository;

    public Page<FineResponseDTO> getAll(Pageable pageable) {
        return fineRepository.findAll(pageable).map(this::mapToDTO);
    }

    public Page<FineResponseDTO> getByLoan(Integer loanId, Pageable pageable) {
        return fineRepository.findByLoanId(loanId, pageable).map(this::mapToDTO);
    }

    public BigDecimal getTotalUnpaidByUser(Integer userId) {
        return fineRepository.sumAmountByUserIdAndStatus(userId, FineStatus.UNPAID);
    }

    @Transactional
    public FineResponseDTO payFine(Integer fineId) {

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Fine not found with id: " + fineId));

        if (FineStatus.PAID.equals(fine.getStatus())) {
            throw new BadRequestException("Fine already paid");
        }

        fine.setStatus(FineStatus.PAID);
        fine.setPaidDate(LocalDate.now());

        Fine updatedFine = fineRepository.save(fine);

        return mapToDTO(updatedFine);
    }

    private FineResponseDTO mapToDTO(Fine fine) {

        return FineResponseDTO.builder()
                .id(fine.getId())
                .loanId(fine.getLoan().getId())
                .userId(fine.getLoan().getUser().getId())
                .userName(fine.getLoan().getUser().getFullName())
                .amount(fine.getAmount())
                .issuedDate(fine.getIssuedDate())
                .paidDate(fine.getPaidDate())
                .status(fine.getStatus() != null ? fine.getStatus().name() : null)
                .build();
    }
}
