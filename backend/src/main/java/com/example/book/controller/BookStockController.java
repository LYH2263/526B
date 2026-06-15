package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.NearbyBranchQueryDTO;
import com.example.book.service.BookStockService;
import com.example.book.vo.BookStockVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-stock")
public class BookStockController {

    @Autowired
    private BookStockService bookStockService;

    @GetMapping("/book/{bookId}")
    public Result<List<BookStockVO>> getStockByBookId(@PathVariable Long bookId) {
        return Result.success(bookStockService.findStockByBookId(bookId));
    }

    @GetMapping("/book/{bookId}/branch/{branchId}")
    public Result<BookStockVO> getStockByBookIdAndBranchId(
            @PathVariable Long bookId,
            @PathVariable Long branchId) {
        return Result.success(bookStockService.findStockByBookIdAndBranchId(bookId, branchId));
    }

    @GetMapping("/branch/{branchId}")
    public Result<List<BookStockVO>> getStockByBranchId(@PathVariable Long branchId) {
        return Result.success(bookStockService.findStockByBranchId(branchId));
    }

    @PostMapping("/nearby")
    public Result<List<BookStockVO>> findNearbyBranchesWithStock(@RequestBody NearbyBranchQueryDTO dto) {
        return Result.success(bookStockService.findNearbyBranchesWithStock(dto));
    }
}
