-- إضافة حقل البنر لتحديد صورة الغلاف
ALTER TABLE works ADD COLUMN IF NOT EXISTS banner text DEFAULT '';

-- تحديث البيانات الحالية: تعيين أول صورة كبنر
UPDATE works w
SET banner = (
  SELECT wi.url FROM work_images wi
  WHERE wi.work_id = w.id
  ORDER BY wi.sort_order
  LIMIT 1
)
WHERE banner = '';
