package com.example.book.service;

import com.example.book.dto.ParsedConstraints;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ConstraintParserService {

    private static final Map<String, List<String>> GENRE_SYNONYMS = new HashMap<>();
    private static final Map<String, List<String>> AUDIENCE_SYNONYMS = new HashMap<>();
    private static final Map<String, List<String>> STYLE_SYNONYMS = new HashMap<>();

    static {
        GENRE_SYNONYMS.put("科幻", Arrays.asList("科幻", "science fiction", "sci-fi", "科幻小说", "未来", "太空", "科技"));
        GENRE_SYNONYMS.put("奇幻", Arrays.asList("奇幻", "fantasy", "魔幻", "魔法", "玄幻"));
        GENRE_SYNONYMS.put("言情", Arrays.asList("言情", "romance", "爱情", "恋爱", "情感", "青春爱情"));
        GENRE_SYNONYMS.put("悬疑", Arrays.asList("悬疑", "mystery", "推理", "侦探", "破案", "悬疑推理"));
        GENRE_SYNONYMS.put("恐怖", Arrays.asList("恐怖", "horror", "惊悚", "鬼故事", "灵异"));
        GENRE_SYNONYMS.put("历史", Arrays.asList("历史", "history", "历史小说", "史实", "历史传记"));
        GENRE_SYNONYMS.put("军事", Arrays.asList("军事", "military", "战争", "军旅", "战争历史"));
        GENRE_SYNONYMS.put("武侠", Arrays.asList("武侠", "武侠小说", "功夫", "江湖", "侠义"));
        GENRE_SYNONYMS.put("都市", Arrays.asList("都市", "urban", "城市", "现代都市", "职场"));
        GENRE_SYNONYMS.put("校园", Arrays.asList("校园", "school", "青春校园", "学生", "校园生活"));
        GENRE_SYNONYMS.put("文学", Arrays.asList("文学", "literature", "纯文学", "经典文学", "文学作品"));
        GENRE_SYNONYMS.put("哲学", Arrays.asList("哲学", "philosophy", "哲学思想", "人生哲学"));
        GENRE_SYNONYMS.put("经济", Arrays.asList("经济", "economics", "经济学", "商业", "金融"));
        GENRE_SYNONYMS.put("心理学", Arrays.asList("心理学", "psychology", "心理", "社会心理", "心理学书籍"));
        GENRE_SYNONYMS.put("科普", Arrays.asList("科普", "popular science", "科学普及", "科普读物", "科技"));
        GENRE_SYNONYMS.put("传记", Arrays.asList("传记", "biography", "人物传记", "自传", "名人传记"));
        GENRE_SYNONYMS.put("旅行", Arrays.asList("旅行", "travel", "旅游", "游记", "旅行随笔"));
        GENRE_SYNONYMS.put("美食", Arrays.asList("美食", "food", "烹饪", "菜谱", "饮食"));
        GENRE_SYNONYMS.put("艺术", Arrays.asList("艺术", "art", "美术", "绘画", "音乐", "艺术设计"));
        GENRE_SYNONYMS.put("教育", Arrays.asList("教育", "education", "教育学", "学习方法", "教育理论"));

        AUDIENCE_SYNONYMS.put("儿童", Arrays.asList("儿童", "children", "小孩", "小朋友", "小学生", "少儿"));
        AUDIENCE_SYNONYMS.put("青少年", Arrays.asList("青少年", "teenager", "青年", "少年", "年轻人"));
        AUDIENCE_SYNONYMS.put("初中生", Arrays.asList("初中生", "初中", "中学生", "初中学生", "middle school"));
        AUDIENCE_SYNONYMS.put("高中生", Arrays.asList("高中生", "高中", "高中学生", "high school"));
        AUDIENCE_SYNONYMS.put("大学生", Arrays.asList("大学生", "大学", "高校", "college", "university", "大学生"));
        AUDIENCE_SYNONYMS.put("成年人", Arrays.asList("成年人", "adult", "成人", "grown-up", "职场人士"));
        AUDIENCE_SYNONYMS.put("老年人", Arrays.asList("老年人", "elderly", "老人", "中老年", "senior"));
        AUDIENCE_SYNONYMS.put("男性", Arrays.asList("男性", "male", "男生", "男孩", "男士"));
        AUDIENCE_SYNONYMS.put("女性", Arrays.asList("女性", "female", "女生", "女孩", "女士"));
        AUDIENCE_SYNONYMS.put("家长", Arrays.asList("家长", "parent", "父母", "亲子阅读", "家庭教育"));
        AUDIENCE_SYNONYMS.put("教师", Arrays.asList("教师", "teacher", "老师", "教育工作者", "教学"));
        AUDIENCE_SYNONYMS.put("程序员", Arrays.asList("程序员", "programmer", "开发者", "developer", "码农", "it人士"));
        AUDIENCE_SYNONYMS.put("创业者", Arrays.asList("创业者", "entrepreneur", "创业", "企业家", "startup"));

        STYLE_SYNONYMS.put("轻松", Arrays.asList("轻松", "relaxed", "relaxing", "休闲", "放松", "轻松愉快", "不费脑", "轻松幽默"));
        STYLE_SYNONYMS.put("严肃", Arrays.asList("严肃", "serious", "严谨", "深度", "深刻", "严肃认真"));
        STYLE_SYNONYMS.put("幽默", Arrays.asList("幽默", "humor", "humorous", "搞笑", "风趣", "爆笑", "喜剧", "funny"));
        STYLE_SYNONYMS.put("伤感", Arrays.asList("伤感", "sad", "悲伤", "虐心", "感人", "催泪", "感动"));
        STYLE_SYNONYMS.put("治愈", Arrays.asList("治愈", "healing", "温暖", "温馨", "暖心", "治愈系"));
        STYLE_SYNONYMS.put("烧脑", Arrays.asList("烧脑", "brain-burning", "烧脑", "逻辑推理", "智商在线", "高智商"));
        STYLE_SYNONYMS.put("热血", Arrays.asList("热血", "passionate", "激情", "热血沸腾", "燃", "燃向"));
        STYLE_SYNONYMS.put("治愈系", Arrays.asList("治愈系", "healing", "温暖治愈", "小清新"));
        STYLE_SYNONYMS.put("暗黑", Arrays.asList("暗黑", "dark", "黑暗", "阴郁", "致郁"));
        STYLE_SYNONYMS.put("正能量", Arrays.asList("正能量", "positive", "励志", "积极", "向上", "激励"));
        STYLE_SYNONYMS.put("经典", Arrays.asList("经典", "classic", "名著", "经典名著", "公认经典"));
        STYLE_SYNONYMS.put("畅销", Arrays.asList("畅销", "bestseller", "热门", "爆款", "畅销书"));
        STYLE_SYNONYMS.put("专业", Arrays.asList("专业", "professional", "技术", "技术书籍", "专业书籍"));
        STYLE_SYNONYMS.put("入门", Arrays.asList("入门", "beginner", "入门级", "初学者", "零基础", "新手友好"));
        STYLE_SYNONYMS.put("深度", Arrays.asList("深度", "in-depth", "有深度", "思想深刻", "内涵"));
    }

    private static final List<String> STOP_WORDS = Arrays.asList(
        "的", "了", "是", "我", "你", "他", "她", "它", "们", "在", "有", "和", "与", "及", "或",
        "看", "读", "想", "要", "希望", "求", "推荐", "介绍", "什么", "怎么", "如何", "哪些", "什么",
        "比较", "适合", "关于", "有关", "方面", "类型", "风格", "那种", "那种", "一下", "一个",
        "一些", "一点", "有没有", "有没有", "推荐一下", "有没有什么", "有点", "比较", "更", "还",
        "都", "就", "才", "只", "能", "可以", "可能", "应该", "应当", "需要", "想要",
        "给", "对", "让", "把", "被", "给", "向", "往", "从", "自从", "当", "随着",
        "啊", "呀", "吧", "呢", "吗", "哦", "嗯", "哈", "啦", "喽"
    );

    public ParsedConstraints parse(String query) {
        ParsedConstraints constraints = new ParsedConstraints();
        Map<String, String> matchedPatterns = new HashMap<>();

        if (query == null || query.trim().isEmpty()) {
            constraints.setGenres(new ArrayList<>());
            constraints.setAudiences(new ArrayList<>());
            constraints.setStyles(new ArrayList<>());
            constraints.setKeywords(new ArrayList<>());
            constraints.setCleanedQuery("");
            constraints.setMatchedPatterns(matchedPatterns);
            return constraints;
        }

        String lowerQuery = query.toLowerCase();
        List<String> genres = new ArrayList<>();
        List<String> audiences = new ArrayList<>();
        List<String> styles = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : GENRE_SYNONYMS.entrySet()) {
            String standard = entry.getKey();
            for (String synonym : entry.getValue()) {
                if (lowerQuery.contains(synonym.toLowerCase())) {
                    if (!genres.contains(standard)) {
                        genres.add(standard);
                        matchedPatterns.put(standard, synonym);
                    }
                    break;
                }
            }
        }

        for (Map.Entry<String, List<String>> entry : AUDIENCE_SYNONYMS.entrySet()) {
            String standard = entry.getKey();
            for (String synonym : entry.getValue()) {
                if (lowerQuery.contains(synonym.toLowerCase())) {
                    if (!audiences.contains(standard)) {
                        audiences.add(standard);
                        matchedPatterns.put(standard, synonym);
                    }
                    break;
                }
            }
        }

        for (Map.Entry<String, List<String>> entry : STYLE_SYNONYMS.entrySet()) {
            String standard = entry.getKey();
            for (String synonym : entry.getValue()) {
                if (lowerQuery.contains(synonym.toLowerCase())) {
                    if (!styles.contains(standard)) {
                        styles.add(standard);
                        matchedPatterns.put(standard, synonym);
                    }
                    break;
                }
            }
        }

        String cleanedQuery = query;
        for (String pattern : matchedPatterns.values()) {
            cleanedQuery = cleanedQuery.replaceAll("(?i)" + Pattern.quote(pattern), " ");
        }
        for (String stopWord : STOP_WORDS) {
            cleanedQuery = cleanedQuery.replaceAll("(?i)\\b" + Pattern.quote(stopWord) + "\\b", " ");
        }
        cleanedQuery = cleanedQuery.replaceAll("[，。！？、；：\"'「」『』（）\\[\\]【】《》…—·\\s]+", " ").trim();

        List<String> keywords = new ArrayList<>();
        if (!cleanedQuery.isEmpty()) {
            String[] parts = cleanedQuery.split("\\s+");
            for (String part : parts) {
                if (part.length() >= 2 && !STOP_WORDS.contains(part.toLowerCase())) {
                    keywords.add(part);
                }
            }
        }

        constraints.setGenres(genres);
        constraints.setAudiences(audiences);
        constraints.setStyles(styles);
        constraints.setKeywords(keywords);
        constraints.setCleanedQuery(cleanedQuery);
        constraints.setMatchedPatterns(matchedPatterns);

        return constraints;
    }

    public List<String> getGenreSynonyms(String genre) {
        return GENRE_SYNONYMS.getOrDefault(genre, Collections.singletonList(genre));
    }

    public List<String> getAudienceSynonyms(String audience) {
        return AUDIENCE_SYNONYMS.getOrDefault(audience, Collections.singletonList(audience));
    }

    public List<String> getStyleSynonyms(String style) {
        return STYLE_SYNONYMS.getOrDefault(style, Collections.singletonList(style));
    }

    public Map<String, List<String>> getAllGenreSynonyms() {
        return GENRE_SYNONYMS;
    }

    public Map<String, List<String>> getAllAudienceSynonyms() {
        return AUDIENCE_SYNONYMS;
    }

    public Map<String, List<String>> getAllStyleSynonyms() {
        return STYLE_SYNONYMS;
    }
}
