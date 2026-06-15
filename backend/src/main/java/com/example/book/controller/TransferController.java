package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.TransferCreateDTO;
import com.example.book.dto.TransferOperationDTO;
import com.example.book.entity.TransferOrder;
import com.example.book.service.TransferService;
import com.example.book.vo.TransferOrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    @PostMapping
    public Result<TransferOrder> createTransfer(@RequestBody TransferCreateDTO dto) {
        return Result.success(transferService.createTransfer(dto));
    }

    @PostMapping("/{id}/ship")
    public Result<TransferOrder> shipTransfer(
            @PathVariable Long id,
            @RequestBody TransferOperationDTO dto) {
        return Result.success(transferService.shipTransfer(id, dto));
    }

    @PostMapping("/{id}/receive")
    public Result<TransferOrder> receiveTransfer(
            @PathVariable Long id,
            @RequestBody TransferOperationDTO dto) {
        return Result.success(transferService.receiveTransfer(id, dto));
    }

    @PostMapping("/{id}/cancel")
    public Result<TransferOrder> cancelTransfer(
            @PathVariable Long id,
            @RequestBody TransferOperationDTO dto) {
        return Result.success(transferService.cancelTransfer(id, dto));
    }

    @GetMapping
    public Result<List<TransferOrderVO>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) Long branchId) {
        if (status != null && !status.isEmpty()) {
            return Result.success(transferService.findByStatus(status));
        }
        if (bookId != null) {
            return Result.success(transferService.findByBookId(bookId));
        }
        if (branchId != null) {
            return Result.success(transferService.findByBranchId(branchId));
        }
        return Result.success(transferService.findAll());
    }

    @GetMapping("/{id}")
    public Result<TransferOrderVO> getById(@PathVariable Long id) {
        return Result.success(transferService.findById(id));
    }
}
