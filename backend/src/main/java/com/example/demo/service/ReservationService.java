package com.example.demo.service;

import com.example.demo.dto.ReservationResponseDTO;
import com.example.demo.entity.Book;
import com.example.demo.entity.Reservation;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.BookCopyStatus;
import com.example.demo.entity.enums.ReservationStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookCopyRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.ReservationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    @Transactional
    public ReservationResponseDTO createReservation(Integer userId, Integer bookId) {

        boolean hasAvailableCopy =
                bookCopyRepository.existsByBookIdAndStatus(bookId, BookCopyStatus.AVAILABLE);
        if (hasAvailableCopy) {
            throw new BadRequestException("Book is currently available. Reservation not allowed.");
        }

        boolean hasActiveReservation = reservationRepository
                .existsByUserIdAndBookIdAndStatus(userId, bookId, ReservationStatus.ACTIVE);
        if (hasActiveReservation) {
            throw new BadRequestException("User already has an active reservation for this book.");
        }

        long activeReservations = reservationRepository
                .countByUserIdAndStatus(userId, ReservationStatus.ACTIVE);
        if (activeReservations >= 3) {
            log.warn("User {} exceeded reservation limit", userId);
            throw new BadRequestException("Maximum 3 active reservations allowed.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found with id: " + bookId));

        Reservation reservation = Reservation.builder()
                .user(user)
                .book(book)
                .reservationDate(LocalDate.now())
                .status(ReservationStatus.ACTIVE)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Reservation created: reservationId={}, userId={}, bookId={}",
                savedReservation.getId(), userId, bookId);

        return mapToDTO(savedReservation);
    }

    public Page<ReservationResponseDTO> getAll(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional
    public ReservationResponseDTO updateStatus(Long id, ReservationStatus newStatus) {
        if (id == null) {
            throw new BadRequestException("Reservation id is required");
        }
        if (newStatus == null) {
            throw new BadRequestException("Reservation status is required");
        }
        if (id > Integer.MAX_VALUE || id < Integer.MIN_VALUE) {
            throw new BadRequestException("Invalid reservation id: " + id);
        }

        Reservation reservation = reservationRepository.findById(id.intValue())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reservation not found with id: " + id));

        autoCancelIfExpired(reservation);

        ReservationStatus currentStatus = reservation.getStatus();
        if (currentStatus == ReservationStatus.ACTIVE) {
            if (newStatus != ReservationStatus.COMPLETED
                    && newStatus != ReservationStatus.CANCELLED) {
                throw new BadRequestException(
                        "Invalid status transition from ACTIVE to " + newStatus);
            }
        } else {
            throw new BadRequestException(
                    "Cannot change status for reservation in " + currentStatus + " state");
        }

        reservation.setStatus(newStatus);
        Reservation savedReservation = reservationRepository.save(reservation);
        return mapToDTO(savedReservation);
    }

    private void autoCancelIfExpired(Reservation reservation) {
        if (reservation.getStatus() != ReservationStatus.ACTIVE) {
            return;
        }

        LocalDate reservationDate = reservation.getReservationDate();
        LocalDate today = LocalDate.now();
        if (reservationDate.plusDays(4).isBefore(today)) {
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);
        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void autoCancelExpiredReservations() {
        List<Reservation> activeReservations = reservationRepository.findByStatus(ReservationStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        if (activeReservations.isEmpty()) {
            log.warn("No active reservations found during scheduled auto-cancel.");
            return;
        }

        for (Reservation reservation : activeReservations) {
            LocalDate reservationDate = reservation.getReservationDate();
            if (reservationDate.plusDays(4).isBefore(today)) {
                reservation.setStatus(ReservationStatus.CANCELLED);
                reservationRepository.save(reservation);
                log.info("Auto-cancelled expired reservation: reservationId={}, userId={}, bookId={}",
                        reservation.getId(),
                        reservation.getUser().getId(),
                        reservation.getBook().getId());
            }
        }
    }

    @Transactional
    public void cancelReservation(Long id) {
        if (id == null) {
            throw new BadRequestException("Reservation id is required");
        }
        if (id > Integer.MAX_VALUE || id < Integer.MIN_VALUE) {
            throw new BadRequestException("Invalid reservation id: " + id);
        }

        Reservation reservation = reservationRepository.findById(id.intValue())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reservation not found with id: " + id));

        autoCancelIfExpired(reservation);
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed reservation");
        }
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            return;
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        log.info("Reservation cancelled: reservationId={}, userId={}, bookId={}",
                reservation.getId(),
                reservation.getUser().getId(),
                reservation.getBook().getId());
    }

    private ReservationResponseDTO mapToDTO(Reservation reservation) {

        return ReservationResponseDTO.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userName(reservation.getUser().getFullName())
                .bookId(reservation.getBook().getId())
                .bookTitle(reservation.getBook().getTitle())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus() != null ? reservation.getStatus().name() : null)
                .build();
    }
}
