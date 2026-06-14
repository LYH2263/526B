package com.example.book.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointsRecord {
    private Long id;
    private Long userId;
    private Integer pointsChange;
    private Integer pointsAfter;
    private String sourceType;
    private String sourceId;
    private String description;
    private LocalDateTime createdAt;
}
