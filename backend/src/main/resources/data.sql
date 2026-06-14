INSERT IGNORE INTO book (id, title, author, price, publish_date, description) VALUES 
(1, '三体', '刘慈欣', 39.00, '2008-01-01', '中国科幻基石'),
(2, '活着', '余华', 25.00, '1998-05-01', '讲述了人如何去承受巨大的苦难'),
(3, '百年孤独', '加西亚·马尔克斯', 45.00, '2011-06-01', '拉丁美洲魔幻现实主义文学的代表作');

INSERT IGNORE INTO book_version (book_id, version_number, modifier_name, change_type, title, author, price, publish_date, description) VALUES
(1, 1, 'admin', 'CREATE', '三体', '刘慈欣', 39.00, '2008-01-01', '中国科幻基石'),
(2, 1, 'admin', 'CREATE', '活着', '余华', 25.00, '1998-05-01', '讲述了人如何去承受巨大的苦难'),
(3, 1, 'admin', 'CREATE', '百年孤独', '加西亚·马尔克斯', 45.00, '2011-06-01', '拉丁美洲魔幻现实主义文学的代表作');

INSERT IGNORE INTO users (id, username, password, role) VALUES 
(1, 'admin', '123456', 'ADMIN'),
(2, 'librarian', '123456', 'LIBRARIAN');
