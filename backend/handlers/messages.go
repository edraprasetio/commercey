package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"messeji-api/database"
	"messeji-api/models"
	"messeji-api/utils"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

var encryptionKey []byte 

func init() {
	encodedKey := os.Getenv("ENCRYPTION_KEY")
	if encodedKey == "" {
		log.Fatal("ENCRYPTION_KEY not found in environment")
	}

	decodedKey, err := base64.StdEncoding.DecodeString(encodedKey)
	if err != nil {
		log.Fatal("Failed to decode ENCRYPTION_KEY:", err)
	}

	if len(decodedKey) != 32 {
		log.Fatalf("Invalid key length: got %d bytes, expected 32", len(decodedKey))
	}

	encryptionKey = decodedKey
}

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

	encryptedContent, err := utils.EncryptMessage(encryptionKey, request.Content)
	if err != nil {
		http.Error(w, "Failed to encrypt message", http.StatusInternalServerError)
		return
	}

	fmt.Println("Encrypted message is: ", encryptedContent)

	message := models.Message{
		SenderUsername:    senderUsername,
		RecipientUsername: request.RecipientUsername,
		Content:           encryptedContent,
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

	for i, msg := range messages {
		decrypted, err := utils.DecryptMessage(encryptionKey, msg.Content)
		if err != nil {
			log.Println("Failed to decrypt message:", err)
			continue // Keep the encrypted version if decryption fails
		}
		messages[i].Content = decrypted
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

type ConversationPreview struct {
	Username    string `json:"username"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	LastMessage string `json:"lastMessage"`
	Timestamp   string `json:"timestamp"`
}

func formatTimeAgo(t time.Time) string {
	duration := time.Since(t)

	switch {
	case duration < time.Minute:
		return "Just now"
	case duration < time.Hour:
		return fmt.Sprintf("%dm", int(duration.Minutes()))
	case duration < 24*time.Hour:
		return fmt.Sprintf("%dh", int(duration.Hours()))
	case duration < 7*24*time.Hour:
		return fmt.Sprintf("%dd", int(duration.Hours()/24))
	case duration < 365*24*time.Hour:
		return fmt.Sprintf("%dw", int(duration.Hours()/(24*7)))
	default:
		return fmt.Sprintf("%dy", int(duration.Hours()/(24*365)))
	}
}

func GetConversationList(w http.ResponseWriter, r *http.Request) {
	ctx := context.TODO()
	cookie, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	currentUsername, err := utils.GetUsernameFromToken(cookie.Value)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	messageColl := database.GetCollection("messages")
	userColl := database.GetCollection("users")

	// Find all messages where the current user is involved
	cursor, err := messageColl.Find(ctx, bson.M{
		"$or": []bson.M{
			{"sender_username": currentUsername},
			{"recipient_username": currentUsername},
		},
	})
	if err != nil {
		http.Error(w, "Error fetching messages", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	type pair struct {
		username string
		message  models.Message
	}

	convoMap := make(map[string]models.Message)

	for cursor.Next(ctx) {
		var msg models.Message
		if err := cursor.Decode(&msg); err != nil {
			continue
		}

		var otherUser string
		if msg.SenderUsername == currentUsername {
			otherUser = msg.RecipientUsername
		} else {
			otherUser = msg.SenderUsername
		}

		// Only keep the latest message
		if existing, found := convoMap[otherUser]; !found || msg.Timestamp.After(existing.Timestamp) {
			convoMap[otherUser] = msg
		}
	}

	var previews []ConversationPreview

	for username, message := range convoMap {
		// Get user's first and last name
		var user models.User
		err := userColl.FindOne(ctx, bson.M{"username": username}).Decode(&user)
		if err != nil {
			continue
		}

		// Format time difference
		formattedTime := formatTimeAgo(message.Timestamp)

		decrypted, err := utils.DecryptMessage(encryptionKey, message.Content)
		if err != nil {
			log.Println("Failed to decrypt message:", err)
			continue
		}

		previews = append(previews, ConversationPreview{
			Username:    username,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			LastMessage: decrypted, // decrypted if necessary
			Timestamp:   formattedTime,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(previews)
}