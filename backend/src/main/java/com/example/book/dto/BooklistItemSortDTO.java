package com.example.book.dto;

import lombok.Data;
import java.util.List;

@Data
public class BooklistItemSortDTO {
    private Long booklistId;
    private List<Long> bookIds;
}
