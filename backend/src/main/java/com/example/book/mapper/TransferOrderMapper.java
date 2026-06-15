package com.example.book.mapper;

import com.example.book.entity.TransferOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TransferOrderMapper {
    int insert(TransferOrder order);
    TransferOrder findById(@Param("id") Long id);
    TransferOrder findByIdForUpdate(@Param("id") Long id);
    TransferOrder findByTransferNo(@Param("transferNo") String transferNo);
    List<TransferOrder> findAll();
    List<TransferOrder> findByStatus(@Param("status") String status);
    List<TransferOrder> findByBookId(@Param("bookId") Long bookId);
    List<TransferOrder> findBySourceBranchId(@Param("sourceBranchId") Long sourceBranchId);
    List<TransferOrder> findByTargetBranchId(@Param("targetBranchId") Long targetBranchId);
    List<TransferOrder> findByBranchId(@Param("branchId") Long branchId);
    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("version") Integer version,
                     @Param("operatorId") Long operatorId,
                     @Param("operatorName") String operatorName,
                     @Param("cancelReason") String cancelReason);
}
