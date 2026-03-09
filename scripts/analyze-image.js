#!/usr/bin/env node
/**
 * MiniMax Vision & Search - 图片分析脚本
 * 
 * 使用MiniMax MCP的图片理解功能分析图片内容
 * 
 * 使用方式:
 *   node scripts/analyze-image.js --image /path/to/image.png
 *   node scripts/analyze-image.js --image https://example.com/image.jpg --prompt "描述图片内容"
 *   node scripts/analyze-image.js --help
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 解析命令行参数
const args = process.argv.slice(2);
let prompt = '请描述这张图片的内容';
let imagePath = null;
let outputFormat = 'text';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--prompt' || args[i] === '-p') {
    prompt = args[i + 1];
    i++;
  } else if (args[i] === '--image' || args[i] === '-i') {
    imagePath = args[i + 1];
    i++;
  } else if (args[i] === '--url' || args[i] === '-u') {
    imagePath = args[i + 1];
    i++;
  } else if (args[i] === '--format' || args[i] === '-f') {
    outputFormat = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
MiniMax Vision & Search - 图片分析工具

用法:
  node analyze-image.js [选项]

选项:
  -p, --prompt <文本>    分析提示（默认："请描述这张图片的内容"）
  -i, --image <路径>     本地图片路径
  -u, --url <URL>        网络图片URL
  -f, --format <格式>    输出格式：text, json, markdown（默认：text）
  -h, --help             显示帮助

示例:
  node analyze-image.js --image "C:\\temp\\captcha.png" --prompt "识别滑块位置"
  node analyze-image.js --url "https://example.com/image.jpg" --prompt "提取文字"
  node analyze-image.js --image screenshot.png --format json

支持功能:
  1. 验证码识别（滑块、文字验证码）
  2. 文字提取
  3. 物体识别
  4. 场景分析
  5. 视觉问答
`);
    process.exit(0);
  }
}

// 验证参数
if (!imagePath) {
  console.error('错误：必须指定图片路径或URL');
  console.error('使用 --image <路径> 或 --url <URL>');
  process.exit(1);
}

// 检查图片是否存在（如果是本地文件）
if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://')) {
  if (!fs.existsSync(imagePath)) {
    console.error(`错误：图片文件不存在: ${imagePath}`);
    process.exit(1);
  }
  
  // 检查文件大小（最大20MB）
  const stats = fs.statSync(imagePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  if (fileSizeMB > 20) {
    console.error(`错误：图片文件过大 (${fileSizeMB.toFixed(2)}MB)，最大支持20MB`);
    process.exit(1);
  }
  
  // 检查文件类型
  const ext = path.extname(imagePath).toLowerCase();
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (!supportedFormats.includes(ext)) {
    console.error(`错误：不支持的图片格式: ${ext}`);
    console.error(`支持格式: ${supportedFormats.join(', ')}`);
    process.exit(1);
  }
}

console.log('正在调用MiniMax图片理解...');
console.log(`图片: ${imagePath}`);
console.log(`提示: ${prompt}`);
console.log(`输出格式: ${outputFormat}`);

try {
  // 构建mcporter命令
  const cmd = `mcporter call minimax-coding-plan.understand_image prompt="${prompt.replace(/"/g, '\\"')}" image_source="${imagePath.replace(/"/g, '\\"')}"`;
  
  console.log('\n执行命令:', cmd);
  
  // 执行命令
  const result = execSync(cmd, { 
    encoding: 'utf-8', 
    timeout: 60000, // 60秒超时
    stdio: ['pipe', 'pipe', 'pipe'] // 捕获stderr
  });
  
  // 解析结果
  let parsedResult;
  try {
    parsedResult = JSON.parse(result);
  } catch (e) {
    // 如果不是JSON，直接使用文本
    parsedResult = { content: result };
  }
  
  // 格式化输出
  console.log('\n' + '='.repeat(50));
  console.log('图片分析结果');
  console.log('='.repeat(50));
  
  if (outputFormat === 'json') {
    console.log(JSON.stringify(parsedResult, null, 2));
  } else if (outputFormat === 'markdown') {
    console.log('## 图片分析结果\n');
    console.log('**图片**: ' + imagePath + '\n');
    console.log('**提示**: ' + prompt + '\n');
    console.log('**分析结果**:\n');
    console.log(parsedResult.content || parsedResult);
  } else {
    // 文本格式
    console.log('图片: ' + imagePath);
    console.log('提示: ' + prompt);
    console.log('\n分析结果:');
    console.log('-'.repeat(40));
    console.log(parsedResult.content || parsedResult);
    console.log('-'.repeat(40));
  }
  
  // 保存结果到文件
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(os.tmpdir(), `minimax-analysis-${timestamp}.txt`);
  
  let fileContent;
  if (outputFormat === 'json') {
    fileContent = JSON.stringify(parsedResult, null, 2);
  } else {
    fileContent = `图片分析结果
时间: ${new Date().toLocaleString()}
图片: ${imagePath}
提示: ${prompt}

分析结果:
${parsedResult.content || parsedResult}`;
  }
  
  fs.writeFileSync(outputFile, fileContent, 'utf-8');
  console.log(`\n结果已保存到: ${outputFile}`);
  
} catch (error) {
  console.error('\n分析失败:');
  console.error('错误信息:', error.message);
  
  if (error.stderr) {
    console.error('详细错误:', error.stderr.toString());
  }
  
  // 检查常见错误
  if (error.message.includes('ENOENT') || error.message.includes('找不到')) {
    console.error('\n可能的原因:');
    console.error('1. mcporter 未安装或未在PATH中');
    console.error('2. MiniMax MCP服务器未配置');
    console.error('3. API Key无效或过期');
  }
  
  process.exit(1);
}
