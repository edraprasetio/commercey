package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"messeji-api/database"
	"messeji-api/models"
	passwordhashing "messeji-api/passwordHashing"
	"messeji-api/utils"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var ctx = context.Background()

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

		hash, _ := passwordhashing.HashPassword(user.Password)

		_, err = collection.InsertOne(context.TODO(), bson.M{
			"username":  user.Username,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"email":     user.Email,
			"password":  hash,
		})
		if err != nil {
			http.Error(w, "Error inserting user into database", http.StatusInternalServerError)
			return
		}

		token, err := utils.GenerateToken(user.Username)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		sessionID := uuid.New().String()

		ctx := context.TODO()
		database.RedisClient.Set(ctx, "session:"+sessionID, token, 2*time.Hour)

		response := map[string]interface{}{
			"message": "User created successfully",
			"token": token,
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
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

		match := passwordhashing.VerifyPassword(u.Password, user.Password)

		if !match {
			errors["password"] = "Password is incorrect"
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]interface{}{"errors": errors})
			return
		}

		w.Header().Set("Content-Type", "application/json")

		token, err := utils.GenerateToken(user.Username)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		redisClient := database.RedisClient
		userData := map[string]interface{}{
			"username":  user.Username,
			"email":     user.Email,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"token":     token,
		}

		redisClient.HSet(ctx, "user:"+user.Username, userData)
		redisClient.Expire(ctx, "user:"+user.Username, 2*time.Hour)


		http.SetCookie(w, &http.Cookie{
			Name: "jwt",
			Value: token,
			HttpOnly: true,
			Secure: os.Getenv("ENV") == "production",
			SameSite: http.SameSiteLaxMode,
			Path: "/",
			Expires: time.Now().Add(2 * time.Hour),
		})

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})

		// w.Header().Set("Content-Type", "application/json")
		// w.WriteHeader(http.StatusOK)
		// json.NewEncoder(w).Encode(response)

	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("jwt")
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    username, err := utils.GetUsernameFromToken(cookie.Value)
    if err != nil {
        http.Error(w, "Invalid token", http.StatusUnauthorized)
        return
    }

	fmt.Println(username)

    redisClient := database.RedisClient
    userData, err := redisClient.HGetAll(ctx, "user:"+username).Result()
    if err != nil || len(userData) == 0 {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    var user models.User
    userJSON, err := json.Marshal(userData)
    if err != nil {
        http.Error(w, "Error processing user data", http.StatusInternalServerError)
        return
    }

    err = json.Unmarshal(userJSON, &user)
    if err != nil {
        http.Error(w, "Error unmarshalling user data", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		collection := database.GetCollection("users")

		cursor, err := collection.Find(context.TODO(), bson.M{})
		if err != nil {
			http.Error(w, "Error fetching users from the database", http.StatusInternalServerError)
			return
		}
		defer cursor.Close(context.TODO())

		var users []models.User

		for cursor.Next(context.TODO()) {
			var user models.User
			if err := cursor.Decode(&user); err != nil {
				http.Error(w, "Error decoding user data", http.StatusInternalServerError)
				return
			}
			users = append(users, user)
		}

		if err := cursor.Err(); err != nil {
			http.Error(w, "Error iterating over users", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(users)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func SignOutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    "jwt",
		Value:   "",
		Expires: time.Unix(0, 0),
		Path:    "/",
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
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

func SendFriendRequest(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	var request struct {
		Username     string `json:"username"`
		TargetFriend string `json:"target_friend"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find the target user
	usersCollection := database.GetCollection("users")
	var targetUser models.User
	err := usersCollection.FindOne(ctx, bson.M{"username": request.TargetFriend}).Decode(&targetUser)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Add friend request if not already in the list
	for _, pending := range targetUser.PendingRequests {
		if pending == request.Username {
			http.Error(w, "Request already sent", http.StatusConflict)
			return
		}
	}

	_, err = usersCollection.UpdateOne(ctx,
		bson.M{"username": request.TargetFriend},
		bson.M{"$push": bson.M{"pending_requests": request.Username}},
	)

	if err != nil {
		http.Error(w, "Error sending request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request sent"})
}

func AcceptFriendRequest(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	var request struct {
		Username     string `json:"username"`
		AcceptedUser string `json:"accepted_user"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	usersCollection := database.GetCollection("users")

	_, err := usersCollection.UpdateOne(ctx,
		bson.M{"username": request.Username},
		bson.M{
			"$pull": bson.M{"pending_requests": request.AcceptedUser},
			"$push": bson.M{"friends": request.AcceptedUser},
		},
	)

	if err != nil {
		http.Error(w, "Error moving accepted user to friends array", http.StatusInternalServerError)
		return
	}

	_, err = usersCollection.UpdateOne(ctx,
		bson.M{"username": request.AcceptedUser},
		bson.M{"$push": bson.M{"friends": request.Username}},
	)

	if err != nil {
		http.Error(w, "Error accepting request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request accepted"})
}

func RejectFriendRequest(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	var request struct {
		Username      string `json:"username"`
		RejectedUser  string `json:"rejected_user"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	usersCollection := database.GetCollection("users")

	// Remove from pending requests
	_, err := usersCollection.UpdateOne(ctx,
		bson.M{"username": request.Username},
		bson.M{"$pull": bson.M{"pending_requests": request.RejectedUser}},
	)

	if err != nil {
		http.Error(w, "Error rejecting request", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Friend request rejected"})
}

func GetFriends(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	username := r.URL.Query().Get("username")

	usersCollection := database.GetCollection("users")
	var user models.User

	fmt.Println("Fetching friends for username:", username)

	err := usersCollection.FindOne(ctx, bson.M{"username": user.Username}).Decode(&user)
	if err == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user.Friends)
}