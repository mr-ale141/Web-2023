CREATE DATABASE blog;

USE blog;

CREATE TABLE IF NOT EXISTS `blog`.`authors` (
    `author_id` INT NOT NULL AUTO_INCREMENT,
    `author_name` VARCHAR(255) NOT NULL,
    `author_icon` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`author_id`))
ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;

CREATE TABLE IF NOT EXISTS `blog`.`posts` (
    `post_id`      INT NOT NULL AUTO_INCREMENT,
    `author_post`  INT NOT NULL,
    `title`        VARCHAR(255) NOT NULL,
    `subtitle`     VARCHAR(255) NOT NULL,
    `categories`   VARCHAR(255) NOT NULL,
    `publish_date` VARCHAR(255) NOT NULL,
    `image_url`    VARCHAR(255) NOT NULL,
    `content`      TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
    `featured`     TINYINT(1) NULL DEFAULT 0,
    PRIMARY KEY (`post_id`),
    INDEX `fk_posts_authors_idx` (`author_post` ASC) VISIBLE,
    CONSTRAINT `fk_posts_authors`
        FOREIGN KEY (`author_post`)
        REFERENCES `blog`.`authors` (`author_id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
    )
ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;
