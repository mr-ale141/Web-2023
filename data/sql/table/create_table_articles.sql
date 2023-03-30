CREATE TABLE 
    `articles` (
        `article_id` INT NOT NULL AUTO_INCREMENT,
        `title`      VARCHAR(255) NOT NULL,
        `subtitle`   VARCHAR(255) NOT NULL,
        `image_url`  VARCHAR(255) NOT NULL,
        `text`       TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
        PRIMARY KEY (`article_id`)
    ) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;