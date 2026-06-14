package com.example.book.service;

import com.example.book.dto.*;
import com.example.book.entity.Book;
import com.example.book.entity.PurchaseRequest;
import com.example.book.entity.PurchaseRequestLog;
import com.example.book.entity.User;
import com.example.book.enums.PurchaseRequestStatus;
import com.example.book.mapper.BookMapper;
import com.example.book.mapper.PurchaseRequestLogMapper;
import com.example.book.mapper.PurchaseRequestMapper;
import com.example.book.mapper.UserMapper;
import com.example.book.vo.PurchaseRequestVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseRequestService {

    @Autowired
    private PurchaseRequestMapper purchaseRequestMapper;

    @Autowired
    private PurchaseRequestLogMapper purchaseRequestLogMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BookMapper bookMapper;

    @Transactional
    public PurchaseRequest createRequest(PurchaseRequestCreateDTO dto) {
        if (dto.getBookTitle() == null || dto.getBookTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("书名不能为空");
        }
        if (dto.getBookAuthor() == null || dto.getBookAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("作者不能为空");
        }
        if (dto.getEstimatedPrice() == null || dto.getEstimatedPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("预估单价必须大于0");
        }
        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("数量必须大于0");
        }
        if (dto.getPurchaseReason() == null || dto.getPurchaseReason().trim().isEmpty()) {
            throw new IllegalArgumentException("采购理由不能为空");
        }
        if (dto.getApplicantId() == null) {
            throw new IllegalArgumentException("申请人ID不能为空");
        }

        User applicant = userMapper.findById(dto.getApplicantId());
        if (applicant == null) {
            throw new IllegalArgumentException("申请人不存在");
        }

        PurchaseRequest request = new PurchaseRequest();
        request.setBookTitle(dto.getBookTitle().trim());
        request.setBookAuthor(dto.getBookAuthor().trim());
        request.setEstimatedPrice(dto.getEstimatedPrice());
        request.setQuantity(dto.getQuantity());
        request.setPurchaseReason(dto.getPurchaseReason().trim());
        request.setStatus(PurchaseRequestStatus.PENDING.name());
        request.setApplicantId(dto.getApplicantId());
        request.setApplicantName(applicant.getUsername());
        request.setVersion(0);

        purchaseRequestMapper.insert(request);

        PurchaseRequestLog log = new PurchaseRequestLog();
        log.setRequestId(request.getId());
        log.setFromStatus(null);
        log.setToStatus(PurchaseRequestStatus.PENDING.name());
        log.setOperatorId(applicant.getId());
        log.setOperatorName(applicant.getUsername());
        log.setRemark("提交采购申请");
        purchaseRequestLogMapper.insert(log);

        return request;
    }

    @Transactional
    public PurchaseRequest approveRequest(PurchaseRequestApproveDTO dto) {
        if (dto.getId() == null) {
            throw new IllegalArgumentException("申请单ID不能为空");
        }
        if (dto.getApproverId() == null) {
            throw new IllegalArgumentException("审批人ID不能为空");
        }

        User approver = userMapper.findById(dto.getApproverId());
        if (approver == null) {
            throw new IllegalArgumentException("审批人不存在");
        }
        if (!"ADMIN".equals(approver.getRole())) {
            throw new IllegalArgumentException("只有管理员可以审批");
        }

        PurchaseRequest request = purchaseRequestMapper.findByIdForUpdate(dto.getId());
        if (request == null) {
            throw new IllegalArgumentException("申请单不存在");
        }

        String fromStatus = request.getStatus();
        if (!PurchaseRequestStatus.canTransition(fromStatus, PurchaseRequestStatus.APPROVED.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许审批通过");
        }

        int updated = purchaseRequestMapper.updateStatus(
                dto.getId(),
                PurchaseRequestStatus.APPROVED.name(),
                request.getVersion(),
                null,
                approver.getId(),
                approver.getUsername(),
                null,
                null
        );

        if (updated == 0) {
            throw new IllegalStateException("单据已被其他操作修改，请刷新后重试");
        }

        PurchaseRequestLog log = new PurchaseRequestLog();
        log.setRequestId(dto.getId());
        log.setFromStatus(fromStatus);
        log.setToStatus(PurchaseRequestStatus.APPROVED.name());
        log.setOperatorId(approver.getId());
        log.setOperatorName(approver.getUsername());
        log.setRemark(dto.getRemark() != null ? dto.getRemark() : "审批通过");
        purchaseRequestLogMapper.insert(log);

        return purchaseRequestMapper.findById(dto.getId());
    }

    @Transactional
    public PurchaseRequest rejectRequest(PurchaseRequestRejectDTO dto) {
        if (dto.getId() == null) {
            throw new IllegalArgumentException("申请单ID不能为空");
        }
        if (dto.getApproverId() == null) {
            throw new IllegalArgumentException("审批人ID不能为空");
        }
        if (dto.getRejectReason() == null || dto.getRejectReason().trim().isEmpty()) {
            throw new IllegalArgumentException("驳回理由不能为空");
        }

        User approver = userMapper.findById(dto.getApproverId());
        if (approver == null) {
            throw new IllegalArgumentException("审批人不存在");
        }
        if (!"ADMIN".equals(approver.getRole())) {
            throw new IllegalArgumentException("只有管理员可以审批");
        }

        PurchaseRequest request = purchaseRequestMapper.findByIdForUpdate(dto.getId());
        if (request == null) {
            throw new IllegalArgumentException("申请单不存在");
        }

        String fromStatus = request.getStatus();
        if (!PurchaseRequestStatus.canTransition(fromStatus, PurchaseRequestStatus.REJECTED.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许驳回");
        }

        int updated = purchaseRequestMapper.updateStatus(
                dto.getId(),
                PurchaseRequestStatus.REJECTED.name(),
                request.getVersion(),
                dto.getRejectReason().trim(),
                approver.getId(),
                approver.getUsername(),
                null,
                null
        );

        if (updated == 0) {
            throw new IllegalStateException("单据已被其他操作修改，请刷新后重试");
        }

        PurchaseRequestLog log = new PurchaseRequestLog();
        log.setRequestId(dto.getId());
        log.setFromStatus(fromStatus);
        log.setToStatus(PurchaseRequestStatus.REJECTED.name());
        log.setOperatorId(approver.getId());
        log.setOperatorName(approver.getUsername());
        log.setRemark("驳回：" + dto.getRejectReason().trim());
        purchaseRequestLogMapper.insert(log);

        return purchaseRequestMapper.findById(dto.getId());
    }

    @Transactional
    public PurchaseRequest stockRequest(PurchaseRequestStockDTO dto) {
        if (dto.getId() == null) {
            throw new IllegalArgumentException("申请单ID不能为空");
        }
        if (dto.getStockerId() == null) {
            throw new IllegalArgumentException("入库操作人ID不能为空");
        }

        User stocker = userMapper.findById(dto.getStockerId());
        if (stocker == null) {
            throw new IllegalArgumentException("入库操作人不存在");
        }

        PurchaseRequest request = purchaseRequestMapper.findByIdForUpdate(dto.getId());
        if (request == null) {
            throw new IllegalArgumentException("申请单不存在");
        }

        String fromStatus = request.getStatus();
        if (!PurchaseRequestStatus.canTransition(fromStatus, PurchaseRequestStatus.STOCKED.name())) {
            throw new IllegalStateException("当前状态【" + getStatusText(fromStatus) + "】不允许标记入库");
        }

        int updated = purchaseRequestMapper.updateStatus(
                dto.getId(),
                PurchaseRequestStatus.STOCKED.name(),
                request.getVersion(),
                null,
                null,
                null,
                stocker.getId(),
                stocker.getUsername()
        );

        if (updated == 0) {
            throw new IllegalStateException("单据已被其他操作修改，请刷新后重试");
        }

        Book book = new Book();
        book.setTitle(request.getBookTitle());
        book.setAuthor(request.getBookAuthor());
        book.setPrice(request.getEstimatedPrice());
        bookMapper.insert(book);

        PurchaseRequestLog log = new PurchaseRequestLog();
        log.setRequestId(dto.getId());
        log.setFromStatus(fromStatus);
        log.setToStatus(PurchaseRequestStatus.STOCKED.name());
        log.setOperatorId(stocker.getId());
        log.setOperatorName(stocker.getUsername());
        log.setRemark("已入库，图书ID：" + book.getId());
        purchaseRequestLogMapper.insert(log);

        return purchaseRequestMapper.findById(dto.getId());
    }

    public List<PurchaseRequestVO> findAll() {
        List<PurchaseRequest> list = purchaseRequestMapper.findAll();
        return convertToVOList(list);
    }

    public List<PurchaseRequestVO> findByStatus(String status) {
        List<PurchaseRequest> list = purchaseRequestMapper.findByStatus(status);
        return convertToVOList(list);
    }

    public List<PurchaseRequestVO> findByApplicantId(Long applicantId) {
        List<PurchaseRequest> list = purchaseRequestMapper.findByApplicantId(applicantId);
        return convertToVOList(list);
    }

    public PurchaseRequestVO findById(Long id) {
        PurchaseRequest request = purchaseRequestMapper.findById(id);
        if (request == null) {
            return null;
        }
        PurchaseRequestVO vo = convertToVO(request);
        vo.setLogs(purchaseRequestLogMapper.findByRequestId(id));
        return vo;
    }

    private List<PurchaseRequestVO> convertToVOList(List<PurchaseRequest> list) {
        List<PurchaseRequestVO> voList = new ArrayList<>();
        for (PurchaseRequest request : list) {
            voList.add(convertToVO(request));
        }
        return voList;
    }

    private PurchaseRequestVO convertToVO(PurchaseRequest request) {
        PurchaseRequestVO vo = new PurchaseRequestVO();
        vo.setId(request.getId());
        vo.setBookTitle(request.getBookTitle());
        vo.setBookAuthor(request.getBookAuthor());
        vo.setEstimatedPrice(request.getEstimatedPrice());
        vo.setQuantity(request.getQuantity());
        vo.setPurchaseReason(request.getPurchaseReason());
        vo.setStatus(request.getStatus());
        vo.setStatusText(getStatusText(request.getStatus()));
        vo.setRejectReason(request.getRejectReason());
        vo.setApplicantId(request.getApplicantId());
        vo.setApplicantName(request.getApplicantName());
        vo.setApproverId(request.getApproverId());
        vo.setApproverName(request.getApproverName());
        vo.setStockerId(request.getStockerId());
        vo.setStockerName(request.getStockerName());
        vo.setCreatedAt(request.getCreatedAt());
        vo.setApprovedAt(request.getApprovedAt());
        vo.setRejectedAt(request.getRejectedAt());
        vo.setStockedAt(request.getStockedAt());
        return vo;
    }

    private String getStatusText(String status) {
        if (status == null) return "";
        try {
            return PurchaseRequestStatus.valueOf(status).getDescription();
        } catch (IllegalArgumentException e) {
            return status;
        }
    }
}
