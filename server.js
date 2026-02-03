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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const userId = req.headers['x-user-id'] || 'default';
    const userFile = path.join(DATA_DIR, `${userId}.json`);

    if (req.url === '/api/menus' && req.method === 'GET') {
        let data = defaultMenus;
        if (fs.existsSync(userFile)) {
            data = JSON.parse(fs.readFileSync(userFile));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    } else if (req.url === '/api/menus' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newMenus = JSON.parse(body);
                fs.writeFileSync(userFile, JSON.stringify(newMenus, null, 2));
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
    console.log(`Terminator Backend with multi-user support at http://localhost:${PORT}`);
});
