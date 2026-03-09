#!/usr/bin/env node
/**
 * MiniMax Vision & Search - 配置脚本
 * 
 * 自动配置MiniMax MCP服务器
 * 
 * 使用方式:
 *   node scripts/setup-config.js --api-key "your-api-key"
 *   node scripts/setup-config.js --help
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 解析命令行参数
const args = process.argv.slice(2);
let apiKey = null;
let apiHost = 'https://api.minimaxi.com';
let configPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--api-key' || args[i] === '-k') {
    apiKey = args[i + 1];
    i++;
  } else if (args[i] === '--api-host' || args[i] === '-h') {
    apiHost = args[i + 1];
    i++;
  } else if (args[i] === '--config' || args[i] === '-c') {
    configPath = args[i + 1];
    i++;
  } else if (args[i] === '--help') {
    console.log(`
MiniMax Vision & Search - 配置工具

用法:
  node setup-config.js [选项]

选项:
  -k, --api-key <密钥>    MiniMax Coding Plan API Key（必需）
  -h, --api-host <主机>   API主机地址（默认：https://api.minimaxi.com）
  -c, --config <路径>     配置文件路径（默认：~/.mcporter/config.json）
  --help                  显示帮助

示例:
  node setup-config.js --api-key "sk-cp-xxxxxxxxxxxxxxxx"
  node setup-config.js --api-key "sk-cp-xxxxxxxx" --config "C:\\Users\\YourName\\.mcporter\\config.json"

注意:
  1. 需要先安装 mcporter: npm install -g @modelcontextprotocol/mcporter
  2. API Key可以从 https://platform.minimaxi.com/subscribe/coding-plan 获取
  3. 配置完成后需要重启OpenClaw或重新加载MCP服务器
`);
    process.exit(0);
  }
}

// 验证参数
if (!apiKey) {
  console.error('错误：必须提供API Key');
  console.error('使用 --api-key "your-api-key"');
  console.error('或从 https://platform.minimaxi.com/subscribe/coding-plan 获取');
  process.exit(1);
}

// 确定配置文件路径
if (!configPath) {
  const homeDir = os.homedir();
  configPath = path.join(homeDir, '.mcporter', 'config.json');
}

// 创建配置目录
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log(`创建配置目录: ${configDir}`);
}

// 读取现有配置或创建新配置
let config = {};
if (fs.existsSync(configPath)) {
  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
    console.log(`读取现有配置文件: ${configPath}`);
  } catch (error) {
    console.error(`读取配置文件失败: ${error.message}`);
    console.log('创建新的配置文件...');
  }
}

// 更新MCP服务器配置
config.mcpServers = config.mcpServers || {};
config.mcpServers['minimax-coding-plan'] = {
  command: 'uvx',
  args: ['minimax-coding-plan-mcp', '-y'],
  env: {
    MINIMAX_API_KEY: apiKey,
    MINIMAX_API_HOST: apiHost
  }
};

// 写入配置文件
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`配置文件已更新: ${configPath}`);
  console.log('\n配置内容:');
  console.log(JSON.stringify(config.mcpServers['minimax-coding-plan'], null, 2));
} catch (error) {
  console.error(`写入配置文件失败: ${error.message}`);
  process.exit(1);
}

// 验证配置
console.log('\n验证配置...');
try {
  // 检查mcporter是否可用
  const { execSync } = require('child_process');
  const mcporterVersion = execSync('mcporter --version', { encoding: 'utf-8' }).trim();
  console.log(`✓ mcporter 版本: ${mcporterVersion}`);
  
  // 列出MCP服务器
  console.log('\n列出MCP服务器:');
  const listOutput = execSync('mcporter list', { encoding: 'utf-8' });
  console.log(listOutput);
  
  console.log('\n✅ 配置完成！');
  console.log('\n下一步:');
  console.log('1. 测试图片理解功能:');
  console.log('   node scripts/analyze-image.js --image "path/to/test.png" --prompt "描述图片"');
  console.log('\n2. 测试网络搜索功能:');
  console.log('   node scripts/web-search.js --query "测试搜索"');
  console.log('\n3. 如果遇到问题，检查:');
  console.log('   - API Key是否正确');
  console.log('   - 网络连接是否正常');
  console.log('   - mcporter是否已正确安装');
  
} catch (error) {
  console.error('\n⚠️ 配置验证失败:');
  console.error('错误信息:', error.message);
  
  if (error.stderr) {
    console.error('详细错误:', error.stderr.toString());
  }
  
  console.log('\n请检查:');
  console.log('1. 是否安装了 mcporter: npm install -g @modelcontextprotocol/mcporter');
  console.log('2. API Key是否正确有效');
  console.log('3. 网络连接是否正常');
}
