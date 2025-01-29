package main

import (
	"log"
	"messeji-api/database"
	"messeji-api/handlers"
	"net/http"

	"github.com/rs/cors"
)

func main() {
	// Initialize MongoDB
	database.InitMongo()
	defer database.CloseMongo() // Ensure MongoDB connection is closed on app shutdown

	// Create a new router and apply the CORS middleware
	mux := http.NewServeMux()
	mux.HandleFunc("/api/signup", handlers.SignUpHandler)
	mux.HandleFunc("/api/users", handlers.GetAllUsersHandler)

	// Configure CORS to allow requests from your React app
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Allow React app's origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type"},
	})

	// Start the server with CORS middleware applied
	log.Println("Starting server on :5000")
	log.Fatal(http.ListenAndServe(":5000", corsHandler.Handler(mux)))
}
