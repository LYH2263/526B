package com.example.book.service;

import com.example.book.dto.TransferCreateDTO;
import com.example.book.dto.TransferOperationDTO;
import com.example.book.entity.*;
import com.example.book.enums.TransferStatus;
import com.example.book.mapper.*;
import com.example.book.vo.TransferOrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class TransferService {

    @Autowired
    private TransferOrderMapper transferOrderMapper;

    @Autowired
    private TransferOrderLogMapper transferOrderLogMapper;

    @Autowired
    private BookStockMapper bookStockMapper;

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private BranchMapper branchMapper;

    @Autowired
    private UserMapper userMapper;

    private static final AtomicInteger sequence = new AtomicInteger(0);

    private String generateTransferNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int seq = sequence.incrementAndGet() % 10000;
        return "TR" + timestamp + String.format("%04d", seq);
    }

    @Transactional
    public TransferOrder createTransfer(TransferCreateDTO dto) {
        if (dto.getBookId() == null) {
            throw new IllegalArgumentException("图书ID不能为空");
        }
        if (dto.getSourceBranchId() == null) {
            throw new IllegalArgumentException("源分馆ID不能为空");
        }
        if (dto.getTargetBranchId() == null) {
            throw new IllegalArgumentException("目标分馆ID不能为空");
        }
        if (dto.getSourceBranchId().equals(dto.getTargetBranchId())) {
            throw new IllegalArgumentException("源分馆和目标分馆不能相同");
        }
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("调拨数量必须大于0");
        }

        Book book = bookMapper.findById(dto.getBookId());
        if (book == null) {
            throw new IllegalArgumentException("图书不存在");
        }

        Branch sourceBranch = branchMapper.findById(dto.getSourceBranchId());
        if (sourceBranch == null) {
            throw new IllegalArgumentException("源分馆不存在");
        }

        Branch targetBranch = branchMapper.findById(dto.getTargetBranchId());
        if (targetBranch == null) {
            throw new IllegalArgumentException("目标分馆不存在");
        }

        User operator = null;
        String operatorName = "系统";
        if (dto.getOperatorId() != null) {
            operator = userMapper.findById(dto.getOperatorId());
            if (operator != null) {
                operatorName = operator.getUsername();
            }
        }

        BookStock sourceStock = bookStockMapper.findByBookIdAndBranchIdForUpdate(
                dto.getBookId(), dto.getSourceBranchId());
        if (sourceStock == null || sourceStock.getAvailableQuantity() < dto.getQuantity()) {
            throw new IllegalStateException("源分馆库存不足，可借数量：" +
                    (sourceStock != null ? sourceStock.getAvailableQuantity() : 0));
        }

        TransferOrder order = new TransferOrder();
        order.setTransferNo(generateTransferNo());
        order.setBookId(dto.getBookId());
        order.setBookTitle(book.getTitle());
        order.setSourceBranchId(dto.getSourceBranchId());
        order.setSourceBranchName(sourceBranch.getName());
        order.setTargetBranchId(dto.getTargetBranchId());
        order.setTargetBranchName(targetBranch.getName());
        order.setQuantity(dto.getQuantity());
        order.setStatus(TransferStatus.PENDING.name());
        order.setOperatorId(dto.getOperatorId());
        order.setOperatorName(operatorName);
        order.setRemark(dto.getRemark());
        order.setVersion(0);

        transferOrderMapper.insert(order);

        TransferOrderLog log = new TransferOrderLog();
        log.setTransferOrderId(order.getId());
        log.setFromStatus(null);
        log.setToStatus(TransferStatus.PENDING.name());
        log.setOperatorId(dto.getOperatorId() != null ? dto.getOperatorId() : 1L);
        log.setOperatorName(operatorName);
        log.setRemark("创建调拨单");
        transferOrderLogMapper.insert(log);

        return order;
    }

    @Transactional
    public TransferOrder shipTransfer(Long id, TransferOperationDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("调拨单ID不能为空");
        }
        if (dto.getOperatorId() == null) {
            throw new IllegalArgumentException("操作人ID不能为空");
        }

        User operator = userMapper.findById(dto.getOperatorId());
        if (operator == null) {
            throw new IllegalArgumentException("操作人不存在");
        }

        TransferOrder order = transferOrderMapper.findByIdForUpdate(id);
        if (order == null) {
            throw new IllegalArgumentException("调拨单不存在");
        }

        String fromStatus = order.getStatus();
        if (!TransferStatus.canTransition(fromStatus, TransferStatus.IN_TRANSIT.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许出库");
        }

        BookStock sourceStock = bookStockMapper.findByBookIdAndBranchIdForUpdate(
                order.getBookId(), order.getSourceBranchId());
        if (sourceStock == null || sourceStock.getAvailableQuantity() < order.getQuantity()) {
            throw new IllegalStateException("源分馆库存不足，可借数量：" +
                    (sourceStock != null ? sourceStock.getAvailableQuantity() : 0));
        }

        int updated = bookStockMapper.decreaseAvailable(
                order.getBookId(), order.getSourceBranchId(),
                order.getQuantity(), sourceStock.getVersion());

        if (updated == 0) {
            throw new IllegalStateException("源分馆库存已被其他操作修改，请刷新后重试");
        }

        updated = transferOrderMapper.updateStatus(
                id,
                TransferStatus.IN_TRANSIT.name(),
                order.getVersion(),
                operator.getId(),
                operator.getUsername(),
                null
        );

        if (updated == 0) {
            throw new IllegalStateException("调拨单已被其他操作修改，请刷新后重试");
        }

        TransferOrderLog log = new TransferOrderLog();
        log.setTransferOrderId(id);
        log.setFromStatus(fromStatus);
        log.setToStatus(TransferStatus.IN_TRANSIT.name());
        log.setOperatorId(operator.getId());
        log.setOperatorName(operator.getUsername());
        log.setRemark(dto.getRemark() != null ? dto.getRemark() : "图书已出库，正在运输中");
        transferOrderLogMapper.insert(log);

        return transferOrderMapper.findById(id);
    }

    @Transactional
    public TransferOrder receiveTransfer(Long id, TransferOperationDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("调拨单ID不能为空");
        }
        if (dto.getOperatorId() == null) {
            throw new IllegalArgumentException("操作人ID不能为空");
        }

        User operator = userMapper.findById(dto.getOperatorId());
        if (operator == null) {
            throw new IllegalArgumentException("操作人不存在");
        }

        TransferOrder order = transferOrderMapper.findByIdForUpdate(id);
        if (order == null) {
            throw new IllegalArgumentException("调拨单不存在");
        }

        String fromStatus = order.getStatus();
        if (!TransferStatus.canTransition(fromStatus, TransferStatus.COMPLETED.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许入库");
        }

        BookStock sourceStock = bookStockMapper.findByBookIdAndBranchIdForUpdate(
                order.getBookId(), order.getSourceBranchId());
        if (sourceStock == null || sourceStock.getInTransitQuantity() < order.getQuantity()) {
            throw new IllegalStateException("源分馆在途数量异常");
        }

        BookStock targetStock = bookStockMapper.findByBookIdAndBranchIdForUpdate(
                order.getBookId(), order.getTargetBranchId());
        if (targetStock == null) {
            targetStock = new BookStock();
            targetStock.setBookId(order.getBookId());
            targetStock.setBranchId(order.getTargetBranchId());
            targetStock.setStockQuantity(order.getQuantity());
            targetStock.setAvailableQuantity(order.getQuantity());
            targetStock.setInTransitQuantity(0);
            targetStock.setVersion(0);
            bookStockMapper.insert(targetStock);
        } else {
            int updated = bookStockMapper.increaseStockAndAvailable(
                    order.getBookId(), order.getTargetBranchId(),
                    order.getQuantity(), targetStock.getVersion());
            if (updated == 0) {
                throw new IllegalStateException("目标分馆库存已被其他操作修改，请刷新后重试");
            }
        }

        int updated = bookStockMapper.decreaseInTransit(
                order.getBookId(), order.getSourceBranchId(),
                order.getQuantity(), sourceStock.getVersion());

        if (updated == 0) {
            throw new IllegalStateException("源分馆库存已被其他操作修改，请刷新后重试");
        }

        updated = bookStockMapper.decreaseStockAndAvailable(
                order.getBookId(), order.getSourceBranchId(),
                order.getQuantity(), sourceStock.getVersion());

        if (updated == 0) {
            throw new IllegalStateException("源分馆库存已被其他操作修改，请刷新后重试");
        }

        updated = transferOrderMapper.updateStatus(
                id,
                TransferStatus.COMPLETED.name(),
                order.getVersion(),
                operator.getId(),
                operator.getUsername(),
                null
        );

        if (updated == 0) {
            throw new IllegalStateException("调拨单已被其他操作修改，请刷新后重试");
        }

        TransferOrderLog log = new TransferOrderLog();
        log.setTransferOrderId(id);
        log.setFromStatus(fromStatus);
        log.setToStatus(TransferStatus.COMPLETED.name());
        log.setOperatorId(operator.getId());
        log.setOperatorName(operator.getUsername());
        log.setRemark(dto.getRemark() != null ? dto.getRemark() : "图书已入库，调拨完成");
        transferOrderLogMapper.insert(log);

        return transferOrderMapper.findById(id);
    }

    @Transactional
    public TransferOrder cancelTransfer(Long id, TransferOperationDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("调拨单ID不能为空");
        }
        if (dto.getOperatorId() == null) {
            throw new IllegalArgumentException("操作人ID不能为空");
        }
        if (dto.getCancelReason() == null || dto.getCancelReason().trim().isEmpty()) {
            throw new IllegalArgumentException("取消原因不能为空");
        }

        User operator = userMapper.findById(dto.getOperatorId());
        if (operator == null) {
            throw new IllegalArgumentException("操作人不存在");
        }

        TransferOrder order = transferOrderMapper.findByIdForUpdate(id);
        if (order == null) {
            throw new IllegalArgumentException("调拨单不存在");
        }

        String fromStatus = order.getStatus();
        if (!TransferStatus.canTransition(fromStatus, TransferStatus.CANCELLED.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许取消");
        }

        if (TransferStatus.IN_TRANSIT.name().equals(fromStatus)) {
            BookStock sourceStock = bookStockMapper.findByBookIdAndBranchIdForUpdate(
                    order.getBookId(), order.getSourceBranchId());
            if (sourceStock == null || sourceStock.getInTransitQuantity() < order.getQuantity()) {
                throw new IllegalStateException("源分馆在途数量异常，无法取消");
            }

            int updated = bookStockMapper.increaseAvailable(
                    order.getBookId(), order.getSourceBranchId(),
                    order.getQuantity(), sourceStock.getVersion());
            if (updated == 0) {
                throw new IllegalStateException("源分馆库存已被其他操作修改，请刷新后重试");
            }

            updated = bookStockMapper.decreaseInTransit(
                    order.getBookId(), order.getSourceBranchId(),
                    order.getQuantity(), sourceStock.getVersion());
            if (updated == 0) {
                throw new IllegalStateException("源分馆库存已被其他操作修改，请刷新后重试");
            }
        }

        int updated = transferOrderMapper.updateStatus(
                id,
                TransferStatus.CANCELLED.name(),
                order.getVersion(),
                operator.getId(),
                operator.getUsername(),
                dto.getCancelReason().trim()
        );

        if (updated == 0) {
            throw new IllegalStateException("调拨单已被其他操作修改，请刷新后重试");
        }

        TransferOrderLog log = new TransferOrderLog();
        log.setTransferOrderId(id);
        log.setFromStatus(fromStatus);
        log.setToStatus(TransferStatus.CANCELLED.name());
        log.setOperatorId(operator.getId());
        log.setOperatorName(operator.getUsername());
        log.setRemark("取消调拨：" + dto.getCancelReason().trim());
        transferOrderLogMapper.insert(log);

        return transferOrderMapper.findById(id);
    }

    public List<TransferOrderVO> findAll() {
        List<TransferOrder> list = transferOrderMapper.findAll();
        return convertToVOList(list);
    }

    public List<TransferOrderVO> findByStatus(String status) {
        List<TransferOrder> list = transferOrderMapper.findByStatus(status);
        return convertToVOList(list);
    }

    public List<TransferOrderVO> findByBookId(Long bookId) {
        List<TransferOrder> list = transferOrderMapper.findByBookId(bookId);
        return convertToVOList(list);
    }

    public List<TransferOrderVO> findByBranchId(Long branchId) {
        List<TransferOrder> list = transferOrderMapper.findByBranchId(branchId);
        return convertToVOList(list);
    }

    public TransferOrderVO findById(Long id) {
        TransferOrder order = transferOrderMapper.findById(id);
        if (order == null) {
            return null;
        }
        TransferOrderVO vo = convertToVO(order);
        vo.setLogs(transferOrderLogMapper.findByTransferOrderId(id));
        return vo;
    }

    private List<TransferOrderVO> convertToVOList(List<TransferOrder> list) {
        List<TransferOrderVO> voList = new ArrayList<>();
        for (TransferOrder order : list) {
            voList.add(convertToVO(order));
        }
        return voList;
    }

    private TransferOrderVO convertToVO(TransferOrder order) {
        TransferOrderVO vo = new TransferOrderVO();
        vo.setId(order.getId());
        vo.setTransferNo(order.getTransferNo());
        vo.setBookId(order.getBookId());
        vo.setBookTitle(order.getBookTitle());
        vo.setSourceBranchId(order.getSourceBranchId());
        vo.setSourceBranchName(order.getSourceBranchName());
        vo.setTargetBranchId(order.getTargetBranchId());
        vo.setTargetBranchName(order.getTargetBranchName());
        vo.setQuantity(order.getQuantity());
        vo.setStatus(order.getStatus());
        vo.setStatusText(getStatusText(order.getStatus()));
        vo.setOperatorName(order.getOperatorName());
        vo.setRemark(order.getRemark());
        vo.setCancelReason(order.getCancelReason());
        vo.setCreatedAt(order.getCreatedAt());
        vo.setShippedAt(order.getShippedAt());
        vo.setReceivedAt(order.getReceivedAt());
        vo.setCancelledAt(order.getCancelledAt());
        return vo;
    }

    private String getStatusText(String status) {
        if (status == null) return "";
        try {
            return TransferStatus.valueOf(status).getDescription();
        } catch (IllegalArgumentException e) {
            return status;
        }
    }
}
