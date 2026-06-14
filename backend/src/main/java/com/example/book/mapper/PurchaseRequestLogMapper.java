package com.example.book.mapper;

import com.example.book.entity.PurchaseRequestLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PurchaseRequestLogMapper {
    int insert(PurchaseRequestLog log);
    List<PurchaseRequestLog> findByRequestId(@Param("requestId") Long requestId);
}
