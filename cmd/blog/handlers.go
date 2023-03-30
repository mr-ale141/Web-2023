package main

import (
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/jmoiron/sqlx"
)

type indexPageData struct {
	FeaturedPosts   []featuredPostData
	MostRecentPosts []mostRecentPostData
}

type postPageData struct {
	Title      string `db:"title"`
	Subtitle   string `db:"subtitle"`
	ImageSrc   string `db:"image_url"`
	Article    string `db:"text"`
	Paragraphs []string
}

type featuredPostData struct {
	NameClassForBackground string
	Categories             string `db:"categories"`
	Title                  string `db:"title"`
	Subtitle               string `db:"subtitle"`
	AuthorImgSrc           string `db:"author_url"`
	AuthorName             string `db:"author"`
	PublishDate            string `db:"publish_date"`
}

type mostRecentPostData struct {
	ImageSrc     string `db:"image_url"`
	Categories   string `db:"categories"`
	Title        string `db:"title"`
	Subtitle     string `db:"subtitle"`
	AuthorImgSrc string `db:"author_url"`
	AuthorName   string `db:"author"`
	PublishDate  string `db:"publish_date"`
}

func index(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		featuredPosts, err := featuredPosts(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		mostRecentPosts, err := mostRecentPosts(db)
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
			FeaturedPosts:   featuredPosts,
			MostRecentPosts: mostRecentPosts,
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func post(db *sqlx.DB, titleArticle string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		article, err := article(db, titleArticle)
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

		err = ts.Execute(w, article)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func featuredPosts(db *sqlx.DB) ([]featuredPostData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			categories,
			author,
			author_url,
			publish_date
		FROM
			posts
		WHERE featured = 1
	`

	var featuredPosts []featuredPostData

	err := db.Select(&featuredPosts, query)
	if err != nil {
		return nil, err
	}

	for i, featuredPost := range featuredPosts {
		featuredPosts[i].NameClassForBackground = strings.Replace(strings.ToLower(featuredPost.Title), " ", "_", -1)
	}

	return featuredPosts, nil
}

func mostRecentPosts(db *sqlx.DB) ([]mostRecentPostData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			categories,
			author,
			author_url,
			publish_date,
			image_url
		FROM
			posts
		WHERE featured = 0
	`

	var mostRecentPost []mostRecentPostData

	err := db.Select(&mostRecentPost, query)
	if err != nil {
		return nil, err
	}

	return mostRecentPost, nil
}

func article(db *sqlx.DB, titleArticle string) (postPageData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			text
		FROM
			articles
		WHERE title = ?
	`

	var postPage postPageData

	err := db.Get(&postPage, query, titleArticle)
	if err != nil {
		return postPage, err
	}

	postPage.Paragraphs = strings.Split(postPage.Article, "\n")

	return postPage, nil
}
