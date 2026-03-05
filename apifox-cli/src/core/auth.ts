import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as http from 'http';
import { exec } from 'child_process';

const ENV_PATH = path.join(os.homedir(), '.apifox', '.env');
const TOKEN_KEY = 'APIFOX_TOKEN';
const DEFAULT_PORT = 7890;

export function getToken(): string | null {
  const dir = path.dirname(ENV_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(ENV_PATH)) {
    return null;
  }
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = content.match(new RegExp(`^${TOKEN_KEY}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

export function saveToken(token: string): void {
  const dir = path.dirname(ENV_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const content = `${TOKEN_KEY}=${token}\n`;
  fs.writeFileSync(ENV_PATH, content, 'utf-8');
}

function openBrowser(url: string): void {
  const warnManualOpen = (): void => {
    console.warn(`Failed to open browser automatically. Please open ${url} manually.`);
  };

  const handleOpenResult = (error: Error | null): void => {
    if (error) {
      warnManualOpen();
    }
  };

  try {
    let command = '';
    if (process.platform === 'win32') {
      command = `start "" "${url}"`;
    } else if (process.platform === 'darwin') {
      command = `open "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }
    const child = exec(command, handleOpenResult);
    child.on('error', warnManualOpen);
  } catch {
    warnManualOpen();
  }
}

const HTML_FORM = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apifox Token 配置</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 100%; max-width: 420px; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #333; }
    p { color: #666; margin-bottom: 24px; font-size: 14px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
    input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: border-color 0.3s; }
    input:focus { outline: none; border-color: #667eea; }
    button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); }
    .tips { margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 12px; color: #666; }
    .tips a { color: #667eea; text-decoration: none; }
    .success { display: none; text-align: center; }
    .success h2 { color: #52c41a; margin-bottom: 12px; }
    .error { display: none; color: #ff4d4f; margin-top: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div id="formView">
      <h1>Apifox Token 配置</h1>
      <p>请输入您的 Apifox API Token</p>
      <form id="tokenForm">
        <div class="form-group">
          <label for="token">Token</label>
          <input type="text" id="token" name="token" placeholder="请输入 Token" required autocomplete="off">
        </div>
        <button type="submit">保存 Token</button>
      </form>
      <div class="error" id="error"></div>
      <div class="tips">
        获取 Token: <a href="https://app.apifox.com/profile" target="_blank">https://app.apifox.com/profile</a>
      </div>
    </div>
    <div id="successView" class="success">
      <h2>✓ Token 保存成功</h2>
      <p>请关闭此页面，命令行将自动继续...</p>
    </div>
  </div>
  <script>
    const form = document.getElementById('tokenForm');
    const errorDiv = document.getElementById('error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('token').value.trim();
      if (!token) {
        errorDiv.textContent = '请输入 Token';
        errorDiv.style.display = 'block';
        return;
      }
      try {
        const res = await fetch('/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('formView').style.display = 'none';
          document.getElementById('successView').style.display = 'block';
          setTimeout(() => window.close(), 2000);
        } else {
          errorDiv.textContent = data.message || '保存失败';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = '请求失败，请重试';
        errorDiv.style.display = 'block';
      }
    });
  </script>
</body>
</html>
`;

export async function ensureToken(): Promise<string> {
  let token = getToken();
  if (token) {
    return token;
  }
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_FORM);
      } else if (req.method === 'POST' && req.url === '/save') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { token } = JSON.parse(body);
            if (token) {
              saveToken(token);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Token 不能为空' }));
            }
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '请求解析失败' }));
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(DEFAULT_PORT, () => {
      console.log(`\n请在浏览器中输入 Token: http://localhost:${DEFAULT_PORT}\n`);
      openBrowser(`http://localhost:${DEFAULT_PORT}`);
    });

    const checkInterval = setInterval(() => {
      const currentToken = getToken();
      if (currentToken) {
        clearInterval(checkInterval);
        server.close(() => {
          console.log('✓ Token 获取成功\n');
          resolve(currentToken);
        });
      }
    }, 1000);

    server.on('error', (err) => {
      clearInterval(checkInterval);
      reject(err);
    });
  });
}
