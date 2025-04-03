package handlers

import (
	"context"
	"encoding/json"
	"messeji-api/database"
	"messeji-api/models"
	"messeji-api/utils"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func SendMessage(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()

	var request struct {
		RecipientUsername string `json:"recipientUsername"`
		Content           string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	cookie, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	senderUsername, err := utils.GetUsernameFromToken(cookie.Value)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	message := models.Message{
		SenderUsername:    senderUsername,
		RecipientUsername: request.RecipientUsername,
		Content:           request.Content,
		Timestamp:         time.Now(),
		Read:              false,
	}

	collection := database.GetCollection("messages")
	_, err = collection.InsertOne(ctx, message)
	if err != nil {
		http.Error(w, "Error sending message", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Message sent"})
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()

	// Get sender username from JWT
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

	// Extract recipient username from query parameters
	recipient := r.URL.Query().Get("recipient")
	if recipient == "" {
		http.Error(w, "Recipient username is required", http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("messages")

	// Fetch messages where the user is either the sender or recipient
	cursor, err := collection.Find(ctx, bson.M{
		"$or": []bson.M{
			{"sender_username": username, "recipient_username": recipient},
			{"sender_username": recipient, "recipient_username": username},
		},
	})
	if err != nil {
		http.Error(w, "Error fetching messages", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err = cursor.All(ctx, &messages); err != nil {
		http.Error(w, "Error processing messages", http.StatusInternalServerError)
		return
	}

	// Mark received messages as read
	_, err = collection.UpdateMany(ctx,
		bson.M{"recipient_username": username, "sender_username": recipient, "read": false},
		bson.M{"$set": bson.M{"read": true}},
	)
	if err != nil {
		http.Error(w, "Error updating read status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}