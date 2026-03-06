package com.example.demo.repository;

import com.example.demo.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Integer> {

    @Override
    @Query("select b from Book b where b.deleted = false")
    List<Book> findAll();

    @Override
    @Query("select b from Book b where b.deleted = false")
    Page<Book> findAll(Pageable pageable);

    @Override
    @Query("select b from Book b where b.id = :id and b.deleted = false")
    Optional<Book> findById(@Param("id") Integer id);

    @Query("select b from Book b where b.deleted = false and lower(b.title) like lower(concat('%', :title, '%'))")
    Page<Book> findByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);

    @Query("""
            select distinct b from Book b
            join b.authors a
            where b.deleted = false
              and lower(a.name) like lower(concat('%', :author, '%'))
            """)
    Page<Book> findDistinctByAuthorsNameContainingIgnoreCase(@Param("author") String author, Pageable pageable);

    @Query("""
            select distinct b from Book b
            join b.categories c
            where b.deleted = false
              and lower(c.name) like lower(concat('%', :category, '%'))
            """)
    Page<Book> findDistinctByCategoriesNameContainingIgnoreCase(@Param("category") String category, Pageable pageable);
}
