package com.example.book.enums;

public enum TransferStatus {
    PENDING("待出库"),
    IN_TRANSIT("在途"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String description;

    TransferStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public static boolean canTransition(String from, String to) {
        if (from == null) {
            return PENDING.name().equals(to);
        }
        TransferStatus fromStatus;
        TransferStatus toStatus;
        try {
            fromStatus = TransferStatus.valueOf(from);
            toStatus = TransferStatus.valueOf(to);
        } catch (IllegalArgumentException e) {
            return false;
        }
        switch (fromStatus) {
            case PENDING:
                return toStatus == IN_TRANSIT || toStatus == CANCELLED;
            case IN_TRANSIT:
                return toStatus == COMPLETED || toStatus == CANCELLED;
            case COMPLETED:
            case CANCELLED:
                return false;
            default:
                return false;
        }
    }
}
