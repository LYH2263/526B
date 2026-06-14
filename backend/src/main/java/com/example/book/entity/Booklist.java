package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Booklist {
    private Long id;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private Long userId;
    private String shareToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
