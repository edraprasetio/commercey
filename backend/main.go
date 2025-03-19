package main

import (
	"log"
	"messeji-api/database"
	"messeji-api/handlers"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Initialize MongoDB
	database.InitMongo()
	defer database.CloseMongo()

	database.InitRedis()

	router := mux.NewRouter()
	router.HandleFunc("/api/signup", handlers.SignUpHandler).Methods("POST")
	router.HandleFunc("/api/signin", handlers.SignInHandler).Methods("POST")
	router.HandleFunc("/api/signout", handlers.SignOutHandler).Methods("POST")
	
	router.HandleFunc("/api/user", handlers.GetUserHandler).Methods("GET")
	router.HandleFunc("/api/users", handlers.GetAllUsersHandler).Methods("GET")
	router.HandleFunc("/api/users", handlers.DeleteAllUsersHandler).Methods("DELETE")

	router.HandleFunc("/api/friend/request", handlers.SendFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/accept", handlers.AcceptFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/reject", handlers.RejectFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/list", handlers.GetFriends).Methods("GET")

	// Configure CORS to allow requests from your React app
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Allow React app's origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type"},
		AllowCredentials: true,
	})

	// Start the server with CORS middleware applied
	log.Println("Starting server on :5000")
	log.Fatal(http.ListenAndServe(":5000", corsHandler.Handler(router)))
}
