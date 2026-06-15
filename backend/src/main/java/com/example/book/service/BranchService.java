package com.example.book.service;

import com.example.book.entity.Branch;
import com.example.book.mapper.BranchMapper;
import com.example.book.vo.BranchVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BranchService {

    @Autowired
    private BranchMapper branchMapper;

    public Branch findById(Long id) {
        return branchMapper.findById(id);
    }

    public List<BranchVO> findAll() {
        List<Branch> list = branchMapper.findAll();
        return convertToVOList(list);
    }

    public List<BranchVO> findByStatus(Integer status) {
        List<Branch> list = branchMapper.findByStatus(status);
        return convertToVOList(list);
    }

    public List<Branch> findAllEntities() {
        return branchMapper.findAll();
    }

    private List<BranchVO> convertToVOList(List<Branch> list) {
        List<BranchVO> voList = new ArrayList<>();
        for (Branch branch : list) {
            voList.add(convertToVO(branch));
        }
        return voList;
    }

    private BranchVO convertToVO(Branch branch) {
        BranchVO vo = new BranchVO();
        vo.setId(branch.getId());
        vo.setName(branch.getName());
        vo.setAddress(branch.getAddress());
        vo.setLatitude(branch.getLatitude());
        vo.setLongitude(branch.getLongitude());
        vo.setPhone(branch.getPhone());
        vo.setBusinessHours(branch.getBusinessHours());
        vo.setStatus(branch.getStatus());
        return vo;
    }
}
