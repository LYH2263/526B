package com.example.book.mapper;

import com.example.book.entity.PointsAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PointsAccountMapper {
    PointsAccount findByUserId(@Param("userId") Long userId);
    int insert(PointsAccount pointsAccount);
    int updatePointsAndLevel(@Param("userId") Long userId, @Param("points") Integer points,
                              @Param("level") String level, @Param("version") Integer version);
    int incrementPoints(@Param("userId") Long userId, @Param("points") Integer points);
}
