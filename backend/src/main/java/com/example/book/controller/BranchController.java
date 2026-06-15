package com.example.book.controller;

import com.example.book.common.Result;
import com.example.book.service.BranchService;
import com.example.book.vo.BranchVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @GetMapping
    public Result<List<BranchVO>> list(
            @RequestParam(required = false) Integer status) {
        if (status != null) {
            return Result.success(branchService.findByStatus(status));
        }
        return Result.success(branchService.findAll());
    }

    @GetMapping("/{id}")
    public Result<BranchVO> getById(@PathVariable Long id) {
        com.example.book.entity.Branch branch = branchService.findById(id);
        if (branch == null) {
            return Result.success(null);
        }
        BranchVO vo = new BranchVO();
        vo.setId(branch.getId());
        vo.setName(branch.getName());
        vo.setAddress(branch.getAddress());
        vo.setLatitude(branch.getLatitude());
        vo.setLongitude(branch.getLongitude());
        vo.setPhone(branch.getPhone());
        vo.setBusinessHours(branch.getBusinessHours());
        vo.setStatus(branch.getStatus());
        return Result.success(vo);
    }
}
