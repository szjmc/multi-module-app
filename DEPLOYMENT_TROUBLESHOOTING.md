# Vercel部署问题排查指南

## 发现的问题

### 1. 后端401 Unauthorized错误
**问题**: 后端API返回401错误，无法访问
**原因**: 可能是Vercel认证配置或环境变量问题
**解决方案**:
- 简化了根路径响应，移除数据库依赖
- 优化了CORS配置，使用函数形式支持更多域名
- 更新了vercel.json配置

### 2. CORS配置问题
**问题**: 前后端跨域请求被阻止
**已修复**:
- 更新了CORS配置，支持动态域名检查
- 添加了更多允许的前端域名
- 优化了请求头配置

### 3. API基础URL不匹配
**问题**: 前端API配置可能不匹配实际部署URL
**已修复**:
- 添加了环境变量支持
- 创建了生产环境配置文件
- 添加了请求/响应拦截器用于调试

## 修复的配置

### 后端配置更新
1. **CORS配置** (index.js):
   ```javascript
   const corsOptions = {
     origin: function (origin, callback) {
       const allowedOrigins = [
         'https://multi-module-7wppp6x1g-sans-projects-97fe81a5.vercel.app',
         'https://multi-module-5mcw5agfc-sans-projects-97fe81a5.vercel.app', 
         'https://multi-module-60zkh5uso-sans-projects-97fe81a5.vercel.app',
         'https://multi-module-app-frontend-psi.vercel.app',
         'http://localhost:3000',
         'http://localhost:5173',
         'http://localhost:8080'
       ];
       // 动态检查origin
     }
   };
   ```

2. **数据库连接** (db.js):
   ```javascript
   // 优化了连接字符串处理
   const poolConfig = {
     connectionString: connectionUrl,
     ssl: { rejectUnauthorized: false },
     max: 10,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 20000,
   };
   ```

3. **Vercel配置** (vercel.json):
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "index.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "index.js" }
     ]
   }
   ```

### 前端配置更新
1. **API服务** (services/api.js):
   ```javascript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || 'https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/api',
     timeout: 15000
   });
   ```

2. **环境变量**:
   - `.env.production`: 生产环境API URL
   - `.env.development`: 开发环境API URL

## 需要检查的环境变量

### Vercel后端环境变量
- `POSTGRES_URL`: Supabase数据库连接URL
- `NODE_ENV`: 环境标识 (production)
- `DB_HOST`: 数据库主机
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码
- `DB_PORT`: 数据库端口

### Vercel前端环境变量
- `VITE_API_BASE_URL`: 后端API地址

## 部署步骤

### 重新部署后端
1. 推送代码到GitHub
2. 在Vercel中触发重新部署
3. 检查部署日志
4. 测试根路径: `/health` 和 `/`

### 重新部署前端
1. 确认环境变量设置正确
2. 推送代码到GitHub
3. 在Vercel中触发重新部署
4. 测试API连接

## 测试URL

### 后端测试
- 健康检查: `https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/health`
- 根路径: `https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/`

### 前端测试
- 应用: `https://multi-module-app-frontend-psi.vercel.app`

## 后续步骤

1. **验证401错误解决**: 重新部署后端并测试
2. **检查环境变量**: 确保所有必需的环境变量已设置
3. **测试API调用**: 确认前端可以正常调用后端API
4. **数据库连接测试**: 验证数据库连接是否正常工作

## 常见问题

### Q: 仍然收到401错误
A: 检查Vercel项目设置中的环境变量，确保POSTGRES_URL正确设置

### Q: CORS错误
A: 确认前端域名已添加到后端CORS允许列表中

### Q: 数据库连接失败
A: 检查Supabase连接字符串格式和权限设置

## 调试建议

1. 使用浏览器开发者工具查看网络请求
2. 检查Vercel函数日志
3. 使用Postman测试API端点
4. 在本地环境中模拟生产配置