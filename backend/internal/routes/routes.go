package routes

import (
	"net/http"

	"random-backend/internal/controllers"
	"random-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetUpRoutes(r *gin.Engine) {
	// CORS Middleware
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "Random Wheel Backend (Go) is running smoothly",
			})
		})

		// Prize Routes
		api.GET("/prizes", controllers.GetAllPrizes)
		api.POST("/prizes", controllers.CreatePrize)
		api.PUT("/prizes/bulk", controllers.ReplaceAllPrizes)
		api.PUT("/prizes/:id", controllers.UpdatePrize)
		api.DELETE("/prizes/:id", controllers.DeletePrize)

		// Wheel Spin & History Routes
		api.POST("/wheel/spin", controllers.SpinWheel)
		api.GET("/wheel/history", controllers.GetSpinHistory)
		api.DELETE("/wheel/history", controllers.ClearSpinHistory)

		// Visits & Analytics Routes
		api.POST("/visits", controllers.RecordVisit)
		api.GET("/visits", controllers.GetVisitStats)
		api.GET("/visits/history", controllers.GetDailyHistory)
	}
}
