package com.example.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.demo.dto.BookCopyRequest;
import com.example.demo.dto.BookCopyResponseDTO;
import com.example.demo.entity.Book;
import com.example.demo.entity.BookCopy;
import com.example.demo.entity.enums.BookCopyStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookCopyRepository;
import com.example.demo.repository.BookRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;

    public Page<BookCopyResponseDTO> getAll(String barcode, Pageable pageable) {
        if (StringUtils.hasText(barcode)) {
            return bookCopyRepository
                    .findByBookDeletedFalseAndBarcodeContainingIgnoreCase(barcode.trim(), pageable)
                    .map(this::toDto);
        }

        return bookCopyRepository.findByBookDeletedFalse(pageable).map(this::toDto);
    }

    @Transactional
    public BookCopyResponseDTO create(Integer bookId, BookCopyRequest request) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found with id: " + bookId));

        BookCopy copy = BookCopy.builder()
                .barcode(request.getBarcode())
                .rackLocation(request.getRackLocation())
                .status(BookCopyStatus.AVAILABLE)
                .book(book)
                .build();

        return toDto(bookCopyRepository.save(copy));
    }

    @Transactional
    public void delete(Integer id) {

        if (!bookCopyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book copy not found with id: " + id);
        }

        bookCopyRepository.deleteById(id);
    }

    private BookCopyResponseDTO toDto(BookCopy copy) {
        return BookCopyResponseDTO.builder()
                .id(copy.getId())
                .bookId(copy.getBook().getId())
                .bookTitle(copy.getBook().getTitle())
                .barcode(copy.getBarcode())
                .rackLocation(copy.getRackLocation())
                .status(copy.getStatus() != null ? copy.getStatus().name() : null)
                .build();
    }
}
