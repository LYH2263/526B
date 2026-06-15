package com.example.book.mapper;

import com.example.book.entity.Branch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BranchMapper {
    int insert(Branch branch);
    int update(Branch branch);
    Branch findById(@Param("id") Long id);
    List<Branch> findAll();
    List<Branch> findByStatus(@Param("status") Integer status);
}
