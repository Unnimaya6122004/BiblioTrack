package com.example.demo.service;

import com.example.demo.dto.AuthorResponseDTO;
import com.example.demo.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    public List<AuthorResponseDTO> getAllAuthors() {
        return authorRepository.findAllByOrderByNameAsc().stream()
                .map(author -> AuthorResponseDTO.builder()
                        .id(author.getId())
                        .name(author.getName())
                        .build())
                .toList();
    }
}
