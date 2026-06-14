package com.example.book.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointsRecordVO {
    private Long id;
    private Integer pointsChange;
    private Integer pointsAfter;
    private String sourceType;
    private String sourceName;
    private String description;
    private LocalDateTime createdAt;
}
