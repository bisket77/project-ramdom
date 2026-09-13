package main

import (
	"log"

	"random-backend/internal/config"
	"random-backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load .env
	config.LoadConfig()

	// Connect PostgreSQL and auto-migrate tables
	config.ConnectDB()

	// เปิดสีสันบน Console Log ของ Gin ให้มีสี (เขียว แดง เหลือง ฟ้า ฯลฯ)
	gin.ForceConsoleColor()

	// Initialize Gin engine
	r := gin.Default()

	// Register API routes
	routes.SetUpRoutes(r)

	log.Printf("🚀 Random Wheel Backend (Go) is starting on port %s", config.AppConfig.Port)

	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatal("Failed to start server. Error: ", err)
	}
}
