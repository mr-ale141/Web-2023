package main

import (
	"html/template"
	"log"
	"net/http"
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
	Text       string `db:"text"`
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

func post(db *sqlx.DB, article_id int) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		postPageData, err := getPostPageData(db, article_id)
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

	var featuredPostsData []featuredPostData

	err := db.Select(&featuredPostsData, query)
	if err != nil {
		return nil, err
	}

	for i, featuredPost := range featuredPostsData {
		featuredPostsData[i].NameClassForBackground = strings.Replace(strings.ToLower(featuredPost.Title), " ", "_", -1)
	}

	return featuredPostsData, nil
}

func getMostRecentPostsData(db *sqlx.DB) ([]mostRecentPostData, error) {
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

	var mostRecentPostsData []mostRecentPostData

	err := db.Select(&mostRecentPostsData, query)
	if err != nil {
		return nil, err
	}

	return mostRecentPostsData, nil
}

func getPostPageData(db *sqlx.DB, article_id int) (postPageData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			text
		FROM
			articles
		WHERE article_id = ?
	`

	var pageData postPageData

	err := db.Get(&pageData, query, article_id)
	if err != nil {
		return pageData, err
	}

	pageData.Paragraphs = strings.Split(pageData.Text, "\n")

	return pageData, nil
}
