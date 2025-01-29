package database

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Global MongoDB client
var mongoClient *mongo.Client

// InitMongo initializes the MongoDB connection
func InitMongo() {
	uri := os.Getenv("MONGO_URI") // Set your MONGO_URI environment variable
	if uri == "" {
		log.Fatal("MONGO_URI environment variable not set")
	}

	var err error
	mongoClient, err = mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}

	// Ping MongoDB to ensure the connection is successful
	err = mongoClient.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatalf("Could not ping MongoDB: %v", err)
	}

	log.Println("MongoDB connected successfully")
}

// CloseMongo closes the MongoDB connection
func CloseMongo() {
	if err := mongoClient.Disconnect(context.TODO()); err != nil {
		log.Fatalf("Error disconnecting from MongoDB: %v", err)
	}
	log.Println("MongoDB connection closed")
}

// GetCollection returns the specified collection from MongoDB
// collectionName: name of the collection (e.g., "users", "messages")
func GetCollection(collectionName string) *mongo.Collection {
	return mongoClient.Database("messeji").Collection(collectionName)
}
