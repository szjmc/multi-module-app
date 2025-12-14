const express = require('express');
const cors = require('cors');

const app = express();

// 简单的CORS配置，允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 简单测试路由
app.get('/test', (req, res) => {
  res.json({
    message: '简化版API测试成功',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '简化版API运行中',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`简化版服务器运行在端口 ${PORT}`);
});

module.exports = app;