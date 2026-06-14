package com.example.book.dto;

import lombok.Data;

@Data
public class BooklistCreateDTO {
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
    private Long userId;
}
