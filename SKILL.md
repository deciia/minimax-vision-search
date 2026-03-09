---
name: minimax-vision-search
description: 使用MiniMax MCP的图片理解和网络搜索能力，提供强大的视觉分析和信息检索功能。适用于图片内容分析、验证码识别、网页截图分析、实时信息搜索等场景。
---

# MiniMax Vision & Search Skill

使用MiniMax MCP的图片理解（understand_image）和网络搜索（web_search）能力，为OpenClaw提供强大的视觉分析和信息检索功能。

## 功能特性

### 1. 图片理解功能
- **验证码识别**：自动识别图片中的验证码、滑块位置
- **文字提取**：从图片中提取文字内容
- **内容分析**：描述图片内容、识别物体、分析场景
- **视觉问答**：回答关于图片的特定问题

### 2. 网络搜索功能
- **实时搜索**：获取最新信息、新闻、数据
- **知识检索**：查找技术文档、教程、解决方案
- **信息验证**：验证事实、查找参考资料
- **多语言搜索**：支持中文和英文搜索

## 快速开始

### 前置条件
1. 确保已安装 `mcporter` CLI 工具
2. 配置MiniMax MCP服务器（见下方配置指南）
3. 获取Coding Plan API Key

### 基础使用

#### 图片理解示例
```bash
# 识别图片内容
node scripts/analyze-image.js --image "path/to/image.png" --prompt "描述这张图片的内容"

# 识别验证码
node scripts/analyze-image.js --image "path/to/captcha.png" --prompt "识别滑块位置和缺口距离"

# 提取文字
node scripts/analyze-image.js --image "path/to/screenshot.png" --prompt "提取图片中的所有文字"
```

#### 网络搜索示例
```bash
# 搜索最新信息
node scripts/web-search.js --query "OpenClaw最新版本特性"

# 技术问题搜索
node scripts/web-search.js --query "如何配置OpenClaw飞书机器人" --count 5

# 多语言搜索
node scripts/web-search.js --query "最新AI技术发展" --lang "zh-CN"
```

## 配置指南

### 1. 配置MiniMax MCP服务器

创建配置文件 `~/.mcporter/config.json`：

```json
{
  "servers": {
    "minimax-coding-plan": {
      "command": "uvx",
      "args": ["minimax-coding-plan-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "YOUR_API_KEY_HERE",
        "MINIMAX_API_HOST": "https://api.minimaxi.com"
      }
    }
  }
}
```

### 2. 使用配置脚本（推荐）

```bash
# 运行配置脚本
node scripts/setup-config.js --api-key "YOUR_API_KEY_HERE"

# 或者手动指定配置路径
node scripts/setup-config.js --api-key "YOUR_API_KEY_HERE" --config "C:\\Users\\YourName\\.mcporter\\config.json"
```

### 3. 验证配置

```bash
# 测试MCP服务器连接
mcporter list

# 测试图片理解功能
mcporter call minimax-coding-plan.understand_image prompt="测试连接" image_source="https://example.com/test.jpg"

# 测试网络搜索功能
mcporter call minimax-coding-plan.web_search query="测试搜索"
```

## 典型使用场景

### 场景1：验证码自动识别
1. 使用浏览器截图获取验证码图片
2. 调用图片理解分析滑块位置或文字
3. 根据分析结果自动操作

### 场景2：网页内容分析
1. 截取网页截图
2. 分析截图中的关键信息
3. 提取文字内容或识别特定元素

### 场景3：实时信息检索
1. 用户提问需要最新信息
2. 调用网络搜索获取实时结果
3. 整合搜索结果提供答案

### 场景4：技术问题解决
1. 遇到编程或配置问题
2. 搜索相关技术文档和解决方案
3. 提供具体的解决步骤

## 脚本说明

### analyze-image.js
图片分析脚本，支持：
- 本地图片文件分析
- 网络图片URL分析
- 自定义提示词
- 多种输出格式

### web-search.js
网络搜索脚本，支持：
- 关键词搜索
- 结果数量控制
- 多语言支持
- 搜索结果格式化

### setup-config.js
配置脚本，支持：
- 自动创建配置文件
- API Key配置
- 配置验证

### start-api.js
启动本地API服务器，支持：
- Web界面访问
- 图片上传和分析
- RESTful API接口

## 注意事项

1. **API Key安全**：妥善保管API Key，不要公开分享
2. **图片大小**：支持最大20MB的图片文件
3. **网络连接**：需要稳定的网络连接访问MiniMax API
4. **使用限制**：遵守Coding Plan的使用条款和限制

## 依赖

- `mcporter` >= 0.7.0
- `uvx` (通过`mcporter`自动管理)
- MiniMax Coding Plan API Key

## 安装依赖

```bash
# 进入api目录
cd api

# 安装Node.js依赖
npm install

# 全局安装mcporter
npm install -g @modelcontextprotocol/mcporter
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持图片理解和网络搜索
- 提供完整的配置和使用指南
- 包含Web界面和API服务器
