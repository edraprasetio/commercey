package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"
)

type User struct {
	Name          string `json:"name"`
	Email         string `json:"email"`
	Password      string `json:"password"`
	ConfirmPassword string `json:"confirmPassword"`
}

func signUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user User

		// Decode the incoming JSON request body into the user struct
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// For now, just print the user data
		fmt.Println("Received user:", user)

		// Send a response back to the client
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func main() {
	// Create a new router and apply the CORS middleware
	mux := http.NewServeMux()
	mux.HandleFunc("/api/signup", signUpHandler)

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
