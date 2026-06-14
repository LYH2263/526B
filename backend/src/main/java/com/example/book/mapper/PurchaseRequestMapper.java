package com.example.book.mapper;

import com.example.book.entity.PurchaseRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PurchaseRequestMapper {
    int insert(PurchaseRequest request);
    PurchaseRequest findById(@Param("id") Long id);
    PurchaseRequest findByIdForUpdate(@Param("id") Long id);
    List<PurchaseRequest> findAll();
    List<PurchaseRequest> findByStatus(@Param("status") String status);
    List<PurchaseRequest> findByApplicantId(@Param("applicantId") Long applicantId);
    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("version") Integer version,
                     @Param("rejectReason") String rejectReason,
                     @Param("approverId") Long approverId,
                     @Param("approverName") String approverName,
                     @Param("stockerId") Long stockerId,
                     @Param("stockerName") String stockerName);
}
