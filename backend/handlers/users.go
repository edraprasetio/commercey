package handlers

import (
	"context"
	"encoding/json"
	"messeji-api/database"
	"messeji-api/models"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
)

// SignUpHandler handles the user sign-up process
func SignUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user models.User

		// Decode the incoming JSON request body into the user struct
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Store the user in the MongoDB collection
		collection := database.GetCollection("users")
		_, err = collection.InsertOne(context.TODO(), bson.M{
			"username":  user.Username,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"email":     user.Email,
			"password":  user.Password,
		})
		if err != nil {
			http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
			return
		}

		// Send a response back to the client
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}
