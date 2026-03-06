package com.example.demo.repository;

import com.example.demo.entity.User;
import com.example.demo.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Override
    @Query("select u from User u where u.deleted = false")
    List<User> findAll();

    @Override
    @Query("select u from User u where u.deleted = false")
    Page<User> findAll(Pageable pageable);

    @Override
    @Query("select u from User u where u.id = :id and u.deleted = false")
    Optional<User> findById(@Param("id") Integer id);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedFalse(String email);

    @Query("select u from User u where u.status = :status and u.deleted = false")
    Page<User> findByStatus(@Param("status") UserStatus status, Pageable pageable);
}
