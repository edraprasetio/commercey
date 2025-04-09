package main

import (
	"log"
	"messeji-api/database"
	"messeji-api/handlers"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	// Initialize MongoDB
	database.InitMongo()
	defer database.CloseMongo()

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	database.InitRedis()

	router := mux.NewRouter()
	router.HandleFunc("/api/signup", handlers.SignUpHandler).Methods("POST")
	router.HandleFunc("/api/signin", handlers.SignInHandler).Methods("POST")
	router.HandleFunc("/api/signout", handlers.SignOutHandler).Methods("POST")
	
	router.HandleFunc("/api/user", handlers.GetUserHandler).Methods("GET")
	router.HandleFunc("/api/notifications", handlers.GetNotificationsHandler).Methods("GET")
	router.HandleFunc("/api/users", handlers.GetAllUsersHandler).Methods("GET")
	router.HandleFunc("/api/users", handlers.DeleteAllUsersHandler).Methods("DELETE")

	router.HandleFunc("/api/user/change-password", handlers.ChangePasswordHandler).Methods("PUT")

	router.HandleFunc("/api/friend/request", handlers.SendFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/accept", handlers.AcceptFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/reject", handlers.RejectFriendRequest).Methods("POST")
	router.HandleFunc("/api/friend/list", handlers.GetFriends).Methods("GET")

	router.HandleFunc("/api/messages/send", handlers.SendMessage).Methods("POST")
	router.HandleFunc("/api/messages", handlers.GetMessages).Methods("GET")
	router.HandleFunc("/api/messages/conversations", handlers.GetConversationList).Methods("GET")
	// Configure CORS to allow requests from your React app
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Allow React app's origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type"},
		AllowCredentials: true,
	})

	port := os.Getenv("PORT")
	// Start the server with CORS middleware applied

	log.Println("Starting server on :", port)
	log.Fatal(http.ListenAndServe(":"+port, corsHandler.Handler(router)))
}
