package com.example.book.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BooklistVO {
    private Long id;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private Long userId;
    private String shareToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer bookCount;
    private List<BooklistItemVO> items;
}
