package com.example.demo.repository;

import com.example.demo.entity.BookCopy;
import com.example.demo.entity.enums.BookCopyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookCopyRepository extends JpaRepository<BookCopy, Integer> {

    boolean existsByBookIdAndStatus(Integer bookId, BookCopyStatus status);

    Page<BookCopy> findByBookDeletedFalse(Pageable pageable);
}
