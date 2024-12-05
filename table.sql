CREATE TABLE menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itemId INT NOT NULL,
    enableMenu BOOLEAN NOT NULL DEFAULT 1,
    icon VARCHAR(255),
    link VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id INT DEFAULT 0,
    templateId INT DEFAULT NULL
);



INSERT INTO menus (id, name, menulink, template_name, template_id, icon, parent_id, serial_number)
VALUES (1, "Home", "home", "", 1, "", 0, 1);




 CREATE TABLE comments ( comment_id INT AUTO_INCREMENT PRIMARY KEY,    post_id INT NOT NULL,    comment TEXT NOT NULL,    email VARCHAR(255) NOT NULL,    website VARCHAR(255),    name VARCHAR(255) NOT NULL,    status ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',    submitted_on DATETIME DEFAULT CURRENT_TIMESTAMP,    post_type VARCHAR(50),    updated_on DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);

  INSERT INTO comments (post_id, comment, email, website, name, status, post_type)
    -> VALUES
    -> (1, 'This is a great post!', 'john.doe@example.com', 'https://johndoe.com', 'John Doe', 'approved', 'blog'),
    -> (2, 'I found this information very useful. Thanks for sharing!', 'jane.smith@example.com', NULL, 'Jane Smith', 'approved', 'news'),
    -> (1, 'Can you elaborate on this topic?', 'alex.wilson@example.com', 'https://alexwilson.dev', 'Alex Wilson', 'pending', 'blog'),
    -> (3, 'I disagree with the points mentioned here.', 'chris.lee@example.com', NULL, 'Chris Lee', 'rejected', 'article'),
    -> (2, 'Nice write-up! Looking forward to more content.', 'emily.brown@example.com', 'https://emilywrites.com', 'Emily Brown', 'approved', 'news');




     CREATE TABLE blog (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     comment_status BOOLEAN NOT NULL,
    ->     featured_image VARCHAR(255),
    ->     ping_status BOOLEAN NOT NULL,
    ->     blog_author VARCHAR(100) NOT NULL,
    ->     blog_content LONGTEXT NOT NULL,
    ->     blog_excerpt TEXT,
    ->     post_selected_categories JSON,
    ->     blog_slug VARCHAR(255) UNIQUE NOT NULL,
    ->     blog_status ENUM('draft', 'published', 'archived') NOT NULL,
    ->     blog_title VARCHAR(255) NOT NULL,
    ->     blog_type VARCHAR(100) NOT NULL,
    ->     blog_type_id INT NOT NULL,
    ->     dynamic_fields JSON
    -> );






    CREATE TABLE media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    alt_text VARCHAR(255),
    file_name VARCHAR(255),
    file_path TEXT,
    file_size VARCHAR(50),
    dimensions VARCHAR(50),
    media_type ENUM('image', 'video'),
    thumbnail_path TEXT,
    medium_path TEXT,
    large_path TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
);






CREATE TABLE template_field_definition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    type_definition JSON NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES template(template_id) ON DELETE CASCADE
);


CREATE TABLE template (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
