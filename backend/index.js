/**
 * FlowSync 后端主入口
 * 负责启动Express服务器并处理API请求
 */

const express = require('express');
const cors = require('cors');
const { testConnection, initDatabase, query, insert, update, del } = require('./db');
require('dotenv').config();

const app = express();

// 中间件
const corsOptions = {
  origin: ['https://multi-module-7wppp6x1g-sans-projects-97fe81a5.vercel.app', 'https://multi-module-5mcw5agfc-sans-projects-97fe81a5.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
};
app.use(cors(corsOptions));

// 处理OPTIONS请求，确保CORS配置正确
app.options('*', cors(corsOptions));
// 增加请求体大小限制，支持更大的笔记内容
app.use(express.json({ limit: '100mb' }));

// 初始化数据库连接和表
let isDatabaseInitialized = false;
async function initializeDatabase() {
  if (!isDatabaseInitialized) {
    try {
      await testConnection();
      await initDatabase();
      isDatabaseInitialized = true;
    } catch (error) {
      console.error('数据库初始化失败:', error.message);
      throw error;
    }
  }
}

// 根路径路由，返回API状态信息
app.get('/', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({
      status: 'ok',
      message: 'FlowSync API服务正在运行',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API服务初始化失败',
      error: error.message
    });
  }
});

/**
 * 任务API路由
 */

// 获取所有任务
app.get('/api/tasks', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个任务
app.get('/api/tasks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, status = 'pending', priority = 'medium', due_date } = req.body;
    const result = await insert(
      'INSERT INTO tasks (title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [title, description, status, priority, due_date]
    );
    res.status(201).json({ id: result.id, title, description, status, priority, due_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新任务
app.put('/api/tasks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, status, priority, due_date } = req.body;
    const result = await update(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ?',
      [title, description, status, priority, due_date, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json({ id: parseInt(req.params.id), title, description, status, priority, due_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json({ message: '任务已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新任务状态
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    await initializeDatabase();
    const { status } = req.body;
    const result = await update('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '任务不存在' });
    }
    res.json({ id: parseInt(req.params.id), status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 日历事件API路由
 */

// 获取所有事件
app.get('/api/events', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM events ORDER BY start_time ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个事件
app.get('/api/events/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '事件不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建事件
app.post('/api/events', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, start_time, end_time, location, color } = req.body;
    const result = await insert(
      'INSERT INTO events (title, description, start_time, end_time, location, color) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, start_time, end_time, location, color || '#3B82F6']
    );
    res.status(201).json({ id: result.id, title, description, start_time, end_time, location, color: color || '#3B82F6' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新事件
app.put('/api/events/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, start_time, end_time, location, color } = req.body;
    const result = await update(
      'UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?, color = ? WHERE id = ?',
      [title, description, start_time, end_time, location, color, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '事件不存在' });
    }
    res.json({ id: parseInt(req.params.id), title, description, start_time, end_time, location, color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除事件
app.delete('/api/events/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '事件不存在' });
    }
    res.json({ message: '事件已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 番茄钟API路由
 */

// 获取所有番茄钟记录
app.get('/api/pomodoros', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM pomodoros ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建番茄钟记录
app.post('/api/pomodoros', async (req, res) => {
  try {
    await initializeDatabase();
    const { duration = 25, completed = 0, start_time, end_time } = req.body;
    const result = await insert(
      'INSERT INTO pomodoros (duration, completed, start_time, end_time) VALUES (?, ?, ?, ?)',
      [duration, completed, start_time, end_time]
    );
    res.status(201).json({ id: result.id, duration, completed, start_time, end_time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新番茄钟记录
app.put('/api/pomodoros/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { duration, completed, start_time, end_time } = req.body;
    const result = await update(
      'UPDATE pomodoros SET duration = ?, completed = ?, start_time = ?, end_time = ? WHERE id = ?',
      [duration, completed, start_time, end_time, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '番茄钟记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), duration, completed, start_time, end_time });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除番茄钟记录
app.delete('/api/pomodoros/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM pomodoros WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '番茄钟记录不存在' });
    }
    res.json({ message: '番茄钟记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 时间追踪API路由
 */

// 获取所有时间追踪记录
app.get('/api/time-trackings', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM time_trackings ORDER BY start_time DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建时间追踪记录
app.post('/api/time-trackings', async (req, res) => {
  try {
    await initializeDatabase();
    const { task_id, description, start_time } = req.body;
    const result = await insert(
      'INSERT INTO time_trackings (task_id, description, start_time) VALUES (?, ?, ?)',
      [task_id, description, start_time || new Date().toISOString()]
    );
    res.status(201).json({ id: result.id, task_id, description, start_time: start_time || new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新时间追踪记录
app.put('/api/time-trackings/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { task_id, description, start_time, end_time, duration } = req.body;
    const result = await update(
      'UPDATE time_trackings SET task_id = ?, description = ?, start_time = ?, end_time = ?, duration = ? WHERE id = ?',
      [task_id, description, start_time, end_time, duration, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '时间追踪记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), task_id, description, start_time, end_time, duration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 停止时间追踪
app.patch('/api/time-trackings/:id/stop', async (req, res) => {
  try {
    await initializeDatabase();
    const end_time = new Date().toISOString();
    const [tracking] = await query('SELECT start_time FROM time_trackings WHERE id = ?', [req.params.id]);
    
    if (!tracking) {
      return res.status(404).json({ error: '时间追踪记录不存在' });
    }
    
    const duration = Math.round((new Date(end_time) - new Date(tracking.start_time)) / 1000);
    
    const result = await update(
      'UPDATE time_trackings SET end_time = ?, duration = ? WHERE id = ?',
      [end_time, duration, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '时间追踪记录不存在' });
    }
    
    res.json({ id: parseInt(req.params.id), end_time, duration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除时间追踪记录
app.delete('/api/time-trackings/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM time_trackings WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '时间追踪记录不存在' });
    }
    res.json({ message: '时间追踪记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 笔记本API路由
 */

// 获取所有笔记本
app.get('/api/notebooks', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM notebooks ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个笔记本
app.get('/api/notebooks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM notebooks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '笔记本不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建笔记本
app.post('/api/notebooks', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, color, is_default = 0 } = req.body;
    const result = await insert(
      'INSERT INTO notebooks (title, description, color, is_default) VALUES (?, ?, ?, ?)',
      [title, description, color, is_default]
    );
    res.status(201).json({ id: result.id, title, description, color, is_default });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新笔记本
app.put('/api/notebooks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, description, color, is_default } = req.body;
    const result = await update(
      'UPDATE notebooks SET title = ?, description = ?, color = ?, is_default = ? WHERE id = ?',
      [title, description, color, is_default, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记本不存在' });
    }
    res.json({ id: parseInt(req.params.id), title, description, color, is_default });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除笔记本
app.delete('/api/notebooks/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM notebooks WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记本不存在' });
    }
    res.json({ message: '笔记本已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 笔记API路由
 */

// 获取所有笔记
app.get('/api/notes', async (req, res) => {
  try {
    await initializeDatabase();
    const { category, is_favorite, is_archived, notebook_id, sort_by = 'updated_at', order = 'desc' } = req.query;
    let sql = 'SELECT * FROM notes WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (is_favorite) {
      sql += ' AND is_favorite = ?';
      params.push(is_favorite);
    }
    if (is_archived) {
      sql += ' AND is_archived = ?';
      params.push(is_archived);
    }
    if (notebook_id) {
      sql += ' AND notebook_id = ?';
      params.push(notebook_id);
    }
    
    // 支持多种排序方式
    const validSortFields = ['updated_at', 'created_at', 'title', 'is_marked'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'updated_at';
    const orderDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${orderDir}`;
    
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个笔记
app.get('/api/notes/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建笔记
app.post('/api/notes', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, content, draft_content = '', category = '', tags = [], notebook_id = null, is_favorite = 0, is_archived = 0, is_marked = 0 } = req.body;
    // 确保tags是数组类型
    const safeTags = Array.isArray(tags) ? tags : [];
    const result = await insert(
      'INSERT INTO notes (title, content, draft_content, category, tags, notebook_id, is_favorite, is_archived, is_marked, last_saved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [title, content, draft_content, category, safeTags, notebook_id, is_favorite, is_archived, is_marked]
    );
    res.status(201).json({ id: result.id, title, content, draft_content, category, tags: safeTags, notebook_id, is_favorite, is_archived, is_marked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新笔记
app.put('/api/notes/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { title, content, category, tags, notebook_id, is_favorite, is_archived, is_marked, ai_summary, mind_map } = req.body;
    
    // 验证必填字段
    if (!title) {
      return res.status(400).json({ error: '标题不能为空' });
    }
    
    const result = await update(
      'UPDATE notes SET title = ?, content = ?, category = ?, tags = ?, notebook_id = ?, is_favorite = ?, is_archived = ?, is_marked = ?, ai_summary = ?, mind_map = ?, last_saved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, category, tags, notebook_id, is_favorite, is_archived, is_marked, ai_summary, mind_map, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    
    res.json({ id: parseInt(req.params.id), title, content, category, tags, notebook_id, is_favorite, is_archived, is_marked, ai_summary, mind_map });
  } catch (error) {
    console.error('更新笔记失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 更新笔记草稿
app.patch('/api/notes/:id/draft', async (req, res) => {
  try {
    await initializeDatabase();
    const { draft_content } = req.body;
    const result = await update(
      'UPDATE notes SET draft_content = ?, last_saved_at = CURRENT_TIMESTAMP WHERE id = ?',
      [draft_content, req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    
    res.json({ id: parseInt(req.params.id), draft_content });
  } catch (error) {
    console.error('更新笔记草稿失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 标记笔记
app.patch('/api/notes/:id/mark', async (req, res) => {
  try {
    await initializeDatabase();
    const { is_marked } = req.body;
    const result = await update(
      'UPDATE notes SET is_marked = ? WHERE id = ?',
      [is_marked, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json({ id: parseInt(req.params.id), is_marked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 标记笔记为收藏
app.patch('/api/notes/:id/favorite', async (req, res) => {
  try {
    await initializeDatabase();
    const { is_favorite } = req.body;
    const result = await update(
      'UPDATE notes SET is_favorite = ? WHERE id = ?',
      [is_favorite, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json({ id: parseInt(req.params.id), is_favorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 归档笔记
app.patch('/api/notes/:id/archive', async (req, res) => {
  try {
    await initializeDatabase();
    const { is_archived } = req.body;
    const result = await update(
      'UPDATE notes SET is_archived = ? WHERE id = ?',
      [is_archived, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json({ id: parseInt(req.params.id), is_archived });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生成AI摘要
app.post('/api/notes/:id/summary', async (req, res) => {
  try {
    await initializeDatabase();
    // 这里应该调用AI接口生成摘要，现在模拟实现
    const [note] = await query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    
    // 模拟AI生成摘要
    const ai_summary = `这是一篇关于${note.title}的摘要，包含了文章的主要内容和关键点。`;
    
    await update(
      'UPDATE notes SET ai_summary = ? WHERE id = ?',
      [ai_summary, req.params.id]
    );
    
    res.json({ id: parseInt(req.params.id), ai_summary });
  } catch (error) {
    console.error('生成AI摘要失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 生成思维导图
app.post('/api/notes/:id/mind-map', async (req, res) => {
  try {
    await initializeDatabase();
    // 这里应该调用AI接口生成思维导图，现在模拟实现
    const [note] = await query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    
    // 模拟AI生成思维导图结构
    const mind_map = {
      nodes: [
        { id: '1', label: note.title, x: 0, y: 0 },
        { id: '2', label: '关键点1', x: -100, y: -100 },
        { id: '3', label: '关键点2', x: 100, y: -100 },
        { id: '4', label: '关键点3', x: 0, y: 100 }
      ],
      links: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '1', target: '4' }
      ]
    };
    
    await update(
      'UPDATE notes SET mind_map = ? WHERE id = ?',
      [JSON.stringify(mind_map), req.params.id]
    );
    
    res.json({ id: parseInt(req.params.id), mind_map });
  } catch (error) {
    console.error('生成思维导图失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 搜索笔记
app.get('/api/notes/search', async (req, res) => {
  try {
    await initializeDatabase();
    const { query: searchQuery, notebook_id } = req.query;
    if (!searchQuery) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }
    
    let sql = `SELECT * FROM notes WHERE to_tsvector('simple', title || ' ' || content) @@ to_tsquery('simple', ?)`;
    const params = [searchQuery];
    
    if (notebook_id) {
      sql += ' AND notebook_id = ?';
      params.push(notebook_id);
    }
    
    sql += ' ORDER BY updated_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('搜索笔记失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 删除笔记
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM notes WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    res.json({ message: '笔记已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 代码片段API路由
 */

// 获取所有代码片段
app.get('/api/notes/:note_id/code-snippets', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM code_snippets WHERE note_id = ? ORDER BY created_at DESC', [req.params.note_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个代码片段
app.get('/api/notes/:note_id/code-snippets/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM code_snippets WHERE note_id = ? AND id = ?', [req.params.note_id, req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '代码片段不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建代码片段
app.post('/api/notes/:note_id/code-snippets', async (req, res) => {
  try {
    await initializeDatabase();
    const { language, code_content, run_params } = req.body;
    const result = await insert(
      'INSERT INTO code_snippets (note_id, language, code_content, run_params) VALUES (?, ?, ?, ?)',
      [req.params.note_id, language, code_content, JSON.stringify(run_params)]
    );
    res.status(201).json({ id: result.id, note_id: req.params.note_id, language, code_content, run_params });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新代码片段
app.put('/api/notes/:note_id/code-snippets/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { language, code_content, run_params, output } = req.body;
    const result = await update(
      'UPDATE code_snippets SET language = ?, code_content = ?, run_params = ?, output = ? WHERE note_id = ? AND id = ?',
      [language, code_content, JSON.stringify(run_params), output, req.params.note_id, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '代码片段不存在' });
    }
    res.json({ id: parseInt(req.params.id), note_id: req.params.note_id, language, code_content, run_params, output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除代码片段
app.delete('/api/notes/:note_id/code-snippets/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM code_snippets WHERE note_id = ? AND id = ?', [req.params.note_id, req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '代码片段不存在' });
    }
    res.json({ message: '代码片段已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 运行代码片段
app.post('/api/notes/:note_id/code-snippets/:id/run', async (req, res) => {
  try {
    await initializeDatabase();
    // 这里应该调用沙箱执行代码，现在模拟实现
    const [snippet] = await query('SELECT * FROM code_snippets WHERE note_id = ? AND id = ?', [req.params.note_id, req.params.id]);
    if (!snippet) {
      return res.status(404).json({ error: '代码片段不存在' });
    }
    
    // 模拟代码执行结果
    const output = `执行结果：\nHello, World!\n代码语言：${snippet.language}\n执行时间：${new Date().toISOString()}`;
    
    await update(
      'UPDATE code_snippets SET output = ? WHERE note_id = ? AND id = ?',
      [output, req.params.note_id, req.params.id]
    );
    
    res.json({ id: parseInt(req.params.id), output });
  } catch (error) {
    console.error('运行代码片段失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 笔记关联API路由
 */

// 获取笔记关联
app.get('/api/notes/:id/relations', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM note_relations WHERE note_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加笔记关联
app.post('/api/notes/:id/relations', async (req, res) => {
  try {
    await initializeDatabase();
    const { related_note_id, relation_type = 'related' } = req.body;
    const result = await insert(
      'INSERT INTO note_relations (note_id, related_note_id, relation_type) VALUES (?, ?, ?)',
      [req.params.id, related_note_id, relation_type]
    );
    res.status(201).json({ id: result.id, note_id: req.params.id, related_note_id, relation_type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除笔记关联
app.delete('/api/notes/:id/relations/:related_note_id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM note_relations WHERE note_id = ? AND related_note_id = ?', [req.params.id, req.params.related_note_id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '笔记关联不存在' });
    }
    res.json({ message: '笔记关联已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 健康管理API路由
 */

/**
 * 健康记录表API
 */

// 获取所有健康记录
app.get('/api/health-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, date } = req.query;
    let sql = 'SELECT * FROM health_records WHERE 1=1';
    const params = [];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个健康记录
app.get('/api/health-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM health_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '健康记录不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建健康记录
app.post('/api/health-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, value, unit, date, notes } = req.body;
    const result = await insert(
      'INSERT INTO health_records (type, value, unit, date, notes) VALUES (?, ?, ?, ?, ?)',
      [type, value, unit, date, notes]
    );
    res.status(201).json({ id: result.id, type, value, unit, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新健康记录
app.put('/api/health-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, value, unit, date, notes } = req.body;
    const result = await update(
      'UPDATE health_records SET type = ?, value = ?, unit = ?, date = ?, notes = ? WHERE id = ?',
      [type, value, unit, date, notes, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '健康记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), type, value, unit, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除健康记录
app.delete('/api/health-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM health_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '健康记录不存在' });
    }
    res.json({ message: '健康记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 运动记录表API
 */

// 获取所有运动记录
app.get('/api/exercise-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, date, intensity } = req.query;
    let sql = 'SELECT * FROM exercise_records WHERE 1=1';
    const params = [];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (intensity) {
      sql += ' AND intensity = ?';
      params.push(intensity);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个运动记录
app.get('/api/exercise-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM exercise_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '运动记录不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建运动记录
app.post('/api/exercise-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, duration, intensity = 'moderate', calories_burned, date, notes } = req.body;
    const result = await insert(
      'INSERT INTO exercise_records (type, duration, intensity, calories_burned, date, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [type, duration, intensity, calories_burned, date, notes]
    );
    res.status(201).json({ id: result.id, type, duration, intensity, calories_burned, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新运动记录
app.put('/api/exercise-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { type, duration, intensity, calories_burned, date, notes } = req.body;
    const result = await update(
      'UPDATE exercise_records SET type = ?, duration = ?, intensity = ?, calories_burned = ?, date = ?, notes = ? WHERE id = ?',
      [type, duration, intensity, calories_burned, date, notes, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '运动记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), type, duration, intensity, calories_burned, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除运动记录
app.delete('/api/exercise-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM exercise_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '运动记录不存在' });
    }
    res.json({ message: '运动记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 睡眠记录表API
 */

// 获取所有睡眠记录
app.get('/api/sleep-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { date, quality } = req.query;
    let sql = 'SELECT * FROM sleep_records WHERE 1=1';
    const params = [];
    
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (quality) {
      sql += ' AND quality = ?';
      params.push(quality);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个睡眠记录
app.get('/api/sleep-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM sleep_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '睡眠记录不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建睡眠记录
app.post('/api/sleep-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { bedtime, wakeup_time, duration, quality = 'good', notes, date } = req.body;
    const result = await insert(
      'INSERT INTO sleep_records (bedtime, wakeup_time, duration, quality, notes, date) VALUES (?, ?, ?, ?, ?, ?)',
      [bedtime, wakeup_time, duration, quality, notes, date]
    );
    res.status(201).json({ id: result.id, bedtime, wakeup_time, duration, quality, notes, date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新睡眠记录
app.put('/api/sleep-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { bedtime, wakeup_time, duration, quality, notes, date } = req.body;
    const result = await update(
      'UPDATE sleep_records SET bedtime = ?, wakeup_time = ?, duration = ?, quality = ?, notes = ?, date = ? WHERE id = ?',
      [bedtime, wakeup_time, duration, quality, notes, date, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '睡眠记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), bedtime, wakeup_time, duration, quality, notes, date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除睡眠记录
app.delete('/api/sleep-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM sleep_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '睡眠记录不存在' });
    }
    res.json({ message: '睡眠记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 食物数据库API
 */

// 获取所有食物
app.get('/api/foods', async (req, res) => {
  try {
    await initializeDatabase();
    const { category, search } = req.query;
    let sql = 'SELECT * FROM foods WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    
    sql += ' ORDER BY name ASC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个食物
app.get('/api/foods/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM foods WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '食物不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建食物
app.post('/api/foods', async (req, res) => {
  try {
    await initializeDatabase();
    const { name, category, calories, carbs, protein, fat } = req.body;
    const result = await insert(
      'INSERT INTO foods (name, category, calories, carbs, protein, fat) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, calories, carbs, protein, fat]
    );
    res.status(201).json({ id: result.id, name, category, calories, carbs, protein, fat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 餐食记录API
 */

// 获取所有餐食记录
app.get('/api/meal-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { date, meal_type } = req.query;
    let sql = 'SELECT * FROM meal_records WHERE 1=1';
    const params = [];
    
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    if (meal_type) {
      sql += ' AND meal_type = ?';
      params.push(meal_type);
    }
    
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建餐食记录
app.post('/api/meal-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { food_id, food_name, food_category, serving_size, calories, carbs, protein, fat, meal_type, date } = req.body;
    const result = await insert(
      'INSERT INTO meal_records (food_id, food_name, food_category, serving_size, calories, carbs, protein, fat, meal_type, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [food_id, food_name, food_category, serving_size, calories, carbs, protein, fat, meal_type, date]
    );
    res.status(201).json({ id: result.id, food_id, food_name, food_category, serving_size, calories, carbs, protein, fat, meal_type, date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除餐食记录
app.delete('/api/meal-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM meal_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '餐食记录不存在' });
    }
    res.json({ message: '餐食记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 财务管理API路由
 */

/**
 * 收入记录表API
 */

// 获取所有收入记录
app.get('/api/income-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { category, source, date } = req.query;
    let sql = 'SELECT * FROM income_records WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (source) {
      sql += ' AND source = ?';
      params.push(source);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个收入记录
app.get('/api/income-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM income_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '收入记录不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建收入记录
app.post('/api/income-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { amount, source, category, date, notes } = req.body;
    const result = await insert(
      'INSERT INTO income_records (amount, source, category, date, notes) VALUES (?, ?, ?, ?, ?)',
      [amount, source, category, date, notes]
    );
    res.status(201).json({ id: result.id, amount, source, category, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新收入记录
app.put('/api/income-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { amount, source, category, date, notes } = req.body;
    const result = await update(
      'UPDATE income_records SET amount = ?, source = ?, category = ?, date = ?, notes = ? WHERE id = ?',
      [amount, source, category, date, notes, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '收入记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), amount, source, category, date, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除收入记录
app.delete('/api/income-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM income_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '收入记录不存在' });
    }
    res.json({ message: '收入记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 支出记录表API
 */

// 获取所有支出记录
app.get('/api/expense-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { category, payment_method, date } = req.query;
    let sql = 'SELECT * FROM expense_records WHERE 1=1';
    const params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (payment_method) {
      sql += ' AND payment_method = ?';
      params.push(payment_method);
    }
    if (date) {
      sql += ' AND date = ?';
      params.push(date);
    }
    
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个支出记录
app.get('/api/expense-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const rows = await query('SELECT * FROM expense_records WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: '支出记录不存在' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建支出记录
app.post('/api/expense-records', async (req, res) => {
  try {
    await initializeDatabase();
    const { amount, category, description, date, payment_method, notes } = req.body;
    const result = await insert(
      'INSERT INTO expense_records (amount, category, description, date, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [amount, category, description, date, payment_method || 'cash', notes]
    );
    res.status(201).json({ id: result.id, amount, category, description, date, payment_method: payment_method || 'cash', notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新支出记录
app.put('/api/expense-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const { amount, category, description, date, payment_method, notes } = req.body;
    const result = await update(
      'UPDATE expense_records SET amount = ?, category = ?, description = ?, date = ?, payment_method = ?, notes = ? WHERE id = ?',
      [amount, category, description, date, payment_method, notes, req.params.id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: '支出记录不存在' });
    }
    res.json({ id: parseInt(req.params.id), amount, category, description, date, payment_method, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除支出记录
app.delete('/api/expense-records/:id', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await del('DELETE FROM expense_records WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '支出记录不存在' });
    }
    res.json({ message: '支出记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出app实例，用于Vercel部署
module.exports = app;