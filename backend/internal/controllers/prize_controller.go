package controllers

import (
	"net/http"
	"strings"

	"random-backend/internal/config"
	"random-backend/internal/models"

	"github.com/gin-gonic/gin"
)

var defaultColors = []string{
	"#FF3D81", "#2DE1C2", "#FFD23F", "#7C5CFF", "#3DDC97", "#FF6B6B",
	"#FFA07A", "#20B2AA", "#9370DB", "#FF69B4", "#48D1CC", "#FFB6C1",
}

// GetAllPrizes ดึงรายการรางวัลทั้งหมดที่เปิดใช้งาน เรียงตาม sortOrder
func GetAllPrizes(c *gin.Context) {
	var prizes []models.Prize
	if err := config.DB.Where("is_active = ?", true).Order("sort_order ASC").Find(&prizes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": prizes})
}

// CreatePrize เพิ่มรางวัลใหม่
func CreatePrize(c *gin.Context) {
	var req struct {
		Label     string `json:"label" binding:"required"`
		Color     string `json:"color"`
		Weight    int    `json:"weight"`
		SortOrder *int   `json:"sortOrder"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "กรุณาระบุชื่อรางวัล"})
		return
	}

	trimmedLabel := strings.TrimSpace(req.Label)
	if trimmedLabel == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "กรุณาระบุชื่อรางวัล"})
		return
	}

	color := "#FF3D81"
	if req.Color != "" {
		color = req.Color
	}

	weight := 1
	if req.Weight > 0 {
		weight = req.Weight
	}

	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}

	prize := models.Prize{
		Label:     trimmedLabel,
		Color:     color,
		Weight:    weight,
		SortOrder: sortOrder,
		IsActive:  true,
	}

	if err := config.DB.Create(&prize).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"success": true, "data": prize})
}

// ReplaceAllPrizes แทนที่รายการรางวัลทั้งหมดด้วยรายการใหม่ (Bulk Replace จาก Entries Textarea)
func ReplaceAllPrizes(c *gin.Context) {
	var req struct {
		Items []struct {
			Label  string `json:"label"`
			Color  string `json:"color"`
			Weight int    `json:"weight"`
		} `json:"items"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var newPrizes []models.Prize
	for idx, item := range req.Items {
		trimmed := strings.TrimSpace(item.Label)
		if trimmed == "" {
			continue
		}
		color := item.Color
		if color == "" {
			color = defaultColors[idx%len(defaultColors)]
		}
		weight := item.Weight
		if weight <= 0 {
			weight = 1
		}
		newPrizes = append(newPrizes, models.Prize{
			Label:     trimmed,
			Color:     color,
			Weight:    weight,
			SortOrder: idx,
			IsActive:  true,
		})
	}

	if len(newPrizes) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ต้องมีรายการอย่างน้อย 1 รายการ"})
		return
	}

	// ใช้ Transaction ในการลบของเดิมและใส่ของใหม่
	tx := config.DB.Begin()
	if err := tx.Exec("DELETE FROM prizes").Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "ไม่สามารถล้างรายการเดิมได้"})
		return
	}

	if err := tx.Create(&newPrizes).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "ไม่สามารถบันทึกรายการใหม่ได้"})
		return
	}

	tx.Commit()

	var updated []models.Prize
	config.DB.Where("is_active = ?", true).Order("sort_order ASC").Find(&updated)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": updated})
}

// UpdatePrize แก้ไขรางวัลตาม id
func UpdatePrize(c *gin.Context) {
	id := c.Param("id")

	var prize models.Prize
	if err := config.DB.First(&prize, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "ไม่พบรางวัลนี้"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	dbUpdates := make(map[string]interface{})
	for k, v := range updates {
		switch k {
		case "label":
			dbUpdates["label"] = v
		case "color":
			dbUpdates["color"] = v
		case "weight":
			dbUpdates["weight"] = v
		case "isActive":
			dbUpdates["is_active"] = v
		case "sortOrder":
			dbUpdates["sort_order"] = v
		}
	}

	if err := config.DB.Model(&prize).Updates(dbUpdates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	config.DB.First(&prize, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": prize})
}

// DeletePrize ลบรางวัลตาม id
func DeletePrize(c *gin.Context) {
	id := c.Param("id")

	var prize models.Prize
	if err := config.DB.First(&prize, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "ไม่พบรางวัลนี้"})
		return
	}

	if err := config.DB.Delete(&prize).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "ลบรางวัลเรียบร้อย"})
}
