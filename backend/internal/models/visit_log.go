package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// VisitLog ตารางบันทึกประวัติและจำนวนการเข้าใช้งานระบบ
type VisitLog struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	IPAddress string    `gorm:"type:varchar(50);column:ip_address" json:"ipAddress"`
	UserAgent string    `gorm:"type:varchar(255);column:user_agent" json:"userAgent"`
	Path      string    `gorm:"type:varchar(100);column:path" json:"path"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
}

// TableName กำหนดชื่อตารางในฐานข้อมูลเป็น visit_logs
func (VisitLog) TableName() string {
	return "visit_logs"
}

// BeforeCreate สร้าง UUID อัตโนมัติ
func (v *VisitLog) BeforeCreate(tx *gorm.DB) (err error) {
	if v.ID == "" {
		v.ID = uuid.New().String()
	}
	return
}
