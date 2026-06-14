package com.example.book.dto;

import lombok.Data;

@Data
public class BooklistUpdateDTO {
    private Long id;
    private String name;
    private String description;
    private String coverUrl;
    private Boolean isPublic;
}
