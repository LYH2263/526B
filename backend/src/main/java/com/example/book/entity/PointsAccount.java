package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointsAccount {
    private Long id;
    private Long userId;
    private Integer totalPoints;
    private String level;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
