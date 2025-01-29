package main

import (
	"commercey-api/models"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var mongoClient *mongo.Client
var userCollection *mongo.Collection

// Initialize MongoDB connection
func initMongo() {
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

	// Set up the user collection
	userCollection = mongoClient.Database("ecommerce").Collection("users")
	log.Println("MongoDB connected successfully")
}

// Close MongoDB connection when the app shuts down
func closeMongo() {
	if err := mongoClient.Disconnect(context.TODO()); err != nil {
		log.Fatalf("Error disconnecting from MongoDB: %v", err)
	}
	log.Println("MongoDB connection closed")
}

// SignUpHandler handles user sign-up and stores user in MongoDB
func signUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		var user models.User

		// Decode the incoming JSON request body into the user struct
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Store the user in the MongoDB collection
		_, err = userCollection.InsertOne(context.TODO(), bson.M{
			"name":           user.Username,
			"email":          user.Email,
			"password":       user.Password,
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

func main() {
	// Initialize MongoDB
	initMongo()
	defer closeMongo() // Ensure MongoDB connection is closed on app shutdown

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