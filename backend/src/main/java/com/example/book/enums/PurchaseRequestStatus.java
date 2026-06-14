package com.example.book.enums;

public enum PurchaseRequestStatus {
    PENDING("待审批"),
    APPROVED("已通过"),
    REJECTED("已驳回"),
    STOCKED("已入库");

    private final String description;

    PurchaseRequestStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static boolean canTransition(String from, String to) {
        if (from == null) {
            return PENDING.name().equals(to);
        }
        PurchaseRequestStatus fromStatus;
        PurchaseRequestStatus toStatus;
        try {
            fromStatus = PurchaseRequestStatus.valueOf(from);
            toStatus = PurchaseRequestStatus.valueOf(to);
        } catch (IllegalArgumentException e) {
            return false;
        }
        switch (fromStatus) {
            case PENDING:
                return toStatus == APPROVED || toStatus == REJECTED;
            case APPROVED:
                return toStatus == STOCKED;
            case REJECTED:
            case STOCKED:
                return false;
            default:
                return false;
        }
    }
}
