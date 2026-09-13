package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SpinHistory ประวัติการหมุนวงล้อ
type SpinHistory struct {
	ID                 string    `gorm:"type:uuid;primaryKey" json:"id"`
	PrizeID            string    `gorm:"type:uuid;not null;column:prize_id" json:"prizeId"`
	PrizeLabelSnapshot string    `gorm:"type:varchar(100);not null;column:prize_label_snapshot" json:"prizeLabelSnapshot"`
	PlayerName         *string   `gorm:"type:varchar(100);column:player_name" json:"playerName"`
	Prize              *Prize    `gorm:"foreignKey:PrizeID;references:ID" json:"Prize,omitempty"`
	CreatedAt          time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt          time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// TableName กำหนดชื่อตารางในฐานข้อมูลเป็น spin_histories
func (SpinHistory) TableName() string {
	return "spin_histories"
}

// BeforeCreate สร้าง UUID v4 อัตโนมัติหากไม่ได้ระบุ ID มา
func (s *SpinHistory) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return
}
