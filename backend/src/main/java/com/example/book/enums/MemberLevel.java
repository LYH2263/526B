package com.example.book.enums;

public enum MemberLevel {
    COMMON("普通会员", 0, "#9CA3AF", "⭐"),
    SILVER("银会员", 100, "#60A5FA", "⭐⭐"),
    GOLD("金会员", 500, "#FBBF24", "⭐⭐⭐"),
    DIAMOND("钻石会员", 1000, "#A78BFA", "👑");

    private final String name;
    private final int threshold;
    private final String color;
    private final String icon;

    MemberLevel(String name, int threshold, String color, String icon) {
        this.name = name;
        this.threshold = threshold;
        this.color = color;
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public int getThreshold() {
        return threshold;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }

    public static MemberLevel getLevelByPoints(int points) {
        MemberLevel[] levels = values();
        MemberLevel result = COMMON;
        for (MemberLevel level : levels) {
            if (points >= level.threshold) {
                result = level;
            }
        }
        return result;
    }

    public static MemberLevel getNextLevel(MemberLevel currentLevel) {
        MemberLevel[] levels = values();
        int currentIndex = currentLevel.ordinal();
        if (currentIndex < levels.length - 1) {
            return levels[currentIndex + 1];
        }
        return null;
    }

    public static int getNextThreshold(MemberLevel currentLevel) {
        MemberLevel nextLevel = getNextLevel(currentLevel);
        if (nextLevel != null) {
            return nextLevel.threshold;
        }
        return currentLevel.threshold;
    }
}
