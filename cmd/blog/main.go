package main

import (
	"log"
	"net/http"
)

const (
	port = ":3000"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/home", index)
	mux.HandleFunc("/post", post)

	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("./assets"))))

	log.Println("Start Server " + port)
	err := http.ListenAndServe(port, mux)
	if err != nil {
		log.Fatal(err)
	}
}
