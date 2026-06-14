package com.example.book.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class KeywordExtractionService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "的", "了", "是", "我", "你", "他", "她", "它", "们", "在", "有", "和", "与", "及", "或",
        "也", "都", "就", "才", "只", "能", "可以", "可能", "应该", "应当", "需要", "想要",
        "这", "那", "个", "些", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
        "不", "很", "非常", "特别", "比较", "更", "最", "太", "真", "好", "不错",
        "看", "读", "想", "要", "希望", "求", "推荐", "介绍", "什么", "怎么", "如何", "哪些",
        "比较", "适合", "关于", "有关", "方面", "类型", "风格", "那种", "一下", "一个",
        "一些", "一点", "有没有", "有点", "还是", "或者", "以及", "等等", "之类",
        "啊", "呀", "吧", "呢", "吗", "哦", "嗯", "哈", "啦", "喽",
        "本书", "这本书", "那本书", "这类", "那类", "以上", "以下", "以内", "以外",
        "其中", "其中", "主要", "重要", "核心", "关键", "基本", "基础",
        "包括", "包含", "涉及", "关于", "对于", "对", "给", "让", "把", "被",
        "从", "自从", "当", "随着", "通过", "经过", "根据", "按照", "依据",
        "上", "下", "左", "右", "前", "后", "里", "外", "中", "内", "间",
        "等", "等等", "之类", "诸如", "例如", "比如", "譬如",
        "可以", "能够", "会", "要", "将", "正在", "已经", "曾经", "一直", "总是",
        "但是", "然而", "不过", "虽然", "尽管", "即使", "所以", "因此", "因而",
        "因为", "由于", "如果", "假如", "只要", "除非", "无论", "不管",
        "而且", "并且", "同时", "以及", "既", "又", "不是", "而是",
        "书名", "作者", "简介", "内容", "目录", "前言", "序", "跋", "后记",
        "出版", "出版社", "出版日期", "定价", "价格", "ISBN", "isbn",
        "一部", "一本", "一套", "一册", "一卷", "一篇", "一章", "一节"
    ));

    private static final Map<String, List<String>> KEYWORD_SYNONYMS = new HashMap<>();

    static {
        KEYWORD_SYNONYMS.put("人工智能", Arrays.asList("人工智能", "AI", "机器学习", "深度学习", "神经网络", "智能"));
        KEYWORD_SYNONYMS.put("算法", Arrays.asList("算法", "算法导论", "数据结构", "计算机算法"));
        KEYWORD_SYNONYMS.put("编程", Arrays.asList("编程", "程序设计", "写代码", "编码", "开发"));
        KEYWORD_SYNONYMS.put("Python", Arrays.asList("Python", "python", "py", "蟒蛇", "爬虫", "数据分析"));
        KEYWORD_SYNONYMS.put("Java", Arrays.asList("Java", "java", "爪哇", "企业级开发"));
        KEYWORD_SYNONYMS.put("前端", Arrays.asList("前端", "web前端", "网页开发", "HTML", "CSS", "JavaScript"));
        KEYWORD_SYNONYMS.put("数据库", Arrays.asList("数据库", "MySQL", "SQL", "数据存储", "数据管理"));
        KEYWORD_SYNONYMS.put("设计模式", Arrays.asList("设计模式", "软件设计", "架构设计", "面向对象"));
        KEYWORD_SYNONYMS.put("网络", Arrays.asList("网络", "计算机网络", "网络通信", "TCP/IP", "HTTP"));
        KEYWORD_SYNONYMS.put("操作系统", Arrays.asList("操作系统", "OS", "Linux", "Windows", "内核"));
        KEYWORD_SYNONYMS.put("宇宙", Arrays.asList("宇宙", "太空", "星空", "天体", "星系", "银河"));
        KEYWORD_SYNONYMS.put("时间", Arrays.asList("时间", "时光", "岁月", "时空", "时间旅行"));
        KEYWORD_SYNONYMS.put("生命", Arrays.asList("生命", "人生", "生活", "生命意义", "存在"));
        KEYWORD_SYNONYMS.put("战争", Arrays.asList("战争", "军事", "战役", "战斗", "战略", "战术"));
        KEYWORD_SYNONYMS.put("爱情", Arrays.asList("爱情", "恋爱", "情感", "感情", "真爱", "浪漫"));
        KEYWORD_SYNONYMS.put("友情", Arrays.asList("友情", "友谊", "朋友", "兄弟", "闺蜜"));
        KEYWORD_SYNONYMS.put("亲情", Arrays.asList("亲情", "家人", "父母", "子女", "家庭"));
        KEYWORD_SYNONYMS.put("成长", Arrays.asList("成长", "长大", "成熟", "蜕变", "成长历程"));
        KEYWORD_SYNONYMS.put("梦想", Arrays.asList("梦想", "理想", "追求", "目标", "希望"));
        KEYWORD_SYNONYMS.put("自由", Arrays.asList("自由", "解放", "独立", "自主", "无拘无束"));
        KEYWORD_SYNONYMS.put("冒险", Arrays.asList("冒险", "探险", "奇遇", "旅程", "历险"));
        KEYWORD_SYNONYMS.put("神秘", Arrays.asList("神秘", "秘密", "谜团", "未知", "悬念"));
        KEYWORD_SYNONYMS.put("未来", Arrays.asList("未来", "将来", "明日", "未来世界", "科幻世界"));
        KEYWORD_SYNONYMS.put("过去", Arrays.asList("过去", "曾经", "往事", "回忆", "历史"));
        KEYWORD_SYNONYMS.put("中国", Arrays.asList("中国", "中华", "华夏", "神州", "china"));
        KEYWORD_SYNONYMS.put("日本", Arrays.asList("日本", "东瀛", "japan", "日式"));
        KEYWORD_SYNONYMS.put("美国", Arrays.asList("美国", "美利坚", "USA", "America", "美式"));
        KEYWORD_SYNONYMS.put("欧洲", Arrays.asList("欧洲", "Europe", "欧美", "西方"));
    }

    public List<String> extractKeywords(String text, int maxKeywords) {
        List<String> keywords = new ArrayList<>();
        
        if (text == null || text.trim().isEmpty()) {
            return keywords;
        }

        String cleanedText = text.toLowerCase();
        cleanedText = cleanedText.replaceAll("[\\pP\\pS\\pZ\\pC]", " ");
        cleanedText = cleanedText.replaceAll("\\s+", " ").trim();

        Pattern chinesePattern = Pattern.compile("[\\u4e00-\\u9fa5]{2,}");
        Matcher chineseMatcher = chinesePattern.matcher(cleanedText);
        while (chineseMatcher.find()) {
            String word = chineseMatcher.group();
            if (!STOP_WORDS.contains(word) && word.length() >= 2) {
                if (!keywords.contains(word)) {
                    keywords.add(word);
                }
            }
        }

        Pattern englishPattern = Pattern.compile("[a-zA-Z][a-zA-Z0-9]{2,}");
        Matcher englishMatcher = englishPattern.matcher(cleanedText);
        while (englishMatcher.find()) {
            String word = englishMatcher.group();
            if (!STOP_WORDS.contains(word.toLowerCase()) && word.length() >= 3) {
                if (!keywords.contains(word)) {
                    keywords.add(word);
                }
            }
        }

        Pattern numberPattern = Pattern.compile("\\d+(?:\\.\\d+)?");
        Matcher numberMatcher = numberPattern.matcher(cleanedText);
        while (numberMatcher.find()) {
            String word = numberMatcher.group();
            if (word.length() >= 2) {
                if (!keywords.contains(word)) {
                    keywords.add(word);
                }
            }
        }

        if (keywords.size() > maxKeywords) {
            keywords = keywords.subList(0, maxKeywords);
        }

        return keywords;
    }

    public List<String> expandKeywords(List<String> keywords) {
        Set<String> expanded = new HashSet<>();
        
        for (String keyword : keywords) {
            expanded.add(keyword);
            
            for (Map.Entry<String, List<String>> entry : KEYWORD_SYNONYMS.entrySet()) {
                String standard = entry.getKey();
                List<String> synonyms = entry.getValue();
                
                if (keyword.equalsIgnoreCase(standard) || synonyms.contains(keyword.toLowerCase())) {
                    expanded.addAll(synonyms);
                }
            }

            String lowerKeyword = keyword.toLowerCase();
            for (Map.Entry<String, List<String>> entry : KEYWORD_SYNONYMS.entrySet()) {
                if (entry.getKey().toLowerCase().contains(lowerKeyword) || 
                    lowerKeyword.contains(entry.getKey().toLowerCase())) {
                    expanded.add(entry.getKey());
                    expanded.addAll(entry.getValue());
                }
            }
        }

        List<String> result = new ArrayList<>(expanded);
        result.removeIf(STOP_WORDS::contains);
        return result;
    }

    public Map<String, Double> calculateTfIdf(List<String> documents, List<String> keywords) {
        Map<String, Double> tfidfScores = new HashMap<>();
        
        int totalDocs = documents.size();
        
        for (String keyword : keywords) {
            int docFreq = 0;
            double totalTf = 0;
            
            for (String doc : documents) {
                String lowerDoc = doc.toLowerCase();
                String lowerKeyword = keyword.toLowerCase();
                
                int termCount = 0;
                int fromIndex = 0;
                while ((fromIndex = lowerDoc.indexOf(lowerKeyword, fromIndex)) != -1) {
                    termCount++;
                    fromIndex += lowerKeyword.length();
                }
                
                double tf = termCount;
                totalTf += tf;
                
                if (termCount > 0) {
                    docFreq++;
                }
            }
            
            double avgTf = totalTf / totalDocs;
            double idf = Math.log((double) (totalDocs + 1) / (docFreq + 1)) + 1;
            double tfidf = avgTf * idf;
            
            tfidfScores.put(keyword, tfidf);
        }
        
        return normalizeScores(tfidfScores);
    }

    public Map<String, Double> normalizeScores(Map<String, Double> scores) {
        if (scores.isEmpty()) {
            return scores;
        }
        
        double maxScore = Collections.max(scores.values());
        if (maxScore == 0) {
            maxScore = 1;
        }
        
        Map<String, Double> normalized = new HashMap<>();
        for (Map.Entry<String, Double> entry : scores.entrySet()) {
            normalized.put(entry.getKey(), entry.getValue() / maxScore);
        }
        
        return normalized;
    }

    public double calculateSimilarity(List<String> keywords1, List<String> keywords2) {
        if (keywords1.isEmpty() || keywords2.isEmpty()) {
            return 0;
        }
        
        Set<String> set1 = new HashSet<>(keywords1);
        Set<String> set2 = new HashSet<>(keywords2);
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        if (union.isEmpty()) {
            return 0;
        }
        
        double jaccard = (double) intersection.size() / union.size();
        
        int matchCount = 0;
        for (String k1 : keywords1) {
            for (String k2 : keywords2) {
                if (k1.equalsIgnoreCase(k2)) {
                    matchCount++;
                } else if (k1.toLowerCase().contains(k2.toLowerCase()) || 
                           k2.toLowerCase().contains(k1.toLowerCase())) {
                    matchCount += 0.5;
                }
            }
        }
        
        double containScore = (double) matchCount / Math.max(keywords1.size(), keywords2.size());
        
        return 0.6 * jaccard + 0.4 * containScore;
    }

    public String keywordsToJson(List<String> keywords) {
        try {
            return objectMapper.writeValueAsString(keywords);
        } catch (Exception e) {
            return "[]";
        }
    }

    public List<String> jsonToKeywords(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public String mapToJson(Map<String, Double> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    public Map<String, Double> jsonToMap(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Double>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
