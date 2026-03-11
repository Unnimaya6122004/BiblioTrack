package com.example.demo.repository;

import com.example.demo.entity.Loan;
import com.example.demo.entity.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Integer> {

    Page<Loan> findByStatus(LoanStatus status, Pageable pageable);

    long countByUserIdAndStatus(Integer userId, LoanStatus status);

    boolean existsByUserIdAndStatus(Integer userId, LoanStatus status);

    boolean existsByBookCopyBookIdAndStatus(Integer bookId, LoanStatus status);

    @Query("""
            select l.bookCopy.book.id, l.bookCopy.book.title, count(l.id)
            from Loan l
            group by l.bookCopy.book.id, l.bookCopy.book.title
            order by count(l.id) desc
            """)
    List<Object[]> findTopBorrowedBooks(Pageable pageable);

    @Query("""
            select l.user.id, l.user.fullName, count(l.id)
            from Loan l
            where l.status = :status and l.dueDate < :today
            group by l.user.id, l.user.fullName
            """)
    List<Object[]> findOverdueLoanCountsByUser(@Param("status") LoanStatus status,
                                               @Param("today") LocalDate today);
}
