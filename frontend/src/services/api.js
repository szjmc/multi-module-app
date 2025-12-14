/**
 * API服务模块
 * 负责与后端API进行通信
 */

import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API请求:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('响应错误:', error.message, error.config?.url);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return Promise.reject(error);
  }
);

/**
 * 任务相关API
 */
export const taskApi = {
  // 获取所有任务
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  
  // 获取单个任务
  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  // 创建任务
  create: async (task) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  
  // 更新任务
  update: async (id, task) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  
  // 删除任务
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  // 更新任务状态
  updateStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  }
};

/**
 * 日历事件相关API
 */
export const eventApi = {
  // 获取所有事件
  getAll: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  
  // 获取单个事件
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  // 创建事件
  create: async (event) => {
    const response = await api.post('/events', event);
    return response.data;
  },
  
  // 更新事件
  update: async (id, event) => {
    const response = await api.put(`/events/${id}`, event);
    return response.data;
  },
  
  // 删除事件
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};

/**
 * 番茄钟相关API
 */
export const pomodoroApi = {
  // 获取所有番茄钟记录
  getAll: async () => {
    const response = await api.get('/pomodoros');
    return response.data;
  },
  
  // 创建番茄钟记录
  create: async (pomodoro) => {
    const response = await api.post('/pomodoros', pomodoro);
    return response.data;
  },
  
  // 更新番茄钟记录
  update: async (id, pomodoro) => {
    const response = await api.put(`/pomodoros/${id}`, pomodoro);
    return response.data;
  },
  
  // 删除番茄钟记录
  delete: async (id) => {
    const response = await api.delete(`/pomodoros/${id}`);
    return response.data;
  }
};

/**
 * 时间追踪相关API
 */
export const timeTrackingApi = {
  // 获取所有时间追踪记录
  getAll: async () => {
    const response = await api.get('/time-trackings');
    return response.data;
  },
  
  // 创建时间追踪记录
  create: async (tracking) => {
    const response = await api.post('/time-trackings', tracking);
    return response.data;
  },
  
  // 更新时间追踪记录
  update: async (id, tracking) => {
    const response = await api.put(`/time-trackings/${id}`, tracking);
    return response.data;
  },
  
  // 停止时间追踪
  stop: async (id) => {
    const response = await api.patch(`/time-trackings/${id}/stop`);
    return response.data;
  },
  
  // 删除时间追踪记录
  delete: async (id) => {
    const response = await api.delete(`/time-trackings/${id}`);
    return response.data;
  }
};

/**
 * 笔记相关API
 */
export const noteApi = {
  // 获取所有笔记
  getAll: async (params = {}) => {
    const response = await api.get('/notes', { params });
    return response.data;
  },
  
  // 获取单个笔记
  getById: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  // 创建笔记
  create: async (note) => {
    const response = await api.post('/notes', note);
    return response.data;
  },
  
  // 更新笔记
  update: async (id, note) => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },
  
  // 更新笔记草稿
  updateDraft: async (id, draft_content) => {
    const response = await api.patch(`/notes/${id}/draft`, { draft_content });
    return response.data;
  },
  
  // 删除笔记
  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
  
  // 标记笔记为收藏
  toggleFavorite: async (id, is_favorite) => {
    const response = await api.patch(`/notes/${id}/favorite`, { is_favorite });
    return response.data;
  },
  
  // 标记笔记
  toggleMark: async (id, is_marked) => {
    const response = await api.patch(`/notes/${id}/mark`, { is_marked });
    return response.data;
  },
  
  // 归档笔记
  toggleArchive: async (id, is_archived) => {
    const response = await api.patch(`/notes/${id}/archive`, { is_archived });
    return response.data;
  },
  
  // 生成AI摘要
  generateSummary: async (id) => {
    const response = await api.post(`/notes/${id}/summary`);
    return response.data;
  },
  
  // 生成思维导图
  generateMindMap: async (id) => {
    const response = await api.post(`/notes/${id}/mind-map`);
    return response.data;
  },
  
  // 搜索笔记
  search: async (query, params = {}) => {
    const response = await api.get('/notes/search', { params: { query, ...params } });
    return response.data;
  }
};

/**
 * 笔记本相关API
 */
export const notebookApi = {
  // 获取所有笔记本
  getAll: async () => {
    const response = await api.get('/notebooks');
    return response.data;
  },
  
  // 获取单个笔记本
  getById: async (id) => {
    const response = await api.get(`/notebooks/${id}`);
    return response.data;
  },
  
  // 创建笔记本
  create: async (notebook) => {
    const response = await api.post('/notebooks', notebook);
    return response.data;
  },
  
  // 更新笔记本
  update: async (id, notebook) => {
    const response = await api.put(`/notebooks/${id}`, notebook);
    return response.data;
  },
  
  // 删除笔记本
  delete: async (id) => {
    const response = await api.delete(`/notebooks/${id}`);
    return response.data;
  }
};

/**
 * 代码片段相关API
 */
export const codeSnippetApi = {
  // 获取所有代码片段
  getAll: async (note_id) => {
    const response = await api.get(`/notes/${note_id}/code-snippets`);
    return response.data;
  },
  
  // 获取单个代码片段
  getById: async (note_id, id) => {
    const response = await api.get(`/notes/${note_id}/code-snippets/${id}`);
    return response.data;
  },
  
  // 创建代码片段
  create: async (note_id, snippet) => {
    const response = await api.post(`/notes/${note_id}/code-snippets`, snippet);
    return response.data;
  },
  
  // 更新代码片段
  update: async (note_id, id, snippet) => {
    const response = await api.put(`/notes/${note_id}/code-snippets/${id}`, snippet);
    return response.data;
  },
  
  // 删除代码片段
  delete: async (note_id, id) => {
    const response = await api.delete(`/notes/${note_id}/code-snippets/${id}`);
    return response.data;
  },
  
  // 运行代码片段
  run: async (note_id, id, params = {}) => {
    const response = await api.post(`/notes/${note_id}/code-snippets/${id}/run`, params);
    return response.data;
  }
};

/**
 * 健康管理相关API
 */

/**
 * 健康记录相关API
 */
export const healthRecordApi = {
  // 获取所有健康记录
  getAll: async (params = {}) => {
    const response = await api.get('/health-records', { params });
    return response.data;
  },
  
  // 获取单个健康记录
  getById: async (id) => {
    const response = await api.get(`/health-records/${id}`);
    return response.data;
  },
  
  // 创建健康记录
  create: async (record) => {
    const response = await api.post('/health-records', record);
    return response.data;
  },
  
  // 更新健康记录
  update: async (id, record) => {
    const response = await api.put(`/health-records/${id}`, record);
    return response.data;
  },
  
  // 删除健康记录
  delete: async (id) => {
    const response = await api.delete(`/health-records/${id}`);
    return response.data;
  }
};

/**
 * 运动记录相关API
 */
export const exerciseRecordApi = {
  // 获取所有运动记录
  getAll: async (params = {}) => {
    const response = await api.get('/exercise-records', { params });
    return response.data;
  },
  
  // 获取单个运动记录
  getById: async (id) => {
    const response = await api.get(`/exercise-records/${id}`);
    return response.data;
  },
  
  // 创建运动记录
  create: async (record) => {
    const response = await api.post('/exercise-records', record);
    return response.data;
  },
  
  // 更新运动记录
  update: async (id, record) => {
    const response = await api.put(`/exercise-records/${id}`, record);
    return response.data;
  },
  
  // 删除运动记录
  delete: async (id) => {
    const response = await api.delete(`/exercise-records/${id}`);
    return response.data;
  }
};

/**
 * 睡眠记录相关API
 */
export const sleepRecordApi = {
  // 获取所有睡眠记录
  getAll: async (params = {}) => {
    const response = await api.get('/sleep-records', { params });
    return response.data;
  },
  
  // 获取单个睡眠记录
  getById: async (id) => {
    const response = await api.get(`/sleep-records/${id}`);
    return response.data;
  },
  
  // 创建睡眠记录
  create: async (record) => {
    const response = await api.post('/sleep-records', record);
    return response.data;
  },
  
  // 更新睡眠记录
  update: async (id, record) => {
    const response = await api.put(`/sleep-records/${id}`, record);
    return response.data;
  },
  
  // 删除睡眠记录
  delete: async (id) => {
    const response = await api.delete(`/sleep-records/${id}`);
    return response.data;
  }
};

/**
 * 食物数据库相关API
 */
export const foodApi = {
  // 获取所有食物
  getAll: async (params = {}) => {
    const response = await api.get('/foods', { params });
    return response.data;
  },
  
  // 获取单个食物
  getById: async (id) => {
    const response = await api.get(`/foods/${id}`);
    return response.data;
  },
  
  // 创建食物
  create: async (food) => {
    const response = await api.post('/foods', food);
    return response.data;
  }
};

/**
 * 餐食记录相关API
 */
export const mealRecordApi = {
  // 获取所有餐食记录
  getAll: async (params = {}) => {
    const response = await api.get('/meal-records', { params });
    return response.data;
  },
  
  // 创建餐食记录
  create: async (record) => {
    const response = await api.post('/meal-records', record);
    return response.data;
  },
  
  // 删除餐食记录
  delete: async (id) => {
    const response = await api.delete(`/meal-records/${id}`);
    return response.data;
  }
};

/**
 * 财务管理相关API
 */

/**
 * 收入记录相关API
 */
export const incomeRecordApi = {
  // 获取所有收入记录
  getAll: async (params = {}) => {
    const response = await api.get('/income-records', { params });
    return response.data;
  },
  
  // 获取单个收入记录
  getById: async (id) => {
    const response = await api.get(`/income-records/${id}`);
    return response.data;
  },
  
  // 创建收入记录
  create: async (record) => {
    const response = await api.post('/income-records', record);
    return response.data;
  },
  
  // 更新收入记录
  update: async (id, record) => {
    const response = await api.put(`/income-records/${id}`, record);
    return response.data;
  },
  
  // 删除收入记录
  delete: async (id) => {
    const response = await api.delete(`/income-records/${id}`);
    return response.data;
  }
};

/**
 * 支出记录相关API
 */
export const expenseRecordApi = {
  // 获取所有支出记录
  getAll: async (params = {}) => {
    const response = await api.get('/expense-records', { params });
    return response.data;
  },
  
  // 获取单个支出记录
  getById: async (id) => {
    const response = await api.get(`/expense-records/${id}`);
    return response.data;
  },
  
  // 创建支出记录
  create: async (record) => {
    const response = await api.post('/expense-records', record);
    return response.data;
  },
  
  // 更新支出记录
  update: async (id, record) => {
    const response = await api.put(`/expense-records/${id}`, record);
    return response.data;
  },
  
  // 删除支出记录
  delete: async (id) => {
    const response = await api.delete(`/expense-records/${id}`);
    return response.data;
  }
};

export default api;