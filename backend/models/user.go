package models

type User struct {
	ID       string `bson:"_id,omitempty" json:"id,omitempty"`
    Username string `bson:"username" json:"username"`
    FirstName string `bson:"firstName" json:"firstName"`
    LastName string `bson:"lastName" json:"lastName"`
    Email string `bson:"email" json:"email"`
    Password string `bson:"password" json:"password"`
}