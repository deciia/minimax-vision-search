#!/usr/bin/env node
/**
 * MiniMax Vision & Search - API服务器启动脚本
 * 
 * 启动Web界面和API服务器
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 检查依赖
function checkDependencies() {
  console.log('🔍 检查依赖...');
  
  const dependencies = {
    'express': false,
    'cors': false,
    'multer': false
  };
  
  let allInstalled = true;
  
  for (const dep of Object.keys(dependencies)) {
    try {
      require.resolve(dep);
      dependencies[dep] = true;
      console.log(`  ✅ ${dep}`);
    } catch (e) {
      console.log(`  ❌ ${dep} (未安装)`);
      allInstalled = false;
    }
  }
  
  return allInstalled;
}

// 安装依赖
function installDependencies() {
  console.log('📦 安装依赖...');
  
  try {
    const apiDir = path.join(__dirname, '../api');
    process.chdir(apiDir);
    
    console.log('  安装 express, cors, multer...');
    execSync('npm init -y', { stdio: 'inherit' });
    execSync('npm install express cors multer', { stdio: 'inherit' });
    
    console.log('✅ 依赖安装完成');
    return true;
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    return false;
  }
}

// 启动服务器
function startServer() {
  console.log('🚀 启动API服务器...');
  
  const serverPath = path.join(__dirname, '../api/server.js');
  
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ 服务器文件不存在: ${serverPath}`);
    return null;
  }
  
  try {
    const server = spawn('node', [serverPath], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: process.env.PORT || '3000' }
    });
    
    server.on('error', (error) => {
      console.error('❌ 服务器启动失败:', error.message);
    });
    
    server.on('close', (code) => {
      console.log(`服务器已退出，代码: ${code}`);
    });
    
    return server;
  } catch (error) {
    console.error('❌ 启动服务器失败:', error.message);
    return null;
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
🦞 MiniMax Vision & Search - API服务器管理

用法:
  node start-api.js [选项]

选项:
  start     启动API服务器 (默认)
  stop      停止API服务器
  status    检查服务器状态
  install   安装依赖
  help      显示帮助

示例:
  node start-api.js start
  node start-api.js install
  node start-api.js status

环境变量:
  PORT=3000  设置服务器端口 (默认: 3000)

功能:
  - Web界面: http://localhost:3000
  - API接口: http://localhost:3000/api
  - 图片分析: 支持上传和分析图片
  - 网络搜索: 实时信息检索
  - 批量处理: 支持批量操作
`);
}

// 检查服务器状态
function checkServerStatus() {
  const port = process.env.PORT || '3000';
  
  console.log(`📡 检查服务器状态 (端口: ${port})...`);
  
  try {
    // 尝试连接服务器
    execSync(`curl -s http://localhost:${port}/api/status`, { 
      encoding: 'utf-8',
      timeout: 3000 
    });
    
    console.log(`✅ 服务器正在运行: http://localhost:${port}`);
    return true;
  } catch (error) {
    console.log(`❌ 服务器未运行或无法连接`);
    return false;
  }
}

// 停止服务器
function stopServer() {
  console.log('🛑 停止服务器...');
  
  const port = process.env.PORT || '3000';
  
  try {
    // 在Windows上查找并杀死进程
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const lines = result.trim().split('\n');
      
      for (const line of lines) {
        const match = line.match(/\s+(\d+)$/);
        if (match) {
          const pid = match[1];
          console.log(`  找到进程 PID: ${pid}`);
          try {
            execSync(`taskkill /F /PID ${pid}`);
            console.log(`  ✅ 已终止进程: ${pid}`);
          } catch (e) {
            console.log(`  ⚠️ 无法终止进程: ${pid} (${e.message})`);
          }
        }
      }
    } else {
      // 在Linux/macOS上
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'inherit' });
    }
    
    console.log('✅ 服务器已停止');
    return true;
  } catch (error) {
    console.log('⚠️ 停止服务器时出错:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  
  console.log(`
========================================
🦞 MiniMax Vision & Search API服务器
========================================
`);
  
  switch (command) {
    case 'start':
      // 检查依赖
      if (!checkDependencies()) {
        console.log('\n⚠️  缺少依赖，正在安装...');
        if (!installDependencies()) {
          console.log('\n❌ 无法启动服务器，依赖安装失败');
          process.exit(1);
        }
      }
      
      // 检查端口是否被占用
      if (checkServerStatus()) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('服务器已在运行，是否重启？(y/N): ', (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'y') {
            stopServer();
            setTimeout(() => {
              startServer();
            }, 1000);
          } else {
            console.log('保持现有服务器运行');
          }
        });
      } else {
        startServer();
      }
      break;
      
    case 'stop':
      stopServer();
      break;
      
    case 'status':
      checkServerStatus();
      break;
      
    case 'install':
      installDependencies();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.log(`❌ 未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n\n收到退出信号，正在清理...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n收到终止信号，正在清理...');
  process.exit(0);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

module.exports = {
  checkDependencies,
  installDependencies,
  startServer,
  stopServer,
  checkServerStatus
};