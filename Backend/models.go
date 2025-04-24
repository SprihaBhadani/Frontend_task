package main

import (
	"time"

	"gorm.io/gorm"
)

type Student struct {
	gorm.Model
	Name        string `json:"name"`
	Email       string `gorm:"unique" json:"email"`
	Password    string `json:"-"`
	Enrollments []Enrollment
}

type Course struct {
	gorm.Model
	Name        string    `json:"name"`
	CreatedAt   time.Time `json:"created_at"`
	Rating      float64   `json:"rating"`
	Enrollments []Enrollment
}

type Enrollment struct {
	gorm.Model
	StudentID uint
	CourseID  uint
	Rating    *int // nullable
}
