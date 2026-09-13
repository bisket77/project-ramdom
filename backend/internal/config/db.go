package config

import (
	"fmt"
	"log"
	"time"

	"random-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
		AppConfig.DBHost,
		AppConfig.DBUser,
		AppConfig.DBPassword,
		AppConfig.DBName,
		AppConfig.DBPort,
		AppConfig.DBSSLMode,
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		log.Fatal("Failed to connect database. Error: ", err)
	}

	sqlDB, err := database.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(time.Hour)
		sqlDB.SetConnMaxIdleTime(10 * time.Minute)
		log.Println("Database Connection Pool Configured Successfully (Idle: 10, Max: 50)")
	}

	log.Println("Database Connection Established Successfully")

	// AutoMigrate models
	err = database.AutoMigrate(&models.Prize{}, &models.SpinHistory{}, &models.VisitLog{}, &models.DailyStat{})
	if err != nil {
		log.Printf("Warning during AutoMigrate: %v", err)
	} else {
		log.Println("Database Migration Completed Successfully")
	}

	DB = database

	// Seed default prizes if empty
	var count int64
	DB.Model(&models.Prize{}).Count(&count)
	if count == 0 {
		initialPrizes := []models.Prize{
			{Label: "Ali", Color: "#2563EB", Weight: 1, SortOrder: 0, IsActive: true},
			{Label: "Beatriz", Color: "#0D9488", Weight: 1, SortOrder: 1, IsActive: true},
			{Label: "Charles", Color: "#F59E0B", Weight: 1, SortOrder: 2, IsActive: true},
			{Label: "Diya", Color: "#7C3AED", Weight: 1, SortOrder: 3, IsActive: true},
			{Label: "Eric", Color: "#E11D48", Weight: 1, SortOrder: 4, IsActive: true},
			{Label: "Fatima", Color: "#059669", Weight: 1, SortOrder: 5, IsActive: true},
			{Label: "Gabriel", Color: "#EA580C", Weight: 1, SortOrder: 6, IsActive: true},
			{Label: "Hanna", Color: "#4F46E5", Weight: 1, SortOrder: 7, IsActive: true},
		}
		if err := DB.Create(&initialPrizes).Error; err == nil {
			log.Println("🌱 สร้างข้อมูลรางวัลตัวอย่าง (seed) เรียบร้อย")
		}
	}
}
