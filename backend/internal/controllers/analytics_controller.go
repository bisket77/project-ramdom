package controllers

import (
	"net/http"
	"time"

	"random-backend/internal/config"
	"random-backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// getTodayDate คืนค่าสตริงวันที่ของวันนี้ใน TimeZone Asia/Bangkok เช่น "2026-09-13"
func getTodayDate() string {
	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		loc = time.FixedZone("ICT", 7*3600)
	}
	return time.Now().In(loc).Format("2006-01-02")
}

// RecordVisit บันทึกการเข้าชม 1 ครั้ง, รีเซ็ต/เพิ่มสถิติประจำวัน และบันทึกลง Database
func RecordVisit(c *gin.Context) {
	ip := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	if len(userAgent) > 250 {
		userAgent = userAgent[:250]
	}

	path := c.DefaultQuery("path", "/")
	today := getTodayDate()

	// 1. บันทึก log การเข้าชมลงตาราง visit_logs
	visit := models.VisitLog{
		IPAddress: ip,
		UserAgent: userAgent,
		Path:      path,
	}
	_ = config.DB.Create(&visit)

	// 2. บันทึกลงตาราง daily_stats (รีเซ็ตนับใหม่เมื่อขึ้นวันใหม่ และสะสมข้อมูลแต่ละวันไว้)
	var daily models.DailyStat
	err := config.DB.Where("date = ?", today).First(&daily).Error
	if err != nil {
		// ขึ้นวันใหม่ สร้าง record ใหม่ของวันนี้ เริ่มนับที่ 1
		daily = models.DailyStat{
			Date:       today,
			VisitCount: 1,
			SpinCount:  0,
		}
		_ = config.DB.Create(&daily)
	} else {
		// วันเดิม เพิ่มจำนวนการเข้าชมของวันนี้ +1
		config.DB.Model(&daily).UpdateColumn("visit_count", gorm.Expr("visit_count + ?", 1))
		daily.VisitCount++
	}

	// 3. คำนวณยอดรวมทั้งหมดตั้งแต่เริ่มต้น
	var totalVisits int64
	config.DB.Model(&models.VisitLog{}).Count(&totalVisits)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"todayDate":   today,
			"todayVisits": daily.VisitCount,
			"totalVisits": totalVisits,
		},
	})
}

// GetVisitStats ดึงสถิติจำนวนการเข้าชม (ทั้งของวันนี้ที่รีเซ็ตทุกวัน และยอดรวมทั้งหมด)
func GetVisitStats(c *gin.Context) {
	today := getTodayDate()

	var daily models.DailyStat
	config.DB.Where("date = ?", today).First(&daily)

	var totalVisits int64
	config.DB.Model(&models.VisitLog{}).Count(&totalVisits)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"todayDate":   today,
			"todayVisits": daily.VisitCount,
			"totalVisits": totalVisits,
		},
	})
}

// GetDailyHistory ดึงประวัติสถิติย้อนหลังแต่ละวันจากตาราง daily_stats
func GetDailyHistory(c *gin.Context) {
	var histories []models.DailyStat
	if err := config.DB.Order("date DESC").Limit(30).Find(&histories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    histories,
	})
}

// IncrementTodaySpin บันทึกจำนวนการหมุนสุ่มของวันนี้ใน daily_stats
func IncrementTodaySpin() {
	today := getTodayDate()
	var daily models.DailyStat
	err := config.DB.Where("date = ?", today).First(&daily).Error
	if err != nil {
		daily = models.DailyStat{
			Date:       today,
			VisitCount: 0,
			SpinCount:  1,
		}
		config.DB.Clauses(clause.OnConflict{DoNothing: true}).Create(&daily)
	} else {
		config.DB.Model(&daily).UpdateColumn("spin_count", gorm.Expr("spin_count + ?", 1))
	}
}
