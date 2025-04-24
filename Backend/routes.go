package main

import "github.com/gin-gonic/gin"

func SetupRoutes(r *gin.Engine) {
    r.POST("/api/register", Register)
    r.POST("/api/login", Login)

    auth := r.Group("/api")
    auth.Use(AuthMiddleware())
    auth.GET("/courses", GetCourses)
    auth.POST("/enroll", EnrollCourse)
    auth.GET("/enrollments", GetEnrollments)
    auth.POST("/rate", RateCourse)
}