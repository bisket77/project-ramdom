package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DailyStat ตารางบันทึกสถิติประจำวัน (รีเซ็ตนับใหม่ทุก 1 วัน และเก็บสะสมไว้ในฐานข้อมูลถาวร)
type DailyStat struct {
	ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
	Date       string    `gorm:"type:varchar(10);uniqueIndex;column:date" json:"date"` // เช่น 2026-09-13
	VisitCount int64     `gorm:"not null;default:0;column:visit_count" json:"visitCount"`
	SpinCount  int64     `gorm:"not null;default:0;column:spin_count" json:"spinCount"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// TableName กำหนดชื่อตารางเป็น daily_stats
func (DailyStat) TableName() string {
	return "daily_stats"
}

// BeforeCreate กำหนด UUID อัตโนมัติ
func (d *DailyStat) BeforeCreate(tx *gorm.DB) (err error) {
	if d.ID == "" {
		d.ID = uuid.New().String()
	}
	return
}
