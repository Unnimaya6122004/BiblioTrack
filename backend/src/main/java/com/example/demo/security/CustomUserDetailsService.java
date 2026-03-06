package com.example.demo.security;

import com.example.demo.entity.User;
import com.example.demo.entity.enums.Role;
import com.example.demo.entity.enums.UserStatus;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new UsernameNotFoundException("User credentials not configured for: " + email);
        }

        if (!UserStatus.ACTIVE.equals(user.getStatus())) {
            throw new DisabledException("User account is not active");
        }

        Role role = user.getRole() != null ? user.getRole() : Role.USER;

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + role.name())
                .build();
    }
}
