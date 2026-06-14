package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.dto.*;
import com.example.book.entity.PurchaseRequest;
import com.example.book.service.PurchaseRequestService;
import com.example.book.vo.PurchaseRequestVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-requests")
public class PurchaseRequestController {

    @Autowired
    private PurchaseRequestService purchaseRequestService;

    @PostMapping
    public Result<PurchaseRequest> createRequest(@RequestBody PurchaseRequestCreateDTO dto) {
        return Result.success(purchaseRequestService.createRequest(dto));
    }

    @PostMapping("/approve")
    public Result<PurchaseRequest> approveRequest(@RequestBody PurchaseRequestApproveDTO dto) {
        return Result.success(purchaseRequestService.approveRequest(dto));
    }

    @PostMapping("/reject")
    public Result<PurchaseRequest> rejectRequest(@RequestBody PurchaseRequestRejectDTO dto) {
        return Result.success(purchaseRequestService.rejectRequest(dto));
    }

    @PostMapping("/stock")
    public Result<PurchaseRequest> stockRequest(@RequestBody PurchaseRequestStockDTO dto) {
        return Result.success(purchaseRequestService.stockRequest(dto));
    }

    @GetMapping
    public Result<List<PurchaseRequestVO>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long applicantId) {
        if (status != null && !status.isEmpty()) {
            return Result.success(purchaseRequestService.findByStatus(status));
        }
        if (applicantId != null) {
            return Result.success(purchaseRequestService.findByApplicantId(applicantId));
        }
        return Result.success(purchaseRequestService.findAll());
    }

    @GetMapping("/{id}")
    public Result<PurchaseRequestVO> getById(@PathVariable Long id) {
        return Result.success(purchaseRequestService.findById(id));
    }
}
