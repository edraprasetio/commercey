package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"messeji-api/database"
	"messeji-api/models"
	"net/http"
	"regexp"

	"go.mongodb.org/mongo-driver/bson"
)

func SignUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user models.User

		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		errors := make(map[string]string)

		collection := database.GetCollection("users")

		if user.Username == "" {
			errors["username"] = "Username is required"
		}


		if user.Email == "" {
			errors["email"] = "Email is required"
		} else if !isValidEmail(user.Email) {
			fmt.Println(user.Email)
			errors["email"] = "Invalid email format"
		}

		if len(errors) > 0 {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

		var existingUser models.User

		err = collection.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&existingUser)
		if err == nil {
			errors["username"] = "Username is taken"
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

		err = collection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
		if err == nil {
			errors["email"] = "Email is already in use"
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

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

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}

}

func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

func SignInHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var u models.User
		err := json.NewDecoder(r.Body).Decode(&u)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		errors := make(map[string]string)

		collection := database.GetCollection("users")

		// Check if username doesn't exist
		var user models.User
		err = collection.FindOne(context.TODO(), bson.M{
			"$or": []bson.M{
				{"username": u.Username},
				{"email": u.Username},
			},
		}).Decode(&user)
		if err != nil {
			errors["username"] = "No username found"
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

		if u.Password != user.Password {
			errors["password"] = "Password is incorrect"
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

		w.Header().Set("Content-Type", "application/json")

		response := map[string]interface{}{
			"user": map[string]string{
				"username":   user.Username,
				"first_name": user.FirstName,
				"last_name":  user.LastName,
				"email":      user.Email,
			},
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)

	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		collection := database.GetCollection("users")

		// Query to fetch all users
		cursor, err := collection.Find(context.TODO(), bson.M{})
		if err != nil {
			http.Error(w, "Error fetching users from the database", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.TODO())

		// Declare a slice to hold all users
		var users []models.User

		// Iterate through the cursor and decode each document into a user struct
		for cursor.Next(context.TODO()) {
			var user models.User
			if err := cursor.Decode(&user); err != nil {
				http.Error(w, "Error decoding user data", http.StatusInternalServerError)
				return
			}
			users = append(users, user)
		}

		// Check for any errors during cursor iteration
		if err := cursor.Err(); err != nil {
			http.Error(w, "Error iterating over users", http.StatusInternalServerError)
			return
		}

		// Send the users as a JSON response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(users)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func DeleteAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	collection := database.GetCollection("users")

	// Delete all users
	result, err := collection.DeleteMany(context.TODO(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to delete users", http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": fmt.Sprintf("%d users deleted", result.DeletedCount),
	})
}