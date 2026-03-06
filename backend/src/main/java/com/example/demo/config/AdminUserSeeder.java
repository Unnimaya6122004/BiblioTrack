package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.entity.enums.Role;
import com.example.demo.entity.enums.UserStatus;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed-admin.name:System Admin}")
    private String adminName;

    @Value("${app.seed-admin.email:admin@lms.local}")
    private String adminEmail;

    @Value("${app.seed-admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.seed-admin.reset-password-if-exists:true}")
    private boolean resetPasswordIfExists;

    @Value("${app.seed-member.enabled:true}")
    private boolean seedMemberEnabled;

    @Value("${app.seed-member.name:Library Member}")
    private String memberName;

    @Value("${app.seed-member.email:member@lms.local}")
    private String memberEmail;

    @Value("${app.seed-member.password:Member@123}")
    private String memberPassword;

    @Value("${app.seed-member.reset-password-if-exists:true}")
    private boolean resetMemberPasswordIfExists;

    @Override
    public void run(String... args) {
        seedUser(
                seedEnabled,
                adminName,
                adminEmail,
                adminPassword,
                Role.ADMIN,
                UserStatus.ACTIVE,
                resetPasswordIfExists
        );

        seedUser(
                seedMemberEnabled,
                memberName,
                memberEmail,
                memberPassword,
                Role.USER,
                UserStatus.ACTIVE,
                resetMemberPasswordIfExists
        );
    }

    private void seedUser(boolean enabled,
                          String fullName,
                          String email,
                          String rawPassword,
                          Role role,
                          UserStatus status,
                          boolean shouldResetPassword) {
        if (!enabled) {
            return;
        }

        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing != null) {
            boolean changed = false;

            if (shouldResetPassword &&
                    (existing.getPasswordHash() == null ||
                            !passwordEncoder.matches(rawPassword, existing.getPasswordHash()))) {
                existing.setPasswordHash(passwordEncoder.encode(rawPassword));
                changed = true;
            }

            if (existing.getRole() != role) {
                existing.setRole(role);
                changed = true;
            }

            if (existing.getStatus() != status) {
                existing.setStatus(status);
                changed = true;
            }

            if (existing.isDeleted()) {
                existing.setDeleted(false);
                changed = true;
            }

            if (changed) {
                userRepository.save(existing);
            }
            return;
        }

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }
}
