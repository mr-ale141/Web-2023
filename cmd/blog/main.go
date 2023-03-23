package main

import (
	"fmt"
	"net/http"
)

func main() {
	const port = ":3000"

	mux := http.NewServeMux()
	mux.HandleFunc("/home", index)

	fmt.Println("Start Server!")
	http.ListenAndServe(port, mux)
}
