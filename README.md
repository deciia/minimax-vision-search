# MiniMax Vision & Search Skill

一个基于MiniMax MCP的OpenClaw技能，提供强大的视觉分析和实时信息检索功能。

## 功能特性

### 🖼️ 图片理解功能
- **验证码识别**：自动识别图片中的验证码、滑块位置
- **文字提取**：从图片中提取文字内容
- **内容分析**：描述图片内容、识别物体、分析场景
- **视觉问答**：回答关于图片的特定问题

### 🔍 网络搜索功能
- **实时搜索**：获取最新信息、新闻、数据
- **知识检索**：查找技术文档、教程、解决方案
- **信息验证**：验证事实、查找参考资料
- **多语言搜索**：支持中文和英文搜索

## 快速开始

### 前置条件
1. 安装 Node.js (>= 16.0.0)
2. 安装 `mcporter` CLI 工具
3. 获取 MiniMax Coding Plan API Key

### 安装步骤

1. **克隆或下载本技能**
   ```bash
   git clone https://github.com/yourusername/minimax-vision-search.git
   cd minimax-vision-search
   ```

2. **安装依赖**
   ```bash
   # 进入api目录安装Node.js依赖
   cd api
   npm install
   
   # 全局安装mcporter
   npm install -g @modelcontextprotocol/mcporter
   ```

3. **配置API Key**
   ```bash
   # 返回项目根目录
   cd ..
   
   # 运行配置脚本
   node scripts/setup-config.js --api-key "YOUR_API_KEY_HERE"
   ```

4. **验证配置**
   ```bash
   # 测试MCP服务器连接
   mcporter list
   
   # 测试图片理解功能
   node scripts/analyze-image.js --image "examples/test.png" --prompt "描述这张图片"
   
   # 测试网络搜索功能
   node scripts/web-search.js --query "OpenClaw最新版本"
   ```

## 使用方式

### 命令行使用

#### 图片分析
```bash
# 基本用法
node scripts/analyze-image.js --image "path/to/image.png" --prompt "描述图片内容"

# 识别验证码
node scripts/analyze-image.js --image "captcha.png" --prompt "识别滑块位置"

# 提取文字
node scripts/analyze-image.js --image "screenshot.png" --prompt "提取所有文字"

# 输出JSON格式
node scripts/analyze-image.js --image "image.jpg" --prompt "分析场景" --format json
```

#### 网络搜索
```bash
# 基本搜索
node scripts/web-search.js --query "最新AI技术"

# 指定结果数量
node scripts/web-search.js --query "OpenClaw配置" --count 5

# 英文搜索
node scripts/web-search.js --query "latest AI news" --lang "en-US"

# 输出JSON格式
node scripts/web-search.js --query "测试" --format json
```

### Web界面使用

1. **启动API服务器**
   ```bash
   node scripts/start-api.js
   # 或
   cd api && npm start
   ```

2. **访问Web界面**
   打开浏览器访问：http://localhost:3000

3. **使用功能**
   - **网络搜索**：输入关键词，获取实时搜索结果
   - **图片分析**：上传图片，输入分析提示，获取分析结果
   - **API测试**：查看和测试所有API接口

### OpenClaw集成

在OpenClaw中，你可以通过以下方式使用本技能：

1. **直接调用脚本**
   ```bash
   # 在OpenClaw会话中
   exec node scripts/web-search.js --query "如何修复OpenClaw错误"
   ```

2. **创建自定义命令**
   在OpenClaw配置中添加别名：
   ```bash
   # 在OpenClaw配置中
   alias minimax-search="node /path/to/minimax-vision-search/scripts/web-search.js"
   alias minimax-vision="node /path/to/minimax-vision-search/scripts/analyze-image.js"
   ```

## API接口

### RESTful API

启动API服务器后，可以使用以下接口：

#### 健康检查
```http
GET /api/status
```

#### 网络搜索
```http
POST /api/search
Content-Type: application/json

{
  "query": "搜索关键词",
  "count": 5,
  "language": "zh-CN"
}
```

#### 图片分析
```http
POST /api/analyze
Content-Type: multipart/form-data

image: [图片文件]
prompt: "分析提示"
format: "text"
```

### MCP协议

本技能通过MCP协议与OpenClaw集成：

- **工具名称**: `minimax-coding-plan`
- **可用工具**:
  - `understand_image`: 图片理解
  - `web_search`: 网络搜索

## 配置说明

### 配置文件位置
- `~/.mcporter/config.json` - MCP服务器配置
- `api/package.json` - Node.js依赖配置

### 环境变量
- `MINIMAX_API_KEY`: MiniMax API密钥（必需）
- `MINIMAX_API_HOST`: API主机地址（默认：https://api.minimaxi.com）
- `PORT`: API服务器端口（默认：3000）

## 目录结构

```
minimax-vision-search/
├── api/                    # API服务器
│   ├── server.js          # Express服务器
│   ├── package.json       # Node.js依赖
│   └── uploads/           # 临时上传目录
├── scripts/               # 命令行脚本
│   ├── analyze-image.js   # 图片分析脚本
│   ├── web-search.js      # 网络搜索脚本
│   ├── setup-config.js    # 配置脚本
│   └── start-api.js       # 启动脚本
├── web/                   # Web界面
│   └── index.html         # 主页面
├── examples/              # 示例文件
├── SKILL.md              # 技能文档
├── README.md             # 项目说明
└── package.json          # 项目配置
```

## 注意事项

1. **API限制**：MiniMax Coding Plan有使用限制，请合理使用
2. **图片大小**：支持最大20MB的图片文件
3. **网络要求**：需要稳定的网络连接访问MiniMax API
4. **隐私安全**：不要上传敏感或私人图片
5. **错误处理**：API调用失败时会返回详细错误信息

## 故障排除

### 常见问题

1. **MCP服务器连接失败**
   ```bash
   # 检查mcporter安装
   mcporter --version
   
   # 检查配置
   cat ~/.mcporter/config.json
   
   # 重新配置
   node scripts/setup-config.js --api-key "YOUR_API_KEY"
   ```

2. **API调用失败**
   ```bash
   # 检查API Key
   echo $MINIMAX_API_KEY
   
   # 测试网络连接
   curl https://api.minimaxi.com
   ```

3. **图片上传失败**
   - 检查图片格式（支持JPG、PNG、GIF、WebP）
   - 检查图片大小（最大20MB）
   - 检查文件权限

### 获取帮助

1. 查看详细日志：`node scripts/script.js --verbose`
2. 检查API响应：查看返回的错误信息
3. 联系支持：创建GitHub Issue

## 更新日志

### v1.0.0 (2026-03-09)
- 初始版本发布
- 支持图片理解和网络搜索
- 提供完整的配置和使用指南
- 包含Web界面和API服务器
- 支持OpenClaw集成

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如有问题，请：
1. 查看 [SKILL.md](SKILL.md) 文档
2. 检查 [常见问题](#故障排除)
3. 创建GitHub Issue
