CREATE TABLE IF NOT EXISTS book (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '书名',
    author VARCHAR(255) NOT NULL COMMENT '作者',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    publish_date DATE COMMENT '出版日期',
    description TEXT COMMENT '描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS book_version (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL COMMENT '图书ID',
    version_number INT NOT NULL COMMENT '版本号',
    modifier_name VARCHAR(50) NOT NULL COMMENT '修改人',
    change_type VARCHAR(20) NOT NULL COMMENT '变更类型：CREATE-新建，UPDATE-修改，ROLLBACK-回滚',
    title VARCHAR(255) NOT NULL COMMENT '书名快照',
    author VARCHAR(255) NOT NULL COMMENT '作者快照',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格快照',
    publish_date DATE COMMENT '出版日期快照',
    description TEXT COMMENT '描述快照',
    rollback_from_version INT COMMENT '回滚来源版本号（仅回滚类型有值）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '版本创建时间',
    INDEX idx_book_id (book_id),
    INDEX idx_book_version (book_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    role VARCHAR(20) NOT NULL DEFAULT 'LIBRARIAN' COMMENT '角色：LIBRARIAN-馆员，ADMIN-管理员'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    book_id BIGINT NOT NULL COMMENT '图书ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_book (user_id, book_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '订单状态：1-已创建，2-已支付，3-已取消',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    book_id BIGINT NOT NULL COMMENT '图书ID',
    book_title VARCHAR(255) NOT NULL COMMENT '书名快照',
    book_author VARCHAR(255) NOT NULL COMMENT '作者快照',
    price DECIMAL(10, 2) NOT NULL COMMENT '下单时价格快照',
    quantity INT NOT NULL COMMENT '购买数量',
    subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计金额',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_title VARCHAR(255) NOT NULL COMMENT '拟采购书名',
    book_author VARCHAR(255) NOT NULL COMMENT '作者',
    estimated_price DECIMAL(10, 2) NOT NULL COMMENT '预估单价',
    quantity INT NOT NULL COMMENT '数量',
    purchase_reason TEXT NOT NULL COMMENT '采购理由',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态：PENDING-待审批，APPROVED-已通过，REJECTED-已驳回，STOCKED-已入库',
    reject_reason TEXT COMMENT '驳回理由',
    applicant_id BIGINT NOT NULL COMMENT '申请人ID',
    applicant_name VARCHAR(50) NOT NULL COMMENT '申请人姓名',
    approver_id BIGINT COMMENT '审批人ID',
    approver_name VARCHAR(50) COMMENT '审批人姓名',
    stocker_id BIGINT COMMENT '入库操作人ID',
    stocker_name VARCHAR(50) COMMENT '入库操作人姓名',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号，用于并发控制',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    approved_at DATETIME COMMENT '审批通过时间',
    rejected_at DATETIME COMMENT '驳回时间',
    stocked_at DATETIME COMMENT '入库时间',
    INDEX idx_status (status),
    INDEX idx_applicant_id (applicant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_request_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL COMMENT '采购申请单ID',
    from_status VARCHAR(20) COMMENT '原状态',
    to_status VARCHAR(20) NOT NULL COMMENT '目标状态',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名',
    remark TEXT COMMENT '备注（如驳回意见）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_request_id (request_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    book_id BIGINT NOT NULL COMMENT '图书ID',
    book_title VARCHAR(255) NOT NULL COMMENT '书名快照',
    book_author VARCHAR(255) NOT NULL COMMENT '作者快照',
    current_page INT NOT NULL DEFAULT 1 COMMENT '当前页码',
    total_pages INT NOT NULL DEFAULT 100 COMMENT '总页数',
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '阅读百分比',
    last_read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近阅读时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_book (user_id, book_id),
    INDEX idx_user_id (user_id),
    INDEX idx_last_read (user_id, last_read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS points_account (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    total_points INT NOT NULL DEFAULT 0 COMMENT '总积分',
    level VARCHAR(20) NOT NULL DEFAULT 'COMMON' COMMENT '等级：COMMON-普通，SILVER-银，GOLD-金，DIAMOND-钻',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS points_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    points_change INT NOT NULL COMMENT '积分变化值（正为增加，负为减少）',
    points_after INT NOT NULL COMMENT '变化后积分',
    source_type VARCHAR(50) NOT NULL COMMENT '来源类型：LOGIN-登录，READ_BOOK-阅读，ADD_CART-加购，PLACE_ORDER-下单',
    source_id VARCHAR(100) COMMENT '来源唯一标识（用于幂等去重）',
    description VARCHAR(255) COMMENT '描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_source (user_id, source_type, source_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '书单名称',
    description TEXT COMMENT '书单简介',
    cover_url VARCHAR(500) COMMENT '封面图片URL',
    is_public TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开：0-私有，1-公开',
    user_id BIGINT NOT NULL COMMENT '创建用户ID',
    share_token VARCHAR(64) COMMENT '公开分享Token（防枚举）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_share_token (share_token),
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booklist_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booklist_id BIGINT NOT NULL COMMENT '书单ID',
    book_id BIGINT NOT NULL COMMENT '图书ID',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序（越小越靠前）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_booklist_book (booklist_id, book_id),
    INDEX idx_booklist_id (booklist_id),
    INDEX idx_book_id (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS book_semantic_index (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL COMMENT '图书ID',
    content_text TEXT NOT NULL COMMENT '用于语义分析的完整文本（书名+作者+简介）',
    keywords TEXT COMMENT '提取的关键词JSON数组',
    genre_tags VARCHAR(500) COMMENT '题材标签，逗号分隔',
    audience_tags VARCHAR(500) COMMENT '受众标签，逗号分隔',
    style_tags VARCHAR(500) COMMENT '风格标签，逗号分隔',
    embedding_vector TEXT COMMENT '向量嵌入（JSON数组，可选）',
    tfidf_scores TEXT COMMENT 'TF-IDF权重得分（JSON格式）',
    index_version INT NOT NULL DEFAULT 1 COMMENT '索引版本号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_book_id (book_id),
    INDEX idx_book_id (book_id),
    INDEX idx_genre_tags (genre_tags),
    INDEX idx_audience_tags (audience_tags),
    INDEX idx_style_tags (style_tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
