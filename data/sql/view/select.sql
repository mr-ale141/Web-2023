SELECT
    post_id,
    title,
    subtitle,
    categories,
    author_name,
    author_icon,
    publish_date,
    image_url,
    text_article,
    featured
FROM
    posts,
    authors
WHERE author_id = author_post
ORDER BY post_id
; 
