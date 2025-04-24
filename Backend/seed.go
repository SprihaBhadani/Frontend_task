package main

import (
    "gorm.io/gorm"
    "time"
)

func SeedCourses(db *gorm.DB) {
    courses := []Course{
        {Name: "Mathematics", CreatedAt: time.Now(), Rating: 70},
        {Name: "Physics", CreatedAt: time.Now(), Rating: 70},
        {Name: "Chemistry", CreatedAt: time.Now(), Rating: 70},
        {Name: "Biology", CreatedAt: time.Now(), Rating: 70},
        {Name: "Computer Science", CreatedAt: time.Now(), Rating: 70},
    }
    for _, c := range courses {
        var existing Course
        if err := db.Where("name = ?", c.Name).First(&existing).Error; err != nil {
            db.Create(&c)
        }
    }
}