package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	path := os.Getenv("DATA_FILE")
	if path == "" {
		path = "data/habits.json"
	}
	addr := serverAddress(os.Getenv("ADDR"), os.Getenv("PORT"))
	log.Printf("Habit tracker listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, newHandler(path)))
}

func serverAddress(addr, port string) string {
	if addr != "" {
		return addr
	}
	if port != "" {
		return ":" + port
	}
	return "127.0.0.1:8080"
}
