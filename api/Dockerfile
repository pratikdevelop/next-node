# Use the official Go image from Docker Hub
FROM golang:1.24.1

# Set the working directory inside the container
WORKDIR /app

# Initialize Go module (similar to your command `go mod init api/index`)
RUN mkdir -p /app/api && cd /app/api && go mod init api/index

# Optionally, you can copy the local Go source code into the container
COPY . .

# Run the Go application (or build it first)
# This is where you'd normally build or run the app
# For example, to build a binary:
# RUN go build -o /app/api/main /app/api/main.go

# Command to run when the container starts
CMD ["go", "run", "/app/api/main.go"]

# This step is just to confirm the Go module initialization
# CMD ["bash", "-c", "echo 'Go module initialized' && ls -la /app/api"]
