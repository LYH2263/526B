package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.service.PointsService;
import com.example.book.vo.PointsAccountVO;
import com.example.book.vo.PointsRecordVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/points")
public class PointsController {

    @Autowired
    private PointsService pointsService;

    @GetMapping("/account")
    public Result<PointsAccountVO> getAccount(@RequestParam Long userId) {
        try {
            PointsAccountVO account = pointsService.getPointsAccount(userId);
            return Result.success(account);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/records")
    public Result<Map<String, Object>> getRecords(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<PointsRecordVO> records = pointsService.getPointsRecords(userId, page, size);
            int total = pointsService.getPointsRecordCount(userId);
            Map<String, Object> result = new HashMap<>();
            result.put("records", records);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) total / size));
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public Result<PointsAccountVO> addLoginPoints(@RequestParam Long userId) {
        try {
            PointsAccountVO account = pointsService.addLoginPoints(userId);
            return Result.success(account);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/read")
    public Result<PointsAccountVO> addReadPoints(
            @RequestParam Long userId,
            @RequestParam Long bookId) {
        try {
            PointsAccountVO account = pointsService.addReadBookPoints(userId, bookId);
            return Result.success(account);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
