package com.example.book.service;

import com.example.book.entity.PointsAccount;
import com.example.book.entity.PointsRecord;
import com.example.book.enums.MemberLevel;
import com.example.book.enums.PointsSourceType;
import com.example.book.mapper.PointsAccountMapper;
import com.example.book.mapper.PointsRecordMapper;
import com.example.book.vo.PointsAccountVO;
import com.example.book.vo.PointsRecordVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class PointsService {

    @Autowired
    private PointsAccountMapper pointsAccountMapper;

    @Autowired
    private PointsRecordMapper pointsRecordMapper;

    public PointsAccountVO getPointsAccount(Long userId) {
        PointsAccount account = pointsAccountMapper.findByUserId(userId);
        if (account == null) {
            account = createAccount(userId);
        }
        return convertToVO(account);
    }

    private PointsAccount createAccount(Long userId) {
        PointsAccount account = new PointsAccount();
        account.setUserId(userId);
        account.setTotalPoints(0);
        account.setLevel(MemberLevel.COMMON.name());
        account.setVersion(0);
        pointsAccountMapper.insert(account);
        return account;
    }

    private PointsAccountVO convertToVO(PointsAccount account) {
        PointsAccountVO vo = new PointsAccountVO();
        vo.setUserId(account.getUserId());
        vo.setTotalPoints(account.getTotalPoints());

        MemberLevel level = MemberLevel.getLevelByPoints(account.getTotalPoints());
        vo.setLevel(level.name());
        vo.setLevelName(level.getName());
        vo.setLevelColor(level.getColor());
        vo.setLevelIcon(level.getIcon());

        MemberLevel nextLevel = MemberLevel.getNextLevel(level);
        if (nextLevel != null) {
            vo.setNextLevelThreshold(nextLevel.getThreshold());
            vo.setNextLevelName(nextLevel.getName());
            vo.setIsMaxLevel(false);
            int currentLevelPoints = level.getThreshold();
            int progress = account.getTotalPoints() - currentLevelPoints;
            int total = nextLevel.getThreshold() - currentLevelPoints;
            vo.setCurrentLevelPoints(currentLevelPoints);
            vo.setProgressPercent(total > 0 ? Math.min(100, progress * 100 / total) : 0);
        } else {
            vo.setNextLevelThreshold(level.getThreshold());
            vo.setNextLevelName(level.getName());
            vo.setIsMaxLevel(true);
            vo.setCurrentLevelPoints(level.getThreshold());
            vo.setProgressPercent(100);
        }

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public PointsAccountVO addPoints(Long userId, PointsSourceType sourceType, String sourceId, String description) {
        if (userId == null || sourceType == null) {
            throw new IllegalArgumentException("参数错误");
        }

        PointsRecord existingRecord = pointsRecordMapper.findByUserAndSource(
                userId, sourceType.name(), sourceId);
        if (existingRecord != null) {
            PointsAccount account = pointsAccountMapper.findByUserId(userId);
            if (account == null) {
                account = createAccount(userId);
            }
            return convertToVO(account);
        }

        PointsAccount account = pointsAccountMapper.findByUserId(userId);
        if (account == null) {
            account = createAccount(userId);
        }

        int pointsToAdd = sourceType.getPoints();
        int newPoints = account.getTotalPoints() + pointsToAdd;
        if (newPoints < 0) {
            throw new IllegalArgumentException("积分不能为负");
        }

        MemberLevel newLevel = MemberLevel.getLevelByPoints(newPoints);

        int maxRetries = 3;
        boolean updated = false;
        for (int i = 0; i < maxRetries && !updated; i++) {
            int result = pointsAccountMapper.updatePointsAndLevel(
                    userId, newPoints, newLevel.name(), account.getVersion());
            if (result > 0) {
                updated = true;
            } else {
                account = pointsAccountMapper.findByUserId(userId);
                newPoints = account.getTotalPoints() + pointsToAdd;
                if (newPoints < 0) {
                    throw new IllegalArgumentException("积分不能为负");
                }
                newLevel = MemberLevel.getLevelByPoints(newPoints);
            }
        }

        if (!updated) {
            throw new RuntimeException("积分更新失败，请重试");
        }

        PointsRecord record = new PointsRecord();
        record.setUserId(userId);
        record.setPointsChange(pointsToAdd);
        record.setPointsAfter(newPoints);
        record.setSourceType(sourceType.name());
        record.setSourceId(sourceId);
        record.setDescription(description != null ? description : sourceType.getDescription());

        try {
            pointsRecordMapper.insert(record);
        } catch (Exception e) {
            PointsAccount finalAccount = pointsAccountMapper.findByUserId(userId);
            return convertToVO(finalAccount);
        }

        account = pointsAccountMapper.findByUserId(userId);
        return convertToVO(account);
    }

    public PointsAccountVO addLoginPoints(Long userId) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sourceId = "LOGIN_" + today;
        return addPoints(userId, PointsSourceType.LOGIN, sourceId, "每日登录奖励");
    }

    public PointsAccountVO addReadBookPoints(Long userId, Long bookId) {
        String sourceId = "READ_" + bookId;
        return addPoints(userId, PointsSourceType.READ_BOOK, sourceId, "阅读图书");
    }

    public PointsAccountVO addCartPoints(Long userId, Long bookId) {
        String sourceId = "CART_" + bookId;
        return addPoints(userId, PointsSourceType.ADD_CART, sourceId, "首次加入购物车");
    }

    public PointsAccountVO addOrderPoints(Long userId, String orderNo) {
        String sourceId = "ORDER_" + orderNo;
        return addPoints(userId, PointsSourceType.PLACE_ORDER, sourceId, "完成下单");
    }

    public List<PointsRecordVO> getPointsRecords(Long userId, int page, int size) {
        int offset = (page - 1) * size;
        List<PointsRecord> records = pointsRecordMapper.findByUserId(userId, offset, size);
        List<PointsRecordVO> vos = new ArrayList<>();
        for (PointsRecord record : records) {
            PointsRecordVO vo = new PointsRecordVO();
            vo.setId(record.getId());
            vo.setPointsChange(record.getPointsChange());
            vo.setPointsAfter(record.getPointsAfter());
            vo.setSourceType(record.getSourceType());
            vo.setDescription(record.getDescription());
            vo.setCreatedAt(record.getCreatedAt());

            try {
                PointsSourceType sourceType = PointsSourceType.valueOf(record.getSourceType());
                vo.setSourceName(sourceType.getDescription());
            } catch (IllegalArgumentException e) {
                vo.setSourceName(record.getSourceType());
            }

            vos.add(vo);
        }
        return vos;
    }

    public int getPointsRecordCount(Long userId) {
        return pointsRecordMapper.countByUserId(userId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void recalculateAllLevels() {
    }
}
