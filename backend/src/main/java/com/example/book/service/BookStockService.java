package com.example.book.service;

import com.example.book.common.DistanceUtil;
import com.example.book.dto.NearbyBranchQueryDTO;
import com.example.book.entity.BookStock;
import com.example.book.entity.Branch;
import com.example.book.mapper.BookStockMapper;
import com.example.book.mapper.BranchMapper;
import com.example.book.vo.BookStockVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookStockService {

    @Autowired
    private BookStockMapper bookStockMapper;

    @Autowired
    private BranchMapper branchMapper;

    public BookStock findByBookIdAndBranchId(Long bookId, Long branchId) {
        return bookStockMapper.findByBookIdAndBranchId(bookId, branchId);
    }

    public List<BookStockVO> findStockByBookId(Long bookId) {
        List<BookStock> stockList = bookStockMapper.findByBookId(bookId);
        List<Branch> branches = branchMapper.findAll();
        List<BookStockVO> voList = new ArrayList<>();
        for (BookStock stock : stockList) {
            Branch branch = branches.stream()
                    .filter(b -> b.getId().equals(stock.getBranchId()))
                    .findFirst().orElse(null);
            if (branch != null) {
                BookStockVO vo = convertToVO(stock, branch, null, null);
                voList.add(vo);
            }
        }
        return voList;
    }

    public BookStockVO findStockByBookIdAndBranchId(Long bookId, Long branchId) {
        BookStock stock = bookStockMapper.findByBookIdAndBranchId(bookId, branchId);
        if (stock == null) {
            return null;
        }
        Branch branch = branchMapper.findById(branchId);
        return convertToVO(stock, branch, null, null);
    }

    public List<BookStockVO> findNearbyBranchesWithStock(NearbyBranchQueryDTO dto) {
        if (dto.getBookId() == null) {
            throw new IllegalArgumentException("图书ID不能为空");
        }
        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            return findStockByBookId(dto.getBookId());
        }

        int requiredQuantity = dto.getQuantity() != null ? dto.getQuantity() : 1;
        List<BookStock> stockList = bookStockMapper.findByBookId(dto.getBookId());
        List<Branch> branches = branchMapper.findAll();
        List<BookStockVO> voList = new ArrayList<>();

        for (BookStock stock : stockList) {
            Branch branch = branches.stream()
                    .filter(b -> b.getId().equals(stock.getBranchId()))
                    .findFirst().orElse(null);
            if (branch != null) {
                double distance = DistanceUtil.calculateDistance(
                        dto.getLatitude(), dto.getLongitude(),
                        branch.getLatitude(), branch.getLongitude()
                );
                BookStockVO vo = convertToVO(stock, branch, distance, requiredQuantity);
                voList.add(vo);
            }
        }

        voList.sort(Comparator.comparingDouble(BookStockVO::getDistance));
        return voList;
    }

    public List<BookStockVO> findStockByBranchId(Long branchId) {
        List<BookStock> stockList = bookStockMapper.findByBranchId(branchId);
        Branch branch = branchMapper.findById(branchId);
        List<BookStockVO> voList = new ArrayList<>();
        for (BookStock stock : stockList) {
            BookStockVO vo = convertToVO(stock, branch, null, null);
            voList.add(vo);
        }
        return voList;
    }

    private BookStockVO convertToVO(BookStock stock, Branch branch, Double distance, Integer requiredQuantity) {
        BookStockVO vo = new BookStockVO();
        vo.setBranchId(branch.getId());
        vo.setBranchName(branch.getName());
        vo.setAddress(branch.getAddress());
        vo.setLatitude(branch.getLatitude());
        vo.setLongitude(branch.getLongitude());
        vo.setPhone(branch.getPhone());
        vo.setBusinessHours(branch.getBusinessHours());
        vo.setStockQuantity(stock.getStockQuantity());
        vo.setAvailableQuantity(stock.getAvailableQuantity());
        vo.setInTransitQuantity(stock.getInTransitQuantity());
        if (distance != null) {
            vo.setDistance(distance);
            vo.setDistanceText(DistanceUtil.formatDistance(distance));
        }
        return vo;
    }
}
