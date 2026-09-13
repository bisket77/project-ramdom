package controllers

import (
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"random-backend/internal/config"
	"random-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// pickWeightedRandomPrize เลือกรางวัล 1 รายการโดยใช้น้ำหนัก (weight) กำหนดโอกาส
func pickWeightedRandomPrize(prizes []models.Prize) (models.Prize, int) {
	totalWeight := 0
	for _, p := range prizes {
		totalWeight += p.Weight
	}

	if totalWeight <= 0 {
		return prizes[0], 0
	}

	randomWeight := rand.Intn(totalWeight) // [0, totalWeight)
	runningSum := 0

	for idx, prize := range prizes {
		runningSum += prize.Weight
		if randomWeight < runningSum {
			return prize, idx
		}
	}

	lastIdx := len(prizes) - 1
	return prizes[lastIdx], lastIdx
}

// SpinWheel สุ่มรางวัล 1 รายการ บันทึกประวัติ และส่งผลกลับให้ frontend คำนวณมุมหมุน
func SpinWheel(c *gin.Context) {
	var req struct {
		PlayerName string `json:"playerName"`
	}
	_ = c.ShouldBindJSON(&req)

	var prizes []models.Prize
	if err := config.DB.Where("is_active = ?", true).Order("sort_order ASC").Find(&prizes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	if len(prizes) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "ยังไม่มีรางวัลบนวงล้อ"})
		return
	}

	winningPrize, winningIndex := pickWeightedRandomPrize(prizes)

	var playerName *string
	if req.PlayerName != "" {
		playerName = &req.PlayerName
	}

	history := models.SpinHistory{
		PrizeID:            winningPrize.ID,
		PrizeLabelSnapshot: winningPrize.Label,
		PlayerName:         playerName,
	}

	if err := config.DB.Create(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	// บันทึกสถิติการสุ่มของวันนี้ลงใน daily_stats
	IncrementTodaySpin()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"prize":          winningPrize,
			"winningIndex":   winningIndex,
			"totalSegments": len(prizes),
			"historyId":      history.ID,
		},
	})
}

// GetSpinHistory ดึงประวัติการหมุนล่าสุด
func GetSpinHistory(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	var histories []models.SpinHistory
	if err := config.DB.Preload("Prize").Order("created_at DESC").Limit(limit).Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": histories})
}

// ClearSpinHistory ล้างประวัติการหมุนทั้งหมด
func ClearSpinHistory(c *gin.Context) {
	if err := config.DB.Exec("DELETE FROM spin_histories").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "ล้างประวัติการหมุนเรียบร้อย", "data": []gin.H{}})
}

