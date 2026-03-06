package com.example.demo.repository;

import com.example.demo.entity.Reservation;
import com.example.demo.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    Optional<Reservation> findFirstByBookIdAndStatusOrderByReservationDateAsc(Integer bookId, ReservationStatus status);

    boolean existsByUserIdAndBookIdAndStatus(Integer userId, Integer bookId, ReservationStatus status);

    long countByUserIdAndStatus(Integer userId, ReservationStatus status);

    List<Reservation> findByStatus(ReservationStatus status);

    Optional<Reservation> findFirstByUserIdAndBookIdAndStatus(Integer userId, Integer bookId, ReservationStatus status);
}
