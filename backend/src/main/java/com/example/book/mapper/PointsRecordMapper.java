package com.example.book.mapper;

import com.example.book.entity.PointsRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PointsRecordMapper {
    PointsRecord findByUserAndSource(@Param("userId") Long userId,
                                      @Param("sourceType") String sourceType,
                                      @Param("sourceId") String sourceId);
    int insert(PointsRecord pointsRecord);
    List<PointsRecord> findByUserId(@Param("userId") Long userId,
                                     @Param("offset") Integer offset,
                                     @Param("limit") Integer limit);
    int countByUserId(@Param("userId") Long userId);
}
