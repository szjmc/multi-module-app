# FlowSync 后端部署文档

## 1. 项目概述

FlowSync是一个多功能的任务管理和生活追踪应用，包含任务管理、日历事件、番茄钟、时间追踪、笔记管理、健康管理和财务管理等功能。

## 2. 部署环境要求

- Node.js 16.x 或更高版本
- PostgreSQL 14.x 或更高版本（推荐使用Supabase或Vercel Postgres）
- Vercel账户（用于部署）

## 3. Vercel部署步骤

### 3.1 准备工作

1. 确保代码仓库已推送到GitHub/GitLab等版本控制系统
2. 注册并登录Vercel账户
3. 准备好数据库连接信息

### 3.2 部署后端项目

1. 登录Vercel控制台，点击"New Project"
2. 选择您的代码仓库
3. 选择后端目录（`backend`）作为项目根目录
4. 点击"Deploy"按钮开始部署

### 3.3 配置环境变量

部署完成后，在Vercel项目设置中添加以下环境变量：

| 环境变量名 | 描述 | 默认值 |
|------------|------|--------|
| `DB_HOST` | 数据库主机地址 | localhost |
| `DB_USER` | 数据库用户名 | postgres |
| `DB_PASSWORD` | 数据库密码 | - |
| `DB_NAME` | 数据库名称 | todo_app |
| `DB_PORT` | 数据库端口 | 5432 |
| `PORT` | 应用运行端口 | 3000 |

## 4. 数据库初始化

### 4.1 自动初始化（推荐）

项目已内置数据库初始化逻辑，在首次请求时会自动执行以下操作：

1. 连接到数据库
2. 检查并创建所需的表结构
3. 创建必要的索引和触发器
4. 设置外键约束

### 4.2 手动初始化（可选）

如果需要手动初始化数据库，可以按照以下步骤操作：

1. 连接到您的PostgreSQL数据库
2. 执行`db.js`文件中的`initDatabase`函数包含的SQL语句
3. 确保所有表结构创建成功

### 4.3 数据库表结构

项目包含以下主要表：

- `tasks` - 任务管理
- `events` - 日历事件
- `pomodoros` - 番茄钟记录
- `time_trackings` - 时间追踪
- `notebooks` - 笔记本
- `notes` - 笔记
- `code_snippets` - 代码片段
- `note_relations` - 笔记关联
- `health_records` - 健康记录
- `exercise_records` - 运动记录
- `sleep_records` - 睡眠记录
- `foods` - 食物数据库
- `meal_records` - 餐食记录
- `income_records` - 收入记录
- `expense_records` - 支出记录

## 5. 数据导入

### 5.1 准备数据文件

1. 将需要导入的数据整理为SQL格式或CSV格式
2. 确保数据格式与表结构匹配
3. 注意外键约束，确保关联数据的完整性

### 5.2 使用SQL导入

1. 连接到您的PostgreSQL数据库
2. 执行以下命令导入SQL文件：

```bash
psql -h <host> -U <user> -d <database> -f <data_file.sql>
```

### 5.3 使用CSV导入

1. 对于每个表，创建对应的CSV文件
2. 使用`COPY`命令导入数据：

```sql
COPY <table_name> FROM '<file_path>' WITH CSV HEADER;
```

### 5.4 示例数据（可选）

项目不包含示例数据，您可以根据需要创建测试数据。以下是创建任务的示例SQL：

```sql
INSERT INTO tasks (title, description, status, priority, due_date) VALUES 
('完成项目部署文档', '编写详细的部署文档，包括数据库初始化和数据导入', 'pending', 'high', '2025-12-15'),
('测试API端点', '使用Postman测试所有API端点', 'pending', 'medium', '2025-12-16'),
('优化数据库性能', '调整连接池配置，提高数据库性能', 'pending', 'low', '2025-12-17');
```

## 6. 配置说明

### 6.1 vercel.json配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "index.js"
    },
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

### 6.2 CORS配置

CORS已配置允许以下域名访问：

- `https://multi-module-5mcw5agfc-sans-projects-97fe81a5.vercel.app`（前端生产域名）
- `http://localhost:3000`（本地开发域名）
- `http://localhost:5173`（本地开发域名）

## 7. 测试方法

### 7.1 检查API状态

访问后端根路径，检查API是否正常运行：

```
https://your-backend-domain.vercel.app/
```

预期响应：

```json
{
  "status": "ok",
  "message": "FlowSync API服务正在运行",
  "version": "1.0.0",
  "timestamp": "2025-12-10T00:00:00.000Z"
}
```

### 7.2 测试API端点

使用Postman或类似工具测试API端点：

- 获取所有任务：`GET /api/tasks`
- 创建任务：`POST /api/tasks`
- 获取所有事件：`GET /api/events`

### 7.3 前端集成测试

访问前端应用，测试完整的业务流程：

- 登录/注册功能
- 任务创建和管理
- 日历事件管理
- 笔记创建和编辑

## 8. 常见问题排查

### 8.1 数据库连接失败

- 检查环境变量配置是否正确
- 确保数据库服务正常运行
- 检查数据库连接权限
- 确保数据库已创建

### 8.2 跨域错误

- 检查CORS配置是否包含前端域名
- 确保前端请求使用正确的HTTP方法
- 检查前端请求的Content-Type是否正确

### 8.3 API返回404

- 检查API路径是否正确
- 确保后端项目已成功部署
- 检查vercel.json路由配置是否正确

### 8.4 数据库初始化失败

- 检查数据库用户是否有创建表的权限
- 检查SQL语句是否正确
- 查看Vercel部署日志，获取详细错误信息

## 9. 监控和维护

### 9.1 查看日志

- 在Vercel控制台查看部署日志和函数日志
- 配置日志服务，如Logtail或Datadog

### 9.2 性能监控

- 使用Vercel Analytics监控API性能
- 监控数据库连接池使用情况
- 定期优化数据库查询

## 10. 后续更新

- 定期更新依赖包
- 关注Vercel平台的更新和变更
- 根据用户反馈优化API设计

## 11. 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 项目GitHub Issues
- 邮件：your-email@example.com

---

**文档版本：1.0.0**
**更新日期：2025-12-10**