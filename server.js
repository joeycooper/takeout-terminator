const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'menus.json');

// 初始菜单库
const initialMenus = {
    all: ["🍔 汉堡薯条", "🍜 兰州拉面", "🍱 精致日料", "🍛 咖喱饭", "🥘 麻辣烫", "🍗 韩式炸鸡", "🥗 健康沙拉", "🍝 意式面点", "🥡 广式点心", "🍢 东北烧烤", "🍲 暖心小火锅", "🍣 旋转寿司", "🥡 经典炒饭", "🥙 土耳其烤肉", "🍲 老鸭粉丝汤", "🍚 煲仔饭", "🥟 东北大水饺", "🥘 冒菜", "🍝 意式肉酱面", "🍗 麦乐鸡块", "🌮 塔可", "🍳 番茄炒蛋饭", "🍲 重庆酸菜鱼", "🥩 菲力牛排", "🍜 岐山臊子面", "🍱 鳗鱼饭", "🍥 广式烧腊", "🍲 淮扬狮子头", "🥪 赛百味", "🥤 冰雪皇后", "☕️ 星巴克", "🥯 贝果", "🥣 皮蛋瘦肉粥", "🥘 湘式小炒肉", "🥢 杭州小笼包", "🍜 片儿川", "🥬 荷塘小炒", "🍲 西湖牛肉羹"],
    fit: ["🥗 鸡胸肉沙拉", "🥣 低脂燕麦", "🍣 刺身拼盘", "🥪 全麦三明治", "🍵 纯净果蔬汁", "🍲 清蒸鱼片", "🥩 瘦牛肉", "🥦 蒸西蓝花", "🥚 煮鸡蛋", "🥣 无糖希腊酸奶", "🍠 蒸地瓜", "🌽 煮玉米"],
    night: ["🍢 狂野烧烤", "🥘 劲爆小龙虾", "🍗 炸鸡啤酒", "🍜 螺蛳粉", "🍟 大份薯条", "🥨 脆皮五花肉", "🥘 重庆火锅", "🍢 铁板大鱿鱼", "🍲 潮汕砂锅粥", "🌭 芝士热狗", "🥟 煎饺", "🍻 冰镇扎啤"]
};

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialMenus, null, 2));
}

const server = http.createServer((req, res) => {
    // 跨域设置
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/menus' && req.method === 'GET') {
        const data = fs.readFileSync(DATA_FILE);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    } else if (req.url === '/api/menus' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newMenus = JSON.parse(body);
                fs.writeFileSync(DATA_FILE, JSON.stringify(newMenus, null, 2));
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
    console.log(`Backend server running at http://localhost:${PORT}`);
});
