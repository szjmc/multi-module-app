# 数据库连接错误解决方案

## 错误信息

```json
{
  "status": "error", 
  "message": "API服务初始化失败", 
  "error": "connect ECONNREFUSED 127.0.0.1:5432" 
}
```

## 错误原因

这个错误表明后端应用无法连接到PostgreSQL数据库。具体原因：

1. **本地数据库无法在Vercel上访问** - Vercel是一个Serverless平台，无法直接访问本地的PostgreSQL服务
2. **数据库服务未运行** - 如果在本地运行，可能PostgreSQL服务未启动
3. **环境变量配置错误** - 数据库连接信息可能不正确

## 解决方案

### 方案1：使用Vercel Postgres（推荐）

Vercel提供了内置的PostgreSQL服务，配置简单，与Vercel平台完美集成。

#### 配置步骤

1. 登录Vercel控制台
2. 进入您的后端项目
3. 点击"Storage"选项卡
4. 点击"Connect Database"，选择"PostgreSQL"
5. 选择"Create New"创建新数据库
6. 等待数据库创建完成
7. Vercel会自动添加以下环境变量：
   - `POSTGRES_URL` - 完整的数据库连接URL
   - `POSTGRES_PRISMA_URL` - Prisma专用连接URL
   - `POSTGRES_URL_NO_SSL` - 不带SSL的连接URL
   - `POSTGRES_URL_NON_POOLING` - 非连接池连接URL
   - `POSTGRES_USER` - 数据库用户名
   - `POSTGRES_HOST` - 数据库主机
   - `POSTGRES_PASSWORD` - 数据库密码
   - `POSTGRES_DATABASE` - 数据库名称
   - `POSTGRES_PORT` - 数据库端口

8. 修改`db.js`文件，支持Vercel Postgres的连接URL格式：

```javascript
// 修改testConnection函数
async function testConnection() {
  try {
    // 检查是否有Vercel Postgres的连接URL
    if (process.env.POSTGRES_URL) {
      // 使用Vercel Postgres连接URL
      pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
    } else {
      // 原有的连接逻辑
      // ...
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
    throw err;
  }
}
```

### 方案2：使用Supabase

Supabase是一个开源的Firebase替代品，提供了PostgreSQL数据库服务。

#### 配置步骤

1. 注册并登录Supabase控制台
2. 创建新的项目
3. 在"Settings" > "Database"中获取连接信息
4. 在Vercel项目中添加以下环境变量：
   - `DB_HOST` - Supabase数据库主机
   - `DB_USER` - Supabase数据库用户名
   - `DB_PASSWORD` - Supabase数据库密码
   - `DB_NAME` - Supabase数据库名称
   - `DB_PORT` - 5432

### 方案3：使用外部PostgreSQL服务

您也可以使用其他云服务提供商的PostgreSQL服务，如：
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL

#### 配置步骤

1. 在云服务提供商处创建PostgreSQL数据库
2. 获取连接信息（主机、端口、用户名、密码等）
3. 在Vercel项目中添加相应的环境变量
4. 确保数据库服务允许Vercel IP访问

### 方案4：本地开发环境配置

如果您在本地开发，确保：

1. PostgreSQL服务已启动
2. 数据库用户具有正确的权限
3. 数据库已创建
4. 环境变量配置正确

#### 本地测试命令

```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 启动PostgreSQL服务
sudo systemctl start postgresql

# 连接到数据库
psql -h localhost -U postgres

# 创建数据库
CREATE DATABASE todo_app;
```

## 环境变量配置示例

### Vercel Postgres配置

```
POSTGRES_URL="postgres://user:password@host:5432/database"
POSTGRES_USER="user"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
POSTGRES_PORT="5432"
```

### Supabase配置

```
DB_HOST="db.example.supabase.co"
DB_USER="postgres"
DB_PASSWORD="your-password"
DB_NAME="postgres"
DB_PORT="5432"
```

### 本地开发配置

```
DB_HOST="localhost"
DB_USER="postgres"
DB_PASSWORD="123456"
DB_NAME="todo_app"
DB_PORT="5432"
```

## 验证方法

1. 重新部署Vercel项目
2. 访问根路径 `https://multi-module-app-backend-6itrzhg4h-sans-projects-97fe81a5.vercel.app/`
3. 查看响应是否为：

```json
{
  "status": "ok",
  "message": "FlowSync API服务正在运行",
  "version": "1.0.0",
  "timestamp": "2025-12-11T00:00:00.000Z"
}
```

## 常见问题排查

1. **连接超时**
   - 检查数据库服务是否正常运行
   - 检查网络连接
   - 增加连接超时时间

2. **权限错误**
   - 确保数据库用户有正确的权限
   - 检查数据库密码是否正确

3. **SSL错误**
   - 确保SSL配置正确
   - 对于自签名证书，使用 `rejectUnauthorized: false`

4. **数据库不存在**
   - 确保数据库已创建
   - 检查数据库名称是否正确

## 最佳实践

1. **使用环境变量** - 不要在代码中硬编码数据库连接信息
2. **使用连接池** - 提高性能，减少连接开销
3. **添加错误处理** - 优雅处理数据库连接失败
4. **定期备份** - 确保数据安全
5. **使用SSL连接** - 加密数据传输

## 后续步骤

1. 选择适合您的数据库解决方案
2. 配置环境变量
3. 重新部署项目
4. 验证连接是否成功
5. 测试API功能

---

**文档版本：1.0.0**
**更新日期：2025-12-11**