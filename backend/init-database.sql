-- FlowSync 数据库初始化脚本
-- 执行命令：psql -h <host> -U <user> -d <database> -f init-database.sql

-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  due_date VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建任务表更新触发器
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_tasks_updated_at();

-- 创建日历事件表
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time VARCHAR(50) NOT NULL,
  end_time VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  color VARCHAR(50) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建日历事件表更新触发器
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_events_updated_at();

-- 创建番茄钟记录表
CREATE TABLE IF NOT EXISTS pomodoros (
  id SERIAL PRIMARY KEY,
  duration INT DEFAULT 25,
  completed INT DEFAULT 0,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建时间追踪表
CREATE TABLE IF NOT EXISTS time_trackings (
  id SERIAL PRIMARY KEY,
  task_id INT,
  description TEXT,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- 创建笔记本表
CREATE TABLE IF NOT EXISTS notebooks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#3B82F6',
  is_default INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建笔记本表更新触发器
CREATE OR REPLACE FUNCTION update_notebooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notebooks_updated_at ON notebooks;
CREATE TRIGGER update_notebooks_updated_at
BEFORE UPDATE ON notebooks
FOR EACH ROW
EXECUTE FUNCTION update_notebooks_updated_at();

-- 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(50),
  is_favorite INT DEFAULT 0,
  is_archived INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notebook_id INT,
  draft_content TEXT,
  tags TEXT[],
  is_marked INT DEFAULT 0,
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ai_summary TEXT,
  mind_map JSONB
);

-- 创建笔记表外键约束
ALTER TABLE notes ADD CONSTRAINT notes_notebook_id_fk FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL;

-- 创建笔记表更新触发器
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_notes_updated_at();

-- 创建笔记关联表
CREATE TABLE IF NOT EXISTS note_relations (
  id SERIAL PRIMARY KEY,
  note_id INT NOT NULL,
  related_note_id INT NOT NULL,
  relation_type VARCHAR(50) DEFAULT 'related',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (related_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE(note_id, related_note_id)
);

-- 创建代码片段表
CREATE TABLE IF NOT EXISTS code_snippets (
  id SERIAL PRIMARY KEY,
  note_id INT NOT NULL,
  language VARCHAR(50) NOT NULL,
  code_content TEXT NOT NULL,
  run_params JSONB,
  output TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- 创建代码片段表更新触发器
CREATE OR REPLACE FUNCTION update_code_snippets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_code_snippets_updated_at ON code_snippets;
CREATE TRIGGER update_code_snippets_updated_at
BEFORE UPDATE ON code_snippets
FOR EACH ROW
EXECUTE FUNCTION update_code_snippets_updated_at();

-- 创建全文检索索引
CREATE INDEX IF NOT EXISTS notes_search_idx ON notes USING GIN (to_tsvector('simple', title || ' ' || content));

-- 创建健康记录表
CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  date VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建健康记录表更新触发器
CREATE OR REPLACE FUNCTION update_health_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
CREATE TRIGGER update_health_records_updated_at
BEFORE UPDATE ON health_records
FOR EACH ROW
EXECUTE FUNCTION update_health_records_updated_at();

-- 创建运动记录表
CREATE TABLE IF NOT EXISTS exercise_records (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  intensity VARCHAR(50) DEFAULT 'moderate',
  calories_burned INT,
  date VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建运动记录表更新触发器
CREATE OR REPLACE FUNCTION update_exercise_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_exercise_records_updated_at ON exercise_records;
CREATE TRIGGER update_exercise_records_updated_at
BEFORE UPDATE ON exercise_records
FOR EACH ROW
EXECUTE FUNCTION update_exercise_records_updated_at();

-- 创建睡眠记录表
CREATE TABLE IF NOT EXISTS sleep_records (
  id SERIAL PRIMARY KEY,
  bedtime VARCHAR(50) NOT NULL,
  wakeup_time VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  quality VARCHAR(50) DEFAULT 'good',
  notes TEXT,
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建睡眠记录表更新触发器
CREATE OR REPLACE FUNCTION update_sleep_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sleep_records_updated_at ON sleep_records;
CREATE TRIGGER update_sleep_records_updated_at
BEFORE UPDATE ON sleep_records
FOR EACH ROW
EXECUTE FUNCTION update_sleep_records_updated_at();

-- 创建食物表
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  calories INT NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  fat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建餐食记录表
CREATE TABLE IF NOT EXISTS meal_records (
  id SERIAL PRIMARY KEY,
  food_id INT NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  food_category VARCHAR(50) NOT NULL,
  serving_size INT NOT NULL,
  calories INT NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  protein DECIMAL(10,2) NOT NULL,
  fat DECIMAL(10,2) NOT NULL,
  meal_type VARCHAR(50) NOT NULL,
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- 创建收入记录表
CREATE TABLE IF NOT EXISTS income_records (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  source VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  date VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建收入记录表更新触发器
CREATE OR REPLACE FUNCTION update_income_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_income_records_updated_at ON income_records;
CREATE TRIGGER update_income_records_updated_at
BEFORE UPDATE ON income_records
FOR EACH ROW
EXECUTE FUNCTION update_income_records_updated_at();

-- 创建支出记录表
CREATE TABLE IF NOT EXISTS expense_records (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建支出记录表更新触发器
CREATE OR REPLACE FUNCTION update_expense_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_expense_records_updated_at ON expense_records;
CREATE TRIGGER update_expense_records_updated_at
BEFORE UPDATE ON expense_records
FOR EACH ROW
EXECUTE FUNCTION update_expense_records_updated_at();

-- 数据库初始化完成
SELECT '数据库初始化完成' AS message;