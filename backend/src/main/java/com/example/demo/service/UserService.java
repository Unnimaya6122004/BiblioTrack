package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.demo.dto.UserCreateRequestDTO;
import com.example.demo.dto.UserResponseDTO;
import com.example.demo.dto.UserUpdateRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.FineStatus;
import com.example.demo.entity.enums.LoanStatus;
import com.example.demo.entity.enums.Role;
import com.example.demo.entity.enums.UserStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FineRepository;
import com.example.demo.repository.LoanRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoanRepository loanRepository;
    private final FineRepository fineRepository;

    public Page<UserResponseDTO> getAllUsers(String status, Pageable pageable) {
        if (StringUtils.hasText(status)) {
            UserStatus userStatus = parseUserStatus(status);
            return userRepository.findByStatus(userStatus, pageable).map(this::convertToDTO);
        }
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    public UserResponseDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + id));

        return convertToDTO(user);
    }

    @Transactional
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new BadRequestException("User already exists with email: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPasswordHash()))
                .role(parseRole(request.getRole()))
                .phone(request.getPhone())
                .status(parseUserStatusOrDefault(request.getStatus(), UserStatus.ACTIVE))
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    @Transactional
    public UserResponseDTO updateUser(Integer id, UserUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmail(normalizedEmail)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new BadRequestException("User already exists with email: " + request.getEmail());
                });

        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(parseRole(request.getRole()));
        user.setPhone(request.getPhone());
        user.setStatus(parseUserStatusOrDefault(request.getStatus(), user.getStatus() != null ? user.getStatus() : UserStatus.ACTIVE));

        if (StringUtils.hasText(request.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));
        }

        User savedUser = userRepository.save(user);
        log.info("User updated successfully: userId={}", savedUser.getId());

        return convertToDTO(savedUser);
    }

    @Transactional
    public void deleteUser(Integer id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean hasActiveLoan = loanRepository.existsByUserIdAndStatus(id, LoanStatus.ISSUED);
        boolean hasUnpaidFine = fineRepository.existsByUserIdAndStatus(id, FineStatus.UNPAID);
        if (hasActiveLoan || hasUnpaidFine) {
            log.warn("Blocked user soft delete: userId={} has active loans or unpaid fines", id);
            throw new BadRequestException("Cannot delete user. User has active loans or unpaid fines.");
        }

        user.setDeleted(true);
        userRepository.save(user);
        log.info("User soft deleted successfully: userId={}", id);
    }

    private UserResponseDTO convertToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .phone(user.getPhone())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .build();
    }

    private Role parseRole(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BadRequestException("Role is required");
        }
        try {
            String normalized = value.trim().toUpperCase(Locale.ROOT);
            if ("MEMBER".equals(normalized)) {
                normalized = "USER";
            }
            return Role.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + value);
        }
    }

    private UserStatus parseUserStatus(String value) {
        try {
            return UserStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid user status: " + value);
        }
    }

    private UserStatus parseUserStatusOrDefault(String value, UserStatus defaultValue) {
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return parseUserStatus(value);
    }
}
