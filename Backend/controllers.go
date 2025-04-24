package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), 12)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}
	student := Student{Name: input.Name, Email: input.Email, Password: string(hashed)}
	if err := DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Registered successfully"})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var student Student
	if err := DB.Where("email = ?", input.Email).First(&student).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(student.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"student_id": student.ID,
		"exp":        time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func GetCourses(c *gin.Context) {
	var courses []Course
	DB.Find(&courses)
	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

func EnrollCourse(c *gin.Context) {
	studentID := c.GetUint("student_id")
	var input struct {
		CourseID uint `json:"course_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var enrollment Enrollment
	if err := DB.Where("student_id = ? AND course_id = ?", studentID, input.CourseID).First(&enrollment).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already enrolled"})
		return
	}

	// Check if course exists
	var course Course
	if err := DB.First(&course, input.CourseID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course not found"})
		return
	}

	// Create enrollment with error handling
	newEnrollment := Enrollment{StudentID: studentID, CourseID: input.CourseID}
	if err := DB.Create(&newEnrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll in course"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Enrolled successfully"})
}

func GetEnrollments(c *gin.Context) {
	studentID := c.GetUint("student_id")
	var enrollments []Enrollment
	DB.Preload("Course").Where("student_id = ?", studentID).Find(&enrollments)
	var result []gin.H
	for _, e := range enrollments {
		var course Course
		DB.First(&course, e.CourseID)
		result = append(result, gin.H{
			"course_id":     course.ID,
			"course_name":   course.Name,
			"rating":        e.Rating,
			"course_rating": course.Rating,
		})
	}
	c.JSON(http.StatusOK, gin.H{"enrollments": result})
}

func RateCourse(c *gin.Context) {
	studentID := c.GetUint("student_id")
	var input struct {
		CourseID uint `json:"course_id"`
		Rating   int  `json:"rating"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var enrollment Enrollment
	if err := DB.Where("student_id = ? AND course_id = ?", studentID, input.CourseID).First(&enrollment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enrolled in course"})
		return
	}
	if enrollment.Rating != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already rated"})
		return
	}
	enrollment.Rating = &input.Rating
	DB.Save(&enrollment)

	// Update course average rating
	var ratings []Enrollment
	DB.Where("course_id = ? AND rating IS NOT NULL", input.CourseID).Find(&ratings)
	sum := 0
	for _, r := range ratings {
		sum += *r.Rating
	}
	avg := float64(sum) / float64(len(ratings))
	DB.Model(&Course{}).Where("id = ?", input.CourseID).Update("rating", avg)
	c.JSON(http.StatusOK, gin.H{"message": "Rated successfully"})
}
