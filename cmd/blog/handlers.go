package main

import (
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/jmoiron/sqlx"
)

type indexPageData struct {
	FeaturedPostsData   []featuredPostData
	MostRecentPostsData []mostRecentPostData
}

type postPageData struct {
	Title      string `db:"title"`
	Subtitle   string `db:"subtitle"`
	ImageSrc   string `db:"image_url"`
	Text       string `db:"text_article"`
	Paragraphs []string
}

type featuredPostData struct {
	PostID       int    `db:"post_id"`
	ImageSrc     string `db:"image_url"`
	Categories   string `db:"categories"`
	Title        string `db:"title"`
	Subtitle     string `db:"subtitle"`
	AuthorImgSrc string `db:"author_icon"`
	AuthorName   string `db:"author_name"`
	PublishDate  string `db:"publish_date"`
}

type mostRecentPostData struct {
	PostID       int    `db:"post_id"`
	ImageSrc     string `db:"image_url"`
	Title        string `db:"title"`
	Subtitle     string `db:"subtitle"`
	AuthorImgSrc string `db:"author_icon"`
	AuthorName   string `db:"author_name"`
	PublishDate  string `db:"publish_date"`
}

func index(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		featuredPostsData, err := getFeaturedPostsData(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		mostRecentPostsData, err := getMostRecentPostsData(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		ts, err := template.ParseFiles("pages/index.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		data := indexPageData{
			FeaturedPostsData:   featuredPostsData,
			MostRecentPostsData: mostRecentPostsData,
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func post(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		post_id, err := strconv.Atoi(r.URL.Query().Get("post_id"))
		if err != nil || post_id < 1 {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		postPageData, err := getPostPageData(db, post_id)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		ts, err := template.ParseFiles("pages/post.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		err = ts.Execute(w, postPageData)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func getFeaturedPostsData(db *sqlx.DB) ([]featuredPostData, error) {
	const query = `
		SELECT
			post_id,
			title,
			subtitle,
			categories,
			author_name,
			author_icon,
			publish_date,
			image_url
		FROM
			posts,
			authors
		WHERE author_id = author_post AND featured = 1
	`

	var featuredPostsData []featuredPostData

	err := db.Select(&featuredPostsData, query)
	if err != nil {
		return nil, err
	}

	return featuredPostsData, nil
}

func getMostRecentPostsData(db *sqlx.DB) ([]mostRecentPostData, error) {
	const query = `
		SELECT
			post_id,
			title,
			subtitle,
			author_name,
			author_icon,
			publish_date,
			image_url
		FROM
			posts,
			authors
		WHERE author_id = author_post AND featured = 0
	`

	var mostRecentPostsData []mostRecentPostData

	err := db.Select(&mostRecentPostsData, query)
	if err != nil {
		return nil, err
	}

	return mostRecentPostsData, nil
}

func getPostPageData(db *sqlx.DB, post_id int) (postPageData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			text_article
		FROM
			posts
		WHERE post_id = ?
	`

	var pageData postPageData

	err := db.Get(&pageData, query, post_id)
	if err != nil {
		return pageData, err
	}

	pageData.Paragraphs = strings.Split(pageData.Text, "\n")

	return pageData, nil
}
