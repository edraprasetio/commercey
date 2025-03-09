package models

import "time"

type Message struct {
	ID       string `bson:"_id,omitempty" json:"id,omitempty"`
    SenderID string `bson:"sender_id" json:"sender_id"`
    RecipientID string `bson:"recipient_id" json:"recipient_id"`
    Content string `bson:"content" json:"content"`
    TimeStamp time.Time `bson:"timestamp" json:"timestamp"`
    IsRead bool `bson:"is_read" json:"is_read"`
}