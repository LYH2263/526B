package com.example.book.mapper;

import com.example.book.entity.TransferOrderLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TransferOrderLogMapper {
    int insert(TransferOrderLog log);
    List<TransferOrderLog> findByTransferOrderId(@Param("transferOrderId") Long transferOrderId);
}
