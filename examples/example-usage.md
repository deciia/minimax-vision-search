# 使用示例

## 1. 验证码识别

### 场景描述
识别图片验证码中的文字或滑块位置。

### 命令示例
```bash
# 识别文字验证码
node scripts/analyze-image.js --image "captcha.png" --prompt "识别图片中的验证码文字"

# 识别滑块验证码
node scripts/analyze-image.js --image "slider-captcha.png" --prompt "识别滑块缺口的位置和距离"

# 输出JSON格式
node scripts/analyze-image.js --image "captcha.jpg" --prompt "提取验证码文字" --format json
```

### 预期输出
```
验证码文字: 8A3B
```

或
```
滑块缺口位置: 距离左侧120像素，距离顶部45像素
```

## 2. 网页截图分析

### 场景描述
分析网页截图中的关键信息。

### 命令示例
```bash
# 分析网页内容
node scripts/analyze-image.js --image "screenshot.png" --prompt "描述这个网页的主要内容"

# 提取特定信息
node scripts/analyze-image.js --image "product-page.png" --prompt "提取产品名称、价格和描述"

# 分析布局
node scripts/analyze-image.js --image "dashboard.png" --prompt "分析这个仪表板的布局和关键指标"
```

### 预期输出
```
这是一个电商产品页面，显示了一款智能手机。
产品名称: iPhone 15 Pro
价格: ¥8999
描述: 最新款iPhone，搭载A17 Pro芯片，钛金属边框...
页面布局: 顶部是导航栏，中间是产品图片和详情，底部是购买按钮和规格参数。
```

## 3. 实时信息搜索

### 场景描述
获取最新的新闻、技术信息或数据。

### 命令示例
```bash
# 搜索最新新闻
node scripts/web-search.js --query "今天的重要新闻" --count 5

# 技术问题搜索
node scripts/web-search.js --query "如何解决Node.js内存泄漏问题" --lang "zh-CN"

# 英文搜索
node scripts/web-search.js --query "latest developments in AI" --lang "en-US" --count 3

# 保存搜索结果
node scripts/web-search.js --query "OpenClaw配置指南" --save "openclaw-guide.txt"
```

### 预期输出
```
搜索结果 (5个):

1. 今日头条: AI技术突破...
   https://example.com/news/ai-breakthrough
   摘要: 研究人员宣布在AI领域取得重大突破...

2. 科技新闻: 新编程语言发布...
   https://example.com/tech/new-language
   摘要: 一种新的系统编程语言正式发布...

3. 技术教程: Node.js性能优化...
   https://example.com/tutorial/nodejs-optimization
   摘要: 本文介绍Node.js应用的性能优化技巧...
```

## 4. 技术文档检索

### 场景描述
查找技术文档、API参考或解决方案。

### 命令示例
```bash
# 搜索API文档
node scripts/web-search.js --query "OpenAI API使用指南" --count 3

# 查找错误解决方案
node scripts/web-search.js --query "解决'Module not found'错误" --lang "zh-CN"

# 搜索最佳实践
node scripts/web-search.js --query "React最佳实践2024" --count 5
```

## 5. 图片内容问答

### 场景描述
对图片内容进行问答式分析。

### 命令示例
```bash
# 问答式分析
node scripts/analyze-image.js --image "chart.png" --prompt "这张图表显示了什么趋势？最高值是多少？"

# 细节分析
node scripts/analyze-image.js --image "document.png" --prompt "提取文档中的公司名称、日期和金额"

# 场景理解
node scripts/analyze-image.js --image "scene.jpg" --prompt "描述这个场景，有哪些人物？他们在做什么？"
```

## 6. 批量处理

### 场景描述
批量处理多张图片或多个搜索。

### 命令示例
```bash
# 批量分析图片
for image in images/*.png; do
  node scripts/analyze-image.js --image "$image" --prompt "描述图片内容" --format json >> results.json
done

# 批量搜索
searches=("OpenClaw安装" "OpenClaw配置" "OpenClaw故障排除")
for query in "${searches[@]}"; do
  node scripts/web-search.js --query "$query" --count 2 --save "search-results.txt"
done
```

## 7. API服务器使用

### 启动API服务器
```bash
# 启动服务器
node scripts/start-api.js
# 或
cd api && npm start
```

### API调用示例

#### 健康检查
```bash
curl http://localhost:3000/api/status
```

#### 网络搜索
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "测试搜索", "count": 3, "language": "zh-CN"}'
```

#### 图片分析
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@test.png" \
  -F "prompt=描述这张图片" \
  -F "format=text"
```

## 8. OpenClaw集成示例

### 在OpenClaw中直接使用
```bash
# 搜索信息
exec node /path/to/minimax-vision-search/scripts/web-search.js --query "如何配置飞书机器人"

# 分析图片
exec node /path/to/minimax-vision-search/scripts/analyze-image.js --image "/tmp/screenshot.png" --prompt "识别验证码"
```

### 创建OpenClaw别名
在OpenClaw配置中添加：
```bash
alias mm-search="node /path/to/minimax-vision-search/scripts/web-search.js"
alias mm-vision="node /path/to/minimax-vision-search/scripts/analyze-image.js"
```

然后可以直接使用：
```bash
mm-search --query "最新技术新闻"
mm-vision --image "captcha.png" --prompt "识别验证码"
```

## 9. 实际应用场景

### 场景1: 自动化测试
```bash
# 1. 截取验证码图片
# 2. 识别验证码
node scripts/analyze-image.js --image "captcha.png" --prompt "提取验证码文字"
# 3. 自动填写验证码
```

### 场景2: 内容监控
```bash
# 1. 定期截取网页
# 2. 分析内容变化
node scripts/analyze-image.js --image "website-screenshot.png" --prompt "页面内容是否有更新？"
# 3. 发送通知
```

### 场景3: 研究辅助
```bash
# 1. 搜索相关资料
node scripts/web-search.js --query "深度学习模型压缩技术" --count 10
# 2. 分析搜索结果
# 3. 生成研究报告
```

## 注意事项

1. **API限制**: 注意MiniMax API的调用频率限制
2. **图片质量**: 高质量图片获得更准确的分析结果
3. **提示词优化**: 清晰的提示词能获得更好的分析结果
4. **错误处理**: 所有命令都包含错误处理和重试机制
5. **隐私保护**: 不要上传包含敏感信息的图片
