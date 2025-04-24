package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// LoadEnv loads environment variables from .env file
func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found or error loading it")
	}
}

func main() {
	LoadEnv()

	var err error
	dbType := os.Getenv("DB_TYPE")

	// Try to connect to the database based on the specified type
	switch dbType {
	case "mysql":
		// Connect to MySQL (Aiven)
		dsn := fmt.Sprintf(
			"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_HOST"),
			os.Getenv("DB_PORT"),
			os.Getenv("DB_NAME"),
		)

		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Println("Failed to connect to MySQL database:", err)
			log.Println("Falling back to SQLite database")
		} else {
			log.Println("Connected to MySQL database")
		}
	case "postgres":
		// Connect to PostgreSQL
		dsn := fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)

		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Println("Failed to connect to PostgreSQL database:", err)
			log.Println("Falling back to SQLite database")
		} else {
			log.Println("Connected to PostgreSQL database")
		}
	default:
		log.Println("No valid DB_TYPE specified, using SQLite as fallback")
	}

	// If database connection failed, use SQLite as fallback
	if DB == nil {
		DB, err = gorm.Open(sqlite.Open("student_courses.db"), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to SQLite database:", err)
		}
		log.Println("Connected to SQLite database")
	}

	// Migrate models
	DB.AutoMigrate(&Student{}, &Course{}, &Enrollment{})

	// Seed courses
	SeedCourses(DB)

	// Set up CORS
	r := gin.Default()
	r.Use(CORSMiddleware())

	SetupRoutes(r)
	r.Run(":8080")
}
