package com.example.demo.service;

import com.example.demo.dto.LoanRequest;
import com.example.demo.dto.LoanResponseDTO;
import com.example.demo.entity.BookCopy;
import com.example.demo.entity.Fine;
import com.example.demo.entity.Loan;
import com.example.demo.entity.Reservation;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.BookCopyStatus;
import com.example.demo.entity.enums.FineStatus;
import com.example.demo.entity.enums.LoanStatus;
import com.example.demo.entity.enums.ReservationStatus;
import com.example.demo.entity.enums.UserStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookCopyRepository;
import com.example.demo.repository.FineRepository;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.ReservationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanService {

    private static final BigDecimal MAX_UNPAID_FINE_LIMIT = BigDecimal.valueOf(500);

    private final LoanRepository loanRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final ReservationRepository reservationRepository;

    public Page<LoanResponseDTO> getAll(String status, Pageable pageable) {
        if (StringUtils.hasText(status)) {
            LoanStatus loanStatus = parseLoanStatus(status);
            return loanRepository.findByStatus(loanStatus, pageable).map(this::mapToDTO);
        }
        return loanRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional
    public LoanResponseDTO createLoan(LoanRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (UserStatus.BLOCKED.equals(user.getStatus())) {
            throw new BadRequestException("Blocked users cannot issue books");
        }

        long issuedLoanCount = loanRepository.countByUserIdAndStatus(user.getId(), LoanStatus.ISSUED);
        if (issuedLoanCount >= 5) {
            throw new BadRequestException("User already has maximum active loans (5)");
        }

        boolean hasUnpaidFine = fineRepository.existsByUserIdAndStatus(user.getId(), FineStatus.UNPAID);
        if (hasUnpaidFine) {
            log.warn("Blocked loan issue: userId={} has unpaid fines", user.getId());
            throw new BadRequestException("User has unpaid fines. Cannot issue book.");
        }

        BigDecimal unpaidFineTotal = fineRepository.sumAmountByUserIdAndStatus(user.getId(), FineStatus.UNPAID);
        if (unpaidFineTotal.compareTo(MAX_UNPAID_FINE_LIMIT) > 0) {
            throw new BadRequestException("User unpaid fine total exceeds 500. Cannot issue book.");
        }

        BookCopy bookCopy = bookCopyRepository.findById(request.getBookCopyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found with id: " + request.getBookCopyId()));

        if (bookCopy.getBook() != null && bookCopy.getBook().isDeleted()) {
            throw new BadRequestException("Cannot issue a copy for a deleted book");
        }

        if (!BookCopyStatus.AVAILABLE.equals(bookCopy.getStatus())) {
            throw new BadRequestException("Book copy is not available");
        }

        Reservation activeReservation = reservationRepository
                .findFirstByUserIdAndBookIdAndStatus(
                        user.getId(),
                        bookCopy.getBook().getId(),
                        ReservationStatus.ACTIVE
                )
                .orElse(null);
        if (activeReservation != null) {
            activeReservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(activeReservation);
            log.info("Reservation completed on loan issue: reservationId={}, userId={}, bookId={}",
                    activeReservation.getId(), user.getId(), bookCopy.getBook().getId());
        }

        Loan loan = new Loan();
        loan.setUser(user);
        loan.setBookCopy(bookCopy);

        LocalDate issueDate = LocalDate.now();
        loan.setIssueDate(issueDate);
        loan.setDueDate(issueDate.plusMonths(1));
        loan.setStatus(LoanStatus.ISSUED);

        bookCopy.setStatus(BookCopyStatus.ISSUED);
        bookCopyRepository.save(bookCopy);

        Loan savedLoan = loanRepository.save(loan);
        log.info("Loan issued: loanId={}, userId={}, bookCopyId={}", savedLoan.getId(), user.getId(), bookCopy.getId());

        return mapToDTO(savedLoan);
    }

    @Transactional
    public LoanResponseDTO returnBook(Integer loanId) {

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found with id: " + loanId));

        if (!LoanStatus.ISSUED.equals(loan.getStatus())) {
            throw new BadRequestException("Loan is already returned");
        }

        LocalDate returnDate = LocalDate.now();

        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnDate(returnDate);

        BookCopy bookCopy = loan.getBookCopy();
        bookCopy.setStatus(BookCopyStatus.AVAILABLE);
        bookCopyRepository.save(bookCopy);

        Reservation nextReservation = reservationRepository
                .findFirstByBookIdAndStatusOrderByReservationDateAsc(
                        bookCopy.getBook().getId(),
                        ReservationStatus.ACTIVE
                )
                .orElse(null);
        if (nextReservation != null) {
            nextReservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(nextReservation);
            log.info("First queued reservation completed on return: reservationId={}, userId={}, bookId={}, bookCopyId={}",
                    nextReservation.getId(),
                    nextReservation.getUser().getId(),
                    bookCopy.getBook().getId(),
                    bookCopy.getId());

            bookCopy.setStatus(BookCopyStatus.ISSUED);
            bookCopyRepository.save(bookCopy);

            // Optional enhancement: automatically create a new Loan
            // for the reserved user with this issued copy.
        }

        if (returnDate.isAfter(loan.getDueDate())) {
            boolean fineExists = fineRepository
                    .findByLoanIdAndStatus(loan.getId(), FineStatus.UNPAID)
                    .isPresent();

            if (!fineExists) {
                long daysLate = ChronoUnit.DAYS.between(loan.getDueDate(), returnDate);

                BigDecimal fineAmount = BigDecimal
                        .valueOf(daysLate)
                        .multiply(BigDecimal.valueOf(20));

                Fine fine = Fine.builder()
                        .loan(loan)
                        .user(loan.getUser())
                        .amount(fineAmount)
                        .issuedDate(returnDate)
                        .status(FineStatus.UNPAID)
                        .build();

                fineRepository.save(fine);
                log.info("Fine created: loanId={}, amount={}", loan.getId(), fineAmount);
            }
        }

        Loan updatedLoan = loanRepository.save(loan);
        return mapToDTO(updatedLoan);
    }

    private LoanResponseDTO mapToDTO(Loan loan) {

        return LoanResponseDTO.builder()
                .id(loan.getId())
                .userId(loan.getUser().getId())
                .userName(loan.getUser().getFullName())
                .userEmail(loan.getUser().getEmail())
                .bookId(loan.getBookCopy().getBook().getId())
                .bookTitle(loan.getBookCopy().getBook().getTitle())
                .barcode(loan.getBookCopy().getBarcode())
                .issueDate(loan.getIssueDate())
                .dueDate(loan.getDueDate())
                .returnDate(loan.getReturnDate())
                .status(loan.getStatus() != null ? loan.getStatus().name() : null)
                .build();
    }

    private LoanStatus parseLoanStatus(String value) {
        try {
            return LoanStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid loan status: " + value);
        }
    }
}
