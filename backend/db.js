/**
 * 数据库连接模块
 * 负责与PostgreSQL数据库建立连接
 */

const { Pool } = require('pg');
require('dotenv').config();

// 数据库名称
const dbName = process.env.DB_NAME || 'todo_app';

// 初始化pool变量
let pool;

// 测试数据库连接并创建数据库
async function testConnection() {
  try {
    // 基础SSL配置，处理自签名证书
    const sslConfig = {
      rejectUnauthorized: false,
      requestCert: false,
      agent: false
    };
    
    // 检查是否有Vercel Postgres的连接URL
    if (process.env.POSTGRES_URL) {
      // 使用Vercel Postgres连接URL，提取SSL配置
      const connectionString = process.env.POSTGRES_URL;
      
      // 创建连接池配置
      pool = new Pool({
        connectionString: connectionString,
        ssl: connectionString.includes('sslmode=disable') ? false : sslConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
    } else {
      // 解析环境变量，确保密码不是空字符串
      const dbPassword = process.env.DB_PASSWORD;
      const isPasswordSet = dbPassword && typeof dbPassword === 'string' && dbPassword.trim() !== '';
      
      // 创建连接池配置
      const mainPoolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        port: process.env.DB_PORT || 5432,
        database: dbName,
        max: 10, // 连接池中的最大连接数
        idleTimeoutMillis: 30000, // 空闲连接超时时间
        connectionTimeoutMillis: 5000, // 增加连接超时时间
        ssl: sslConfig // 应用SSL配置
      };
      
      // 只有当密码存在且不为空字符串时才添加密码配置
      if (isPasswordSet) {
        mainPoolConfig.password = dbPassword;
      }
      
      // 创建连接池
      pool = new Pool(mainPoolConfig);
    }
    
    // 测试连接
    const testClient = await pool.connect();
    await testClient.query('SELECT NOW()');
    testClient.release();
    
    console.log('数据库连接池创建成功');
    
    return pool;
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    console.error('错误堆栈:', err.stack);
    
    // 尝试无SSL连接作为备选方案
    try {
      console.log('尝试无SSL连接...');
      
      if (process.env.POSTGRES_URL) {
        pool = new Pool({
          connectionString: process.env.POSTGRES_URL,
          ssl: false,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });
      } else {
        const dbPassword = process.env.DB_PASSWORD;
        const isPasswordSet = dbPassword && typeof dbPassword === 'string' && dbPassword.trim() !== '';
        
        const mainPoolConfig = {
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'postgres',
          port: process.env.DB_PORT || 5432,
          database: dbName,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: false // 禁用SSL
        };
        
        if (isPasswordSet) {
          mainPoolConfig.password = dbPassword;
        }
        
        pool = new Pool(mainPoolConfig);
      }
      
      // 测试备选连接
      const testClient = await pool.connect();
      await testClient.query('SELECT NOW()');
      testClient.release();
      
      console.log('无SSL连接成功');
      return pool;
    } catch (backupErr) {
      console.error('无SSL连接也失败:', backupErr.message);
      throw err; // 抛出原始错误
    }
  }
}

// 获取当前pool实例
function getPool() {
  if (!pool) {
    throw new Error('数据库连接池未初始化，请先调用testConnection()');
  }
  return pool;
}

/**
 * 初始化数据库表
 */
async function initDatabase() {
  try {
    // 创建任务表
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        due_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建更新触发器，当任务表更新时自动更新updated_at字段
    const createTasksUpdateTrigger = `
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
    `;
    
    // 创建日历事件表
    const createEventsTable = `
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
      )
    `;
    
    // 创建更新触发器，当日历事件表更新时自动更新updated_at字段
    const createEventsUpdateTrigger = `
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
    `;
    
    // 创建番茄钟记录表
    const createPomodorosTable = `
      CREATE TABLE IF NOT EXISTS pomodoros (
        id SERIAL PRIMARY KEY,
        duration INT DEFAULT 25,
        completed INT DEFAULT 0,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建时间追踪表
    const createTimeTrackingsTable = `
      CREATE TABLE IF NOT EXISTS time_trackings (
        id SERIAL PRIMARY KEY,
        task_id INT,
        description TEXT,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        duration INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
      )
    `;
    
    // 创建笔记本表
    const createNotebooksTable = `
      CREATE TABLE IF NOT EXISTS notebooks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(50) DEFAULT '#3B82F6',
        is_default INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建更新触发器，当笔记本表更新时自动更新updated_at字段
    const createNotebooksUpdateTrigger = `
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
    `;
    
    // 创建笔记表（包含所有必要字段，避免动态添加字段的问题）
    const createNotesTable = `
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
      )
    `;
    
    // 如果需要添加新字段，使用ALTER TABLE语句
    // 先查询已存在的字段
    const getExistingColumns = `
      SELECT column_name FROM information_schema.columns WHERE table_name = 'notes';
    `;
    // 定义需要添加的字段
    const columnsToAdd = [
      { name: 'notebook_id', type: 'INT' },
      { name: 'draft_content', type: 'TEXT' },
      { name: 'tags', type: 'TEXT[]' },
      { name: 'is_marked', type: 'INT DEFAULT 0' },
      { name: 'last_saved_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'ai_summary', type: 'TEXT' },
      { name: 'mind_map', type: 'JSONB' }
    ];
    
    // 创建更新触发器，当笔记表更新时自动更新updated_at字段
    const createNotesUpdateTrigger = `
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
    `;
    
    // 创建笔记关联表
    const createNoteRelationsTable = `
      CREATE TABLE IF NOT EXISTS note_relations (
        id SERIAL PRIMARY KEY,
        note_id INT NOT NULL,
        related_note_id INT NOT NULL,
        relation_type VARCHAR(50) DEFAULT 'related',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (related_note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE(note_id, related_note_id)
      )
    `;
    
    // 创建代码片段表
    const createCodeSnippetsTable = `
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
      )
    `;
    
    // 创建更新触发器，当代码片段表更新时自动更新updated_at字段
    const createCodeSnippetsUpdateTrigger = `
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
    `;
    
    // 创建全文检索索引，使用默认的simple配置
    const createNotesFullTextIndex = `
      CREATE INDEX IF NOT EXISTS notes_search_idx ON notes USING GIN (to_tsvector('simple', title || ' ' || content));
    `;
    
    // 创建健康记录表
    const createHealthRecordsTable = `
      CREATE TABLE IF NOT EXISTS health_records (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50),
        date VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建更新触发器，当健康记录表更新时自动更新updated_at字段
    const createHealthRecordsUpdateTrigger = `
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
    `;
    
    // 创建运动记录表
    const createExerciseRecordsTable = `
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
      )
    `;
    
    // 创建更新触发器，当运动记录表更新时自动更新updated_at字段
    const createExerciseRecordsUpdateTrigger = `
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
    `;
    
    // 创建睡眠记录表
    const createSleepRecordsTable = `
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
      )
    `;
    
    // 创建更新触发器，当睡眠记录表更新时自动更新updated_at字段
    const createSleepRecordsUpdateTrigger = `
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
    `;
    
    // 创建食物表
    const createFoodsTable = `
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        calories INT NOT NULL,
        carbs DECIMAL(10,2) NOT NULL,
        protein DECIMAL(10,2) NOT NULL,
        fat DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建餐食记录表
    const createMealRecordsTable = `
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
      )
    `;
    
    // 创建收入记录表
    const createIncomeRecordsTable = `
      CREATE TABLE IF NOT EXISTS income_records (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        source VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 创建更新触发器，当收入记录表更新时自动更新updated_at字段
    const createIncomeRecordsUpdateTrigger = `
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
    `;
    
    // 创建支出记录表
    const createExpenseRecordsTable = `
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
      )
    `;
    
    // 创建更新触发器，当支出记录表更新时自动更新updated_at字段
    const createExpenseRecordsUpdateTrigger = `
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
    `;
    
    // 执行创建表的SQL语句
    await pool.query(createTasksTable);
    await pool.query(createTasksUpdateTrigger);
    await pool.query(createEventsTable);
    await pool.query(createEventsUpdateTrigger);
    await pool.query(createPomodorosTable);
    await pool.query(createTimeTrackingsTable);
    await pool.query(createNotebooksTable);
    await pool.query(createNotebooksUpdateTrigger);
    await pool.query(createNotesTable);
    
    // 动态添加缺失的字段
    const existingColumnsResult = await pool.query(getExistingColumns);
    const existingColumns = new Set(existingColumnsResult.rows.map(row => row.column_name));
    
    for (const column of columnsToAdd) {
      if (!existingColumns.has(column.name)) {
        try {
          await pool.query(`ALTER TABLE notes ADD COLUMN ${column.name} ${column.type}`);
          console.log(`Added column ${column.name} to notes table`);
        } catch (error) {
          console.error(`Failed to add column ${column.name}:`, error.message);
        }
      }
    }
    
    // 添加外键约束
    try {
      await pool.query(`ALTER TABLE notes ADD CONSTRAINT notes_notebook_id_fk FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL`);
      console.log('Added foreign key constraint to notes table');
    } catch (error) {
      // 忽略约束已存在的错误
      if (!error.message.includes('already exists')) {
        console.error('Failed to add foreign key constraint:', error.message);
      }
    }
    
    await pool.query(createNotesUpdateTrigger);
    await pool.query(createNoteRelationsTable);
    await pool.query(createCodeSnippetsTable);
    await pool.query(createCodeSnippetsUpdateTrigger);
    await pool.query(createHealthRecordsTable);
    await pool.query(createHealthRecordsUpdateTrigger);
    await pool.query(createExerciseRecordsTable);
    await pool.query(createExerciseRecordsUpdateTrigger);
    await pool.query(createSleepRecordsTable);
    await pool.query(createSleepRecordsUpdateTrigger);
    await pool.query(createFoodsTable);
    await pool.query(createMealRecordsTable);
    await pool.query(createIncomeRecordsTable);
    await pool.query(createIncomeRecordsUpdateTrigger);
    await pool.query(createExpenseRecordsTable);
    await pool.query(createExpenseRecordsUpdateTrigger);
    await pool.query(createNotesFullTextIndex);
    
    console.log('数据库表初始化成功');
  } catch (err) {
    console.error('数据库表初始化失败:', err.message);
    console.error('错误堆栈:', err.stack);
    throw err;
  }
}

/**
 * 将MySQL风格的问号占位符转换为PostgreSQL风格的$1, $2, $3...占位符
 * @param {string} sql - 带有问号占位符的SQL语句
 * @returns {string} - 带有PostgreSQL占位符的SQL语句
 */
function convertPlaceholders(sql) {
  let count = 0;
  return sql.replace(/\?/g, () => `$${++count}`);
}

/**
 * 执行SQL查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} - 查询结果
 */
async function query(sql, params = []) {
  try {
    // 获取pool实例
    const poolInstance = getPool();
    // 将MySQL风格的问号占位符转换为PostgreSQL风格的$1, $2, $3...占位符
    const pgSql = convertPlaceholders(sql);
    const result = await poolInstance.query(pgSql, params);
    return result.rows;
  } catch (err) {
    console.error('查询执行失败:', err.message);
    console.error('SQL:', sql);
    console.error('转换后SQL:', convertPlaceholders(sql));
    console.error('参数:', params);
    throw err;
  }
}

/**
 * 执行SQL插入
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} - 插入结果
 */
async function insert(sql, params = []) {
  try {
    // 获取pool实例
    const poolInstance = getPool();
    // 将MySQL风格的问号占位符转换为PostgreSQL风格的$1, $2, $3...占位符
    const pgSql = convertPlaceholders(sql);
    const result = await poolInstance.query(pgSql, params);
    return { id: result.rows[0]?.id || result.insertId };
  } catch (err) {
    console.error('插入执行失败:', err.message);
    console.error('SQL:', sql);
    console.error('转换后SQL:', convertPlaceholders(sql));
    console.error('参数:', params);
    throw err;
  }
}

/**
 * 执行SQL更新
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} - 更新结果
 */
async function update(sql, params = []) {
  try {
    // 获取pool实例
    const poolInstance = getPool();
    // 将MySQL风格的问号占位符转换为PostgreSQL风格的$1, $2, $3...占位符
    const pgSql = convertPlaceholders(sql);
    const result = await poolInstance.query(pgSql, params);
    return { changes: result.rowCount };
  } catch (err) {
    console.error('更新执行失败:', err.message);
    console.error('SQL:', sql);
    console.error('转换后SQL:', convertPlaceholders(sql));
    console.error('参数:', params);
    throw err;
  }
}

/**
 * 执行SQL删除
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} - 删除结果
 */
async function del(sql, params = []) {
  try {
    // 获取pool实例
    const poolInstance = getPool();
    // 将MySQL风格的问号占位符转换为PostgreSQL风格的$1, $2, $3...占位符
    const pgSql = convertPlaceholders(sql);
    const result = await poolInstance.query(pgSql, params);
    return { changes: result.rowCount };
  } catch (err) {
    console.error('删除执行失败:', err.message);
    console.error('SQL:', sql);
    console.error('转换后SQL:', convertPlaceholders(sql));
    console.error('参数:', params);
    throw err;
  }
}

module.exports = {
  pool,
  testConnection,
  getPool,
  initDatabase,
  query,
  insert,
  update,
  del
};