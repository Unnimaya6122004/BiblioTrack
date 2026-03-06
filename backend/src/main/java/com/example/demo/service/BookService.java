package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.demo.dto.BookCreateRequestDTO;
import com.example.demo.dto.BookResponseDTO;
import com.example.demo.dto.BookUpdateRequestDTO;
import com.example.demo.entity.Author;
import com.example.demo.entity.Book;
import com.example.demo.entity.Category;
import com.example.demo.entity.enums.BookCopyStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.AuthorRepository;
import com.example.demo.repository.BookCopyRepository;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookCopyRepository bookCopyRepository;

    public Page<BookResponseDTO> getAllBooks(String title, String author, String category, Pageable pageable) {
        Page<Book> page;
        if (StringUtils.hasText(title)) {
            page = bookRepository.findByTitleContainingIgnoreCase(title.trim(), pageable);
        } else if (StringUtils.hasText(author)) {
            page = bookRepository.findDistinctByAuthorsNameContainingIgnoreCase(author.trim(), pageable);
        } else if (StringUtils.hasText(category)) {
            page = bookRepository.findDistinctByCategoriesNameContainingIgnoreCase(category.trim(), pageable);
        } else {
            page = bookRepository.findAll(pageable);
        }
        return page.map(this::mapToDTO);
    }

    public BookResponseDTO getBookById(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found with id: " + id));

        return mapToDTO(book);
    }

    @Transactional
    public BookResponseDTO createBook(BookCreateRequestDTO request) {

        Book book = Book.builder()
                .title(request.getTitle().trim())
                .isbn(normalizeIsbn(request.getIsbn()))
                .authors(resolveAuthors(request.getAuthorIds()))
                .categories(resolveCategories(request.getCategoryIds()))
                .createdAt(LocalDateTime.now())
                .build();

        Book savedBook = bookRepository.save(book);
        log.info("Book created successfully: bookId={}", savedBook.getId());

        return mapToDTO(savedBook);
    }

    @Transactional
    public BookResponseDTO updateBook(Integer id, BookUpdateRequestDTO request) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        book.setTitle(request.getTitle().trim());
        book.setIsbn(normalizeIsbn(request.getIsbn()));
        book.setAuthors(resolveAuthors(request.getAuthorIds()));
        book.setCategories(resolveCategories(request.getCategoryIds()));

        Book savedBook = bookRepository.save(book);
        log.info("Book updated successfully: bookId={}", savedBook.getId());

        return mapToDTO(savedBook);
    }

    @Transactional
    public void deleteBook(Integer id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        boolean hasIssuedCopy = bookCopyRepository.existsByBookIdAndStatus(id, BookCopyStatus.ISSUED);
        if (hasIssuedCopy) {
            log.warn("Blocked book soft delete: bookId={} has issued copies", id);
            throw new BadRequestException("Cannot delete book. One or more copies are currently issued.");
        }

        book.setDeleted(true);
        bookRepository.save(book);
        log.info("Book soft deleted successfully: bookId={}", id);
    }

    private Set<Author> resolveAuthors(List<Integer> authorIds) {
        Set<Integer> normalizedIds = normalizeIds(authorIds, "author");
        if (normalizedIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Author> authors = authorRepository.findAllById(normalizedIds);
        if (authors.size() != normalizedIds.size()) {
            Set<Integer> foundIds = authors.stream().map(Author::getId).collect(LinkedHashSet::new, Set::add, Set::addAll);
            List<Integer> missingIds = normalizedIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new BadRequestException("Invalid author ids: " + missingIds);
        }

        return new HashSet<>(authors);
    }

    private Set<Category> resolveCategories(List<Integer> categoryIds) {
        Set<Integer> normalizedIds = normalizeIds(categoryIds, "category");
        if (normalizedIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Category> categories = categoryRepository.findAllById(normalizedIds);
        if (categories.size() != normalizedIds.size()) {
            Set<Integer> foundIds = categories.stream().map(Category::getId).collect(LinkedHashSet::new, Set::add, Set::addAll);
            List<Integer> missingIds = normalizedIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new BadRequestException("Invalid category ids: " + missingIds);
        }

        return new HashSet<>(categories);
    }

    private Set<Integer> normalizeIds(List<Integer> ids, String fieldName) {
        if (ids == null) {
            return new LinkedHashSet<>();
        }

        if (ids.stream().anyMatch(Objects::isNull)) {
            throw new BadRequestException(fieldName + "Ids must not contain null values");
        }

        return new LinkedHashSet<>(ids);
    }

    private String normalizeIsbn(String isbn) {
        if (!StringUtils.hasText(isbn)) {
            return null;
        }
        return isbn.trim();
    }

    private BookResponseDTO mapToDTO(Book book) {
        return BookResponseDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .isbn(book.getIsbn())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
