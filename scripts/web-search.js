#!/usr/bin/env node
/**
 * MiniMax Vision & Search - 网络搜索脚本
 * 
 * 使用MiniMax MCP的网络搜索功能获取实时信息
 * 
 * 使用方式:
 *   node scripts/web-search.js --query "搜索关键词"
 *   node scripts/web-search.js --query "技术问题" --count 5 --lang zh-CN
 *   node scripts/web-search.js --help
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 解析命令行参数
const args = process.argv.slice(2);
let query = null;
let count = 10;
let lang = 'zh-CN';
let outputFormat = 'text';
let saveResults = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--query' || args[i] === '-q') {
    query = args[i + 1];
    i++;
  } else if (args[i] === '--count' || args[i] === '-c') {
    count = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--lang' || args[i] === '-l') {
    lang = args[i + 1];
    i++;
  } else if (args[i] === '--format' || args[i] === '-f') {
    outputFormat = args[i + 1];
    i++;
  } else if (args[i] === '--no-save') {
    saveResults = false;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
MiniMax Vision & Search - 网络搜索工具

用法:
  node web-search.js [选项]

选项:
  -q, --query <关键词>   搜索查询词（必需）
  -c, --count <数量>     返回结果数量（1-10，默认：10）
  -l, --lang <语言>      搜索语言（默认：zh-CN）
  -f, --format <格式>    输出格式：text, json, markdown（默认：text）
  --no-save             不保存结果到文件
  -h, --help            显示帮助

示例:
  node web-search.js --query "OpenClaw最新版本"
  node web-search.js --query "如何配置飞书机器人" --count 5
  node web-search.js --query "latest AI developments" --lang en-US --format json

搜索类型:
  1. 技术文档和教程
  2. 新闻和实时信息
  3. 问题解决方案
  4. 产品信息和评测
  5. 学术资料和研究
`);
    process.exit(0);
  }
}

// 验证参数
if (!query) {
  console.error('错误：必须指定搜索查询词');
  console.error('使用 --query "搜索关键词"');
  process.exit(1);
}

if (count < 1 || count > 10) {
  console.error('错误：结果数量必须在1-10之间');
  process.exit(1);
}

console.log('正在调用MiniMax网络搜索...');
console.log(`查询: ${query}`);
console.log(`数量: ${count} 条结果`);
console.log(`语言: ${lang}`);
console.log(`输出格式: ${outputFormat}`);

try {
  // 构建mcporter命令
  const cmd = `mcporter call minimax-coding-plan.web_search query="${query.replace(/"/g, '\\"')}"`;
  
  console.log('\n执行命令:', cmd);
  
  // 执行命令
  const result = execSync(cmd, { 
    encoding: 'utf-8', 
    timeout: 30000, // 30秒超时
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
  console.log('\n' + '='.repeat(60));
  console.log('网络搜索结果');
  console.log('='.repeat(60));
  
  if (outputFormat === 'json') {
    console.log(JSON.stringify(parsedResult, null, 2));
  } else if (outputFormat === 'markdown') {
    console.log('## 网络搜索结果\n');
    console.log('**查询**: ' + query + '\n');
    console.log('**时间**: ' + new Date().toLocaleString() + '\n');
    console.log('**结果**:\n');
    
    if (parsedResult.content && typeof parsedResult.content === 'string') {
      console.log(parsedResult.content);
    } else if (parsedResult.results && Array.isArray(parsedResult.results)) {
      parsedResult.results.slice(0, count).forEach((item, index) => {
        console.log(`### ${index + 1}. ${item.title || '无标题'}`);
        console.log(`**链接**: ${item.url || '无链接'}`);
        console.log(`**摘要**: ${item.snippet || '无摘要'}`);
        console.log();
      });
    } else {
      console.log(parsedResult);
    }
  } else {
    // 文本格式
    console.log('查询: ' + query);
    console.log('时间: ' + new Date().toLocaleString());
    console.log('\n搜索结果:');
    console.log('-'.repeat(60));
    
    if (parsedResult.content && typeof parsedResult.content === 'string') {
      console.log(parsedResult.content);
    } else if (parsedResult.results && Array.isArray(parsedResult.results)) {
      const results = parsedResult.results.slice(0, count);
      results.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title || '无标题'}`);
        console.log(`   链接: ${item.url || '无链接'}`);
        console.log(`   摘要: ${item.snippet || '无摘要'}`);
      });
      
      if (results.length === 0) {
        console.log('未找到相关结果');
      }
    } else {
      console.log(parsedResult);
    }
    
    console.log('-'.repeat(60));
  }
  
  // 保存结果到文件
  if (saveResults) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeQuery = query.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    const outputFile = path.join(os.tmpdir(), `minimax-search-${safeQuery}-${timestamp}.txt`);
    
    let fileContent;
    if (outputFormat === 'json') {
      fileContent = JSON.stringify(parsedResult, null, 2);
    } else {
      fileContent = `网络搜索结果
时间: ${new Date().toLocaleString()}
查询: ${query}
语言: ${lang}
数量: ${count}

搜索结果:
${JSON.stringify(parsedResult, null, 2)}`;
    }
    
    fs.writeFileSync(outputFile, fileContent, 'utf-8');
    console.log(`\n结果已保存到: ${outputFile}`);
  }
  
} catch (error) {
  console.error('\n搜索失败:');
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
    console.error('4. 网络连接问题');
  }
  
  process.exit(1);
}
