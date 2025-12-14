#!/usr/bin/env node

/**
 * 部署检查脚本
 * 用于验证前后端部署状态
 */

const https = require('https');

// 测试URL列表
const urls = [
  {
    name: '后端根路径',
    url: 'https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/',
    expectedStatus: 200
  },
  {
    name: '后端健康检查',
    url: 'https://multi-module-app-backend-jxemb7ued-sans-projects-97fe81a5.vercel.app/health',
    expectedStatus: 200
  },
  {
    name: '前端应用',
    url: 'https://multi-module-app-frontend-psi.vercel.app/',
    expectedStatus: 200
  },
  {
    name: '前端静态资源',
    url: 'https://multi-module-app-frontend-psi.vercel.app/src/main.js',
    expectedStatus: 404 // 应该返回404，因为main.js在构建后应该被处理
  }
];

// 测试函数
function checkUrl(urlObj) {
  return new Promise((resolve) => {
    const { name, url, expectedStatus } = urlObj;
    console.log(`\n🔍 测试: ${name}`);
    console.log(`   URL: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`   状态码: ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type'] || '未设置'}`);
      
      if (res.statusCode === expectedStatus) {
        console.log(`   ✅ 通过`);
        resolve({ name, status: 'success', statusCode: res.statusCode });
      } else {
        console.log(`   ❌ 失败 - 期望状态码 ${expectedStatus}`);
        resolve({ name, status: 'failed', statusCode: res.statusCode });
      }
    });

    req.on('error', (error) => {
      console.log(`   ❌ 请求失败: ${error.message}`);
      resolve({ name, status: 'error', error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`   ❌ 请求超时`);
      resolve({ name, status: 'timeout' });
    });
  });
}

// 执行测试
async function runTests() {
  console.log('🚀 开始部署检查...\n');
  
  const results = [];
  for (const urlObj of urls) {
    const result = await checkUrl(urlObj);
    results.push(result);
  }
  
  console.log('\n📊 测试结果汇总:');
  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`   ✅ 成功: ${successCount}`);
  console.log(`   ❌ 失败: ${failedCount}`);
  console.log(`   🚫 错误: ${errorCount}`);
  
  if (successCount === urls.length) {
    console.log('\n🎉 所有测试通过！部署正常。');
  } else {
    console.log('\n⚠️  发现问题，请检查失败的测试项。');
  }
}

// 运行测试
runTests().catch(console.error);