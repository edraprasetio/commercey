package models

import "time"

type Message struct {
	ID                string    `bson:"_id,omitempty" json:"id,omitempty"`
	SenderUsername    string    `bson:"sender_username" json:"senderUsername"`
	RecipientUsername string    `bson:"recipient_username" json:"recipientUsername"`
	Content           string    `bson:"content" json:"content"`
	Timestamp         time.Time `bson:"timestamp" json:"timestamp"`
	Read              bool      `bson:"read" json:"read"`
}