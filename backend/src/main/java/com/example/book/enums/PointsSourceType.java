package com.example.book.enums;

public enum PointsSourceType {
    LOGIN("每日登录", 5),
    READ_BOOK("阅读图书", 10),
    ADD_CART("加入购物车", 3),
    PLACE_ORDER("完成下单", 20);

    private final String description;
    private final int points;

    PointsSourceType(String description, int points) {
        this.description = description;
        this.points = points;
    }

    public String getDescription() {
        return description;
    }

    public int getPoints() {
        return points;
    }
}
