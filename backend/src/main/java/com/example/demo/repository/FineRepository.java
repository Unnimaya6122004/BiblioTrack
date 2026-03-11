package com.example.demo.repository;

import com.example.demo.entity.Fine;
import com.example.demo.entity.enums.FineStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FineRepository extends JpaRepository<Fine, Integer> {

    // Get all fines for a loan
    List<Fine> findByLoanId(Integer loanId);
    Page<Fine> findByLoanId(Integer loanId, Pageable pageable);

    // Get all unpaid fines for a user (resolved through loan ownership)
    List<Fine> findByLoanUserIdAndStatus(Integer userId, FineStatus status);

    // Check if unpaid fine already exists for a loan
    Optional<Fine> findByLoanIdAndStatus(Integer loanId, FineStatus status);

    boolean existsByLoanUserId(Integer userId);

    boolean existsByLoanUserIdAndStatus(Integer userId, FineStatus status);

    @Query("select coalesce(sum(f.amount), 0) from Fine f where f.loan.user.id = :userId and f.status = :status")
    BigDecimal sumAmountByUserIdAndStatus(Integer userId, FineStatus status);

    @Query("""
            select f.loan.user.id, f.loan.user.fullName, coalesce(sum(f.amount), 0)
            from Fine f
            where f.status = :status
            group by f.loan.user.id, f.loan.user.fullName
            """)
    List<Object[]> findFineTotalsByUserAndStatus(FineStatus status);

    List<Fine> findByIssuedDateBetween(LocalDate startDate, LocalDate endDate);

    List<Fine> findByPaidDateBetween(LocalDate startDate, LocalDate endDate);
}
