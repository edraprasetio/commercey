# Step 1: Build the Go binary
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copy Go modules and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

# Build the Go binary
RUN go build -o server .

# Step 2: Create a lightweight image for running the Go app
FROM alpine:latest

WORKDIR /root/

# Copy the Go binary from the builder image
COPY --from=builder /app/server .

# Expose port 5000 (for the Go server)
EXPOSE 5000

# Run the Go server
CMD ["./server"]