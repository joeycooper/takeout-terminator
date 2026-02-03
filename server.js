const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'db');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// 默认菜单
const defaultMenus = {
    all: ["🍔 汉堡薯条", "🍜 兰州拉面", "🍱 精致日料", "🍛 咖喱饭", "🥘 麻辣烫", "🍗 韩式炸鸡", "🥗 健康沙拉", "🍝 意式面点", "🥡 广式点心", "🍢 东北烧烤", "🍲 暖心小火锅", "🍚 煲仔饭", "🥟 杭州小笼包", "🍜 片儿川", "🍲 西湖牛肉羹"],
    fit: ["🥗 鸡胸肉沙拉", "🥣 低脂燕麦", "🍣 刺身拼盘", "🥪 全麦三明治", "🍵 纯净果蔬汁", "🍲 清蒸鱼片"],
    night: ["🍢 狂野烧烤", "🥘 劲爆小龙虾", "🍗 炸鸡啤酒", "🍜 螺蛳粉", "🍟 大份薯条", "🥨 脆皮五花肉"]
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id, X-User-Code');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const userName = req.headers['x-user-id'] || 'default';
    const userCode = req.headers['x-user-code'] || '';
    
    // 访客直接返回默认
    if (userName === 'default' || userName.startsWith('guest_')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(defaultMenus));
        return;
    }

    const userFile = path.join(DATA_DIR, `${userName}.json`);

    if (req.url === '/api/menus' && req.method === 'GET') {
        if (!fs.existsSync(userFile)) {
            // 用户不存在，返回默认
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(defaultMenus));
            return;
        }

        const userData = JSON.parse(fs.readFileSync(userFile));
        if (userData.idCode !== userCode) {
            res.writeHead(403);
            res.end(JSON.stringify({ error: '身份校验失败，请检查ID码' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userData.menus));
    } else if (req.url === '/api/menus' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newMenus = JSON.parse(body);
                
                if (fs.existsSync(userFile)) {
                    const existingData = JSON.parse(fs.readFileSync(userFile));
                    if (existingData.idCode !== userCode) {
                        res.writeHead(403);
                        res.end(JSON.stringify({ error: '身份校验失败，该代号已被占用且ID码不符' }));
                        return;
                    }
                }

                const userData = {
                    idCode: userCode,
                    menus: newMenus,
                    updatedAt: new Date().toISOString()
                };

                fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
            } catch (e) {
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Secure Multi-user Terminator Backend at http://localhost:${PORT}`);
});
