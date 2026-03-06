package com.example.demo.entity;

import com.example.demo.entity.enums.BookCopyStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book_copies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, unique = true)
    private String barcode;

    private String rackLocation;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookCopyStatus status;
}
