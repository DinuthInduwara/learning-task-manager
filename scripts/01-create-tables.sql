-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('theory', 'video', 'paper')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
  video_url TEXT,
  notes TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lesson VARCHAR(255) DEFAULT 'General'
);

-- Insert default subjects
INSERT INTO subjects (name, color) VALUES
  ('Physics', '#EF4444'),
  ('Combined Maths', '#3B82F6'),
  ('Pure Maths', '#8B5CF6'),
  ('Applied Maths', '#10B981'),
  ('ICT', '#F59E0B'),
  ('Chemistry', '#EC4899'),
  ('Biology', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Update existing tasks to have a default lesson if needed
UPDATE tasks SET lesson = 'General' WHERE lesson IS NULL OR lesson = '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_lesson ON tasks(lesson); -- Create index for lesson filtering
