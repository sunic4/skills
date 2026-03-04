import * as fs from 'fs';
import * as path from 'path';

interface InitOptions {
  token?: string;
}

export async function initConfig(options: InitOptions): Promise<void> {
  const baseDir = path.resolve(process.cwd(), '.apifox');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`创建目录: ${baseDir}`);
  }

  const envFile = path.join(baseDir, '.env');
  const mapFile = path.join(baseDir, 'guidelines‌.md');

  let token = options.token;
  if (!token) {
    console.log('\n请在下方输入你的 Apifox 访问令牌:');
    console.log('(访问令牌获取方式: Apifox -> 个人设置 -> 开放 API -> 创建访问令牌)\n');
  }

  if (!fs.existsSync(envFile)) {
    const envContent = token 
      ? `# Apifox 访问令牌\nAPIFOX_TOKEN=${token}\n`
      : `# Apifox 访问令牌\nAPIFOX_TOKEN=\n`;
    fs.writeFileSync(envFile, envContent, 'utf-8');
    console.log(`创建配置文件: ${envFile}`);
  } else {
    console.log(`配置文件已存在: ${envFile}`);
  }

  if (!fs.existsSync(mapFile)) {
    const mapContent = `# Apifox 项目概览\n\n`;
    fs.writeFileSync(mapFile, mapContent, 'utf-8');
    console.log(`创建项目概览: ${mapFile}`);
  } else {
    console.log(`项目概览已存在: ${mapFile}`);
  }

  console.log('\n初始化完成！');
  console.log('\n使用方法:');
  console.log('  apifox list-projects              # 列出所有项目');
  console.log('  apifox sync -p <项目ID> # 同步项目');
  console.log('  apifox import-openapi -p <项目ID> # 导入项目');
}
