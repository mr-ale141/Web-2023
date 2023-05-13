package main

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

const (
	authCookieName = "auth"
	pathImg        = "static/img/"
)

type indexPageData struct {
	FeaturedPostsData   []PostData
	MostRecentPostsData []PostData
}

type postPageData struct {
	Title      string       `db:"title"`
	Subtitle   string       `db:"subtitle"`
	ImageSrc   template.URL `db:"image_url"`
	Text       string       `db:"content"`
	Paragraphs []string
}

type PostData struct {
	PostID       int          `db:"post_id"`
	ImageSrc     template.URL `db:"image_url"`
	Categories   string       `db:"categories"`
	Title        string       `db:"title"`
	Subtitle     string       `db:"subtitle"`
	AuthorImgSrc template.URL `db:"author_icon"`
	AuthorName   string       `db:"author_name"`
	PublishDate  string       `db:"publish_date"`
}

type adminDataType struct {
	AdminID    int          `db:"author_id"`
	AuthorName string       `db:"author_name"`
	AuthorIcon template.URL `db:"author_icon"`
	UserEmail  string       `db:"author_email"`
	UserPass   string       `db:"author_password"`
}

type authorizationDataType struct {
	UserEmail string `json:"userEmail"`
	UserPass  string `json:"userPass"`
}

type createPostDataType struct {
	Title          string `json:"Title"`
	Subtitle       string `json:"Subtitle"`
	AuthorName     string `json:"Name"`
	AuthorIcon     string `json:"Icon"`
	IconName       string `json:"IconName"`
	PublishDate    string `json:"Date"`
	Image          string `json:"Image"`
	ImageName      string `json:"ImageName"`
	ShortImage     string `json:"ShortImage"`
	ShortImageName string `json:"ShortImageName"`
	Content        string `json:"Content"`
}

func postCreate(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		adminData, err := authByCookie(db, w, r)
		if err != nil {
			return
		}

		adminId := adminData.AdminID

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
		var createPostData createPostDataType
		err = json.Unmarshal(body, &createPostData)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		fileIconName := pathImg
		fileImageName := pathImg
		fileShortImageName := pathImg

		if createPostData.AuthorIcon != "" {
			fileIconName += createPostData.IconName
			err = writeBase64InFile(createPostData.AuthorIcon, fileIconName)
			if err != nil {
				http.Error(w, "Internal Server Error", 500)
				log.Println(err.Error())
				return
			}
			createPostData.IconName = "/" + fileIconName
		}

		fileImageName += createPostData.ImageName
		err = writeBase64InFile(createPostData.Image, fileImageName)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
		createPostData.ImageName = "/" + fileImageName

		fileShortImageName += createPostData.ShortImageName
		err = writeBase64InFile(createPostData.ShortImage, fileShortImageName)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
		createPostData.ShortImageName = "/" + fileShortImageName

		err = savePost(db, createPostData, adminId)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		w.WriteHeader(200)
	}
}

func writeBase64InFile(imgBase64 string, fileName string) error {
	data := imgBase64[strings.IndexByte(imgBase64, ',')+1:]
	img, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return err
	}
	fileImg, err := os.Create(fileName)
	if err != nil {
		return err
	}
	_, err = fileImg.Write(img)
	if err != nil {
		return err
	}
	return nil
}

func adminLogIn(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ts, err := template.ParseFiles("pages/login.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		err = ts.Execute(w, ts)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}
	}
}

func adminLogOut(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:    authCookieName,
			Path:    "/",
			Expires: time.Now().AddDate(0, 0, -1),
		})

		http.Redirect(w, r, "/login", http.StatusSeeOther)
	}
}

func adminAuthorization(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		var authorizationData authorizationDataType
		err = json.Unmarshal(body, &authorizationData)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		adminData, err := checkAdmin(db, authorizationData.UserEmail, authorizationData.UserPass)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Incorrect password or email", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:    authCookieName,
			Value:   fmt.Sprint(adminData.AdminID),
			Path:    "/",
			Expires: time.Now().AddDate(0, 0, 1),
		})

		http.Redirect(w, r, "/admin", http.StatusSeeOther)
	}
}

func admin(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		adminData, err := authByCookie(db, w, r)
		if err != nil {

			return
		}

		ts, err := template.ParseFiles("pages/admin.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		err = ts.Execute(w, adminData)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

	}
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
		postId, err := strconv.Atoi(mux.Vars(r)["postId"])
		if err != nil || postId < 1 {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		postPageData, err := getPostPageData(db, postId)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Post not found", 404)
				return
			}
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

func getFeaturedPostsData(db *sqlx.DB) ([]PostData, error) {
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

	var featuredPostsData []PostData

	err := db.Select(&featuredPostsData, query)
	if err != nil {
		return nil, err
	}

	return featuredPostsData, nil
}

func getMostRecentPostsData(db *sqlx.DB) ([]PostData, error) {
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

	var mostRecentPostsData []PostData

	err := db.Select(&mostRecentPostsData, query)
	if err != nil {
		return nil, err
	}

	return mostRecentPostsData, nil
}

func getPostPageData(db *sqlx.DB, postId int) (postPageData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			content
		FROM
			posts
		WHERE post_id = ?
	`

	var pageData postPageData

	err := db.Get(&pageData, query, postId)
	if err != nil {
		return pageData, err
	}

	pageData.Paragraphs = strings.Split(pageData.Text, "\n")

	return pageData, nil
}

func getAdminData(db *sqlx.DB, adminId int) (adminDataType, error) {
	const query = `
		SELECT
			author_id,
			author_name,
			author_icon,
			author_email,
			author_password
		FROM
			authors
		WHERE author_id = ?
	`

	var adminData adminDataType

	err := db.Get(&adminData, query, adminId)
	if err != nil {
		return adminData, err
	}

	return adminData, nil
}

func checkAdmin(db *sqlx.DB, adminEmail string, adminPass string) (adminDataType, error) {
	const query = `
		SELECT
			author_id,
			author_name,
			author_icon,
			author_email,
			author_password
		FROM
			authors
		WHERE author_email = ? AND author_password = ?
	`
	var adminData adminDataType

	err := db.Get(&adminData, query, adminEmail, adminPass)
	if err != nil {
		return adminData, err
	}

	return adminData, nil
}

func savePost(db *sqlx.DB, data createPostDataType, adminId int) error {
	const queryPosts = `
		INSERT INTO
			` + "`posts`" + `
			(
				author_post,
				title,
				subtitle,
				publish_date,
				image_url,
				short_image_url,
				content
			)
		VALUES
			(
				?, ?, ?, ?, ?, ?, ?
			)
		`
	const queryAuthorName = `
		UPDATE
			` + "`authors`" + `
			SET
				author_name = ?
		WHERE
				author_id = ?
		`

	const queryAuthorIcon = `
		UPDATE
			` + "`authors`" + `
			SET
				author_icon = ?
		WHERE
				author_id = ?
		`

	if len(data.AuthorName) > 0 {
		result, err := db.Exec(queryAuthorName,
			data.AuthorName,
			adminId,
		)
		if err != nil {
			log.Print(result)
			return err
		}
	}

	if len(data.IconName) > 0 {
		result, err := db.Exec(queryAuthorIcon,
			data.IconName,
			adminId,
		)
		if err != nil {
			log.Print(result)
			return err
		}
	}

	result, err := db.Exec(queryPosts,
		adminId,
		data.Title,
		data.Subtitle,
		data.PublishDate,
		data.ImageName,
		data.ShortImageName,
		data.Content,
	)
	if err != nil {
		log.Println(result)
		return err
	}
	return nil
}

func authByCookie(db *sqlx.DB, w http.ResponseWriter, r *http.Request) (adminDataType, error) {
	var adminData adminDataType
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		if err == http.ErrNoCookie {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			log.Println(err.Error())
			return adminData, err
		}
		http.Error(w, "Internal Server Error", 500)
		log.Println(err.Error())
		return adminData, err
	}

	adminIdStr := cookie.Value
	adminId, err := strconv.Atoi(adminIdStr)
	if err != nil {
		http.Error(w, "Invalid admin id", http.StatusForbidden)
		log.Println(err.Error())
		return adminData, err
	}

	adminData, err = getAdminData(db, adminId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusForbidden)
			return adminData, err
		}
		http.Error(w, "Internal Server Error", 500)
		log.Println(err.Error())
		return adminData, err
	}

	return adminData, nil
}
