package com.example.demo.repository;

import com.example.demo.entity.Loan;
import com.example.demo.entity.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoanRepository extends JpaRepository<Loan, Integer> {

    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);

    long countByUserIdAndStatus(Integer userId, LoanStatus status);

    boolean existsByUserIdAndStatus(Integer userId, LoanStatus status);

    boolean existsByBookCopyBookIdAndStatus(Integer bookId, LoanStatus status);
}
