-- إنشاء جداول قاعدة البيانات لداشبورد Evico

-- جدول الأعمال
CREATE TABLE works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  client text NOT NULL,
  title text NOT NULL,
  service text NOT NULL,
  sector text NOT NULL,
  year text DEFAULT '',
  description text NOT NULL,
  challenge text DEFAULT '',
  solution text DEFAULT '',
  result text DEFAULT '',
  hidden boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول صور العمل
CREATE TABLE work_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid REFERENCES works(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0
);

-- جدول المنجزات
CREATE TABLE work_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid REFERENCES works(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

-- جدول كلمة سر المدير (صف واحد فقط)
CREATE TABLE admin (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash text NOT NULL
);

-- جدول الجلسات
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة (الموقع يشوف البيانات)
CREATE POLICY "allow_read_works" ON works FOR SELECT USING (true);
CREATE POLICY "allow_read_images" ON work_images FOR SELECT USING (true);
CREATE POLICY "allow_read_deliverables" ON work_deliverables FOR SELECT USING (true);

-- سياسات الكتابة عبر service_role فقط
CREATE POLICY "allow_all_service_role" ON works FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_service_role" ON work_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_service_role" ON work_deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_service_role" ON admin FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_service_role" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- إنشاء index على slug للبحث السريع
CREATE INDEX idx_works_slug ON works(slug);
CREATE INDEX idx_works_featured ON works(featured);
CREATE INDEX idx_works_hidden ON works(hidden);
CREATE INDEX idx_work_images_work_id ON work_images(work_id);
CREATE INDEX idx_work_deliverables_work_id ON work_deliverables(work_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- ملاحظة: كلمة السر ستُدرج عبر API عند seeding
