package com.example.book.vo;

import lombok.Data;

@Data
public class PointsAccountVO {
    private Long userId;
    private Integer totalPoints;
    private String level;
    private String levelName;
    private String levelColor;
    private String levelIcon;
    private Integer nextLevelThreshold;
    private String nextLevelName;
    private Integer currentLevelPoints;
    private Integer progressPercent;
    private Boolean isMaxLevel;
}
