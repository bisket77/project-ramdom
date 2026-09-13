package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Prize ตารางข้อมูลรางวัล/ช่องบนวงล้อสุ่ม
type Prize struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	Label     string    `gorm:"type:varchar(100);not null" json:"label"`
	Color     string    `gorm:"type:varchar(20);not null;default:'#FF3D81'" json:"color"`
	Weight    int       `gorm:"not null;default:1" json:"weight"`
	IsActive  bool      `gorm:"not null;default:true;column:is_active" json:"isActive"`
	SortOrder int       `gorm:"not null;default:0;column:sort_order" json:"sortOrder"`
	CreatedAt time.Time `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updatedAt"`
}

// TableName กำหนดชื่อตารางในฐานข้อมูลเป็น prizes
func (Prize) TableName() string {
	return "prizes"
}

// BeforeCreate สร้าง UUID v4 อัตโนมัติหากไม่ได้ระบุ ID มา
func (p *Prize) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return
}
