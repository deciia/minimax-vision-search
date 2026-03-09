#!/usr/bin/env node
/**
 * MiniMax Vision & Search - API服务器
 * 
 * 提供RESTful API接口，支持Web界面调用
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// 文件上传配置
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (JPEG, PNG, GIF, WebP)'));
    }
  }
});

// 确保上传目录存在
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// 工具函数：执行命令
function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      timeout: 60000, // 60秒超时
      ...options
    });
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stderr: error.stderr ? error.stderr.toString() : null
    };
  }
}

// 工具函数：解析搜索结果
function parseSearchResults(rawResult) {
  try {
    // 尝试解析JSON
    const parsed = JSON.parse(rawResult);
    
    if (parsed.organic && Array.isArray(parsed.organic)) {
      return parsed.organic.slice(0, 10).map(item => ({
        title: item.title || '无标题',
        url: item.link || '',
        snippet: item.snippet || '无摘要',
        date: item.date || ''
      }));
    }
    
    // 如果不是期望的格式，返回原始内容
    return [{ title: '搜索结果', snippet: rawResult }];
  } catch (e) {
    // 如果不是JSON，返回原始内容
    return [{ title: '搜索结果', snippet: rawResult }];
  }
}

// API路由

// 健康检查
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      minimax_mcp: 'connected',
      web_search: 'available',
      image_analysis: 'available'
    }
  });
});

// 网络搜索API
app.post('/api/search', async (req, res) => {
  try {
    const { query, count = 5, language = 'zh-CN' } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '搜索查询不能为空'
      });
    }
    
    // 构建命令
    const countParam = Math.min(Math.max(parseInt(count) || 5, 1), 10);
    const cmd = `node "${path.join(__dirname, '../scripts/web-search.js')}" --query "${query.replace(/"/g, '\\"')}" --count ${countParam} --lang ${language} --format json --no-save`;
    
    console.log(`执行搜索: ${query}`);
    
    // 执行搜索
    const result = executeCommand(cmd);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: '搜索执行失败',
        details: result.error
      });
    }
    
    // 解析结果
    let parsedResult;
    try {
      parsedResult = JSON.parse(result.data);
    } catch (e) {
      parsedResult = { content: result.data };
    }
    
    // 提取搜索结果
    const searchResults = parseSearchResults(result.data);
    
    res.json({
      success: true,
      data: {
        results: searchResults,
        count: searchResults.length,
        query: query,
        language: language,
        raw: parsedResult
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('搜索API错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 图片分析API
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { prompt, format = 'text' } = req.body;
    const imageFile = req.file;
    
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: '请上传图片文件'
      });
    }
    
    if (!prompt || prompt.trim() === '') {
      // 清理上传的文件
      fs.unlinkSync(imageFile.path);
      return res.status(400).json({
        success: false,
        error: '分析提示不能为空'
      });
    }
    
    // 构建命令
    const imagePath = path.resolve(imageFile.path);
    const cmd = `node "${path.join(__dirname, '../scripts/analyze-image.js')}" --image "${imagePath}" --prompt "${prompt.replace(/"/g, '\\"')}" --format ${format}`;
    
    console.log(`分析图片: ${imageFile.originalname}, 提示: ${prompt}`);
    
    // 执行分析
    const result = executeCommand(cmd);
    
    // 清理上传的文件
    try {
      fs.unlinkSync(imageFile.path);
    } catch (e) {
      console.warn('清理文件失败:', e.message);
    }
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: '图片分析失败',
        details: result.error
      });
    }
    
    // 解析结果
    let parsedResult;
    try {
      parsedResult = JSON.parse(result.data);
    } catch (e) {
      parsedResult = { content: result.data };
    }
    
    res.json({
      success: true,
      data: parsedResult,
      metadata: {
        filename: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype,
        prompt: prompt,
        format: format
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('图片分析API错误:', error);
    
    // 尝试清理文件
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // 忽略清理错误
      }
    }
    
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`MiniMax Vision & Search API 服务器已启动`);
  console.log(`访问地址: http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api/status`);
  console.log(`Web界面: http://localhost:${PORT}`);
  console.log(`按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  
  // 清理上传目录
  try {
    if (fs.existsSync('uploads')) {
      const files = fs.readdirSync('uploads');
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join('uploads', file));
        } catch (e) {
          // 忽略错误
        }
      });
      fs.rmdirSync('uploads');
    }
  } catch (e) {
    // 忽略清理错误
  }
  
  console.log('服务器已关闭');
  process.exit(0);
});
