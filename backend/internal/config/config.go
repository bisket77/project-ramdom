package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	DBHost      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBPort      string
	DBSSLMode   string
}

var AppConfig *Config

func LoadConfig() {
	loadEnvFile := func(path string) bool {
		data, err := os.ReadFile(path)
		if err != nil {
			return false
		}
		content := string(data)
		if len(content) >= 3 && content[0] == 0xEF && content[1] == 0xBB && content[2] == 0xBF {
			content = content[3:]
		}
		envMap, err := godotenv.Unmarshal(content)
		if err != nil {
			return false
		}
		for k, v := range envMap {
			if os.Getenv(k) == "" {
				os.Setenv(k, v)
			}
		}
		return true
	}

	loaded := loadEnvFile(".env.local") ||
		loadEnvFile(".env") ||
		loadEnvFile("../.env.local") ||
		loadEnvFile("../.env")

	if !loaded {
		log.Println("Notice: No .env file found in default paths, checking environment variables or fallback defaults.")
	}

	AppConfig = &Config{
		Port:        getEnv("PORT", "4000"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "random_wheel"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
	}

	log.Printf("Configuration Loaded Successfully (Host: %s, Port: %s, DBName: %s, ServerPort: %s)",
		AppConfig.DBHost, AppConfig.DBPort, AppConfig.DBName, AppConfig.Port)
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
