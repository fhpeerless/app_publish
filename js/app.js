// AES加密解密工具类
class AESUtils {
    constructor(key, iv) {
        this.key = this.hexToBytes(CryptoJS.SHA256(key).toString().substring(0, 32));
        this.iv = iv ? this.stringToBytes(iv).slice(0, 16) : this.key.slice(0, 16);
    }

    stringToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        return bytes;
    }

    hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return bytes;
    }

    encrypt(plaintext) {
        const keyHex = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.key).toString().substring(0, 32));
        const ivHex = CryptoJS.enc.Hex.parse(CryptoJS.enc.Utf8.stringify(this.iv).substring(0, 32));
        const encrypted = CryptoJS.AES.encrypt(plaintext, keyHex, {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    decrypt(ciphertext) {
        const keyHex = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.key).toString().substring(0, 32));
        const ivHex = CryptoJS.enc.Hex.parse(CryptoJS.enc.Utf8.stringify(this.iv).substring(0, 32));
        const decrypted = CryptoJS.AES.decrypt(ciphertext, keyHex, {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

// 应用数据（模拟后端数据，可替换为真实接口请求）
const appData = [
    {
        id: 1,
        title: "智能笔记",
        tag: "效率工具",
        shortDesc: "支持语音转文字、云端同步的高效笔记工具，适配多端设备。",
        fullDesc: `
            <h4>核心功能</h4>
            <ul>
                <li>语音实时转文字，识别准确率98%+</li>
                <li>多端云端同步，支持手机、平板、电脑无缝切换</li>
                <li>富文本编辑，支持图片、表格、公式插入</li>
                <li>标签分类管理，快速检索笔记内容</li>
                <li>离线编辑模式，无网络也能正常使用</li>
            </ul>
            <h4>适配平台</h4>
            <p>Windows / macOS / iOS / Android / 网页端</p>
            <h4>更新日志</h4>
            <p>v2.1.0 (2025-01-15)：新增AI总结功能，支持一键生成笔记摘要</p>
        `,
        imgUrl: "https://picsum.photos/seed/app1/800/400",
        downloadLink: "#" // 替换为真实下载链接
    },
    {
        id: 2,
        title: "健康管家",
        tag: "健康生活",
        shortDesc: "记录饮食、运动、睡眠数据，生成个性化健康分析报告。",
        fullDesc: `
            <h4>核心功能</h4>
            <ul>
                <li>饮食记录：扫描条形码快速录入食物信息，自动计算热量</li>
                <li>运动追踪：支持步行、跑步、骑行等10+种运动模式自动识别</li>
                <li>睡眠监测：结合手机传感器分析睡眠质量，给出改善建议</li>
                <li>健康报告：每周生成可视化健康分析，预警潜在健康风险</li>
                <li>数据导出：支持将健康数据导出为PDF，方便分享给医生</li>
            </ul>
            <h4>适配平台</h4>
            <p>iOS / Android（需开启健康权限）</p>
            <h4>更新日志</h4>
            <p>v3.0.0 (2025-02-20)：新增血糖记录模块，支持血糖仪数据同步</p>
        `,
        imgUrl: "https://picsum.photos/seed/app2/800/400",
        downloadLink: "#" // 替换为真实下载链接
    },
    {
        id: 3,
        title: "任务清单",
        tag: "效率工具",
        shortDesc: "可视化任务管理工具，支持自定义标签、截止日期提醒。",
        fullDesc: `
            <h4>核心功能</h4>
            <ul>
                <li>可视化看板：以列表、日历、看板三种视图展示任务</li>
                <li>自定义标签：按项目、优先级、类型等维度分类任务</li>
                <li>智能提醒：支持多时段提醒，避免遗漏重要任务</li>
                <li>协作功能：支持邀请团队成员共同管理任务列表</li>
                <li>数据统计：生成任务完成率、耗时分析等可视化报表</li>
            </ul>
            <h4>适配平台</h4>
            <p>Windows / macOS / iOS / Android / 网页端</p>
            <h4>更新日志</h4>
            <p>v1.8.0 (2025-03-10)：新增AI任务规划，根据截止日期自动分配优先级</p>
        `,
        imgUrl: "https://picsum.photos/seed/app3/800/400",
        downloadLink: "#" // 替换为真实下载链接
    }
];

// DOM元素获取
const appListPage = document.getElementById('appListPage');
const appDetailPage = document.getElementById('appDetailPage');
const backBtn = document.getElementById('backBtn');
const appCards = document.querySelectorAll('.app-card');

// 页面切换函数
function showDetailPage(appId) {
    // 隐藏列表页，显示详情页
    appListPage.classList.remove('active');
    appDetailPage.classList.add('active');
    backBtn.classList.remove('hidden');

    // 查找对应应用数据
    const app = appData.find(item => item.id === parseInt(appId));
    if (!app) return;

    // 渲染详情页内容
    document.getElementById('detailImg').src = app.imgUrl;
    document.getElementById('detailImg').alt = app.title;
    document.getElementById('detailTitle').textContent = app.title;
    document.getElementById('detailTag').textContent = app.tag;
    document.getElementById('detailDesc').textContent = app.shortDesc;
    document.getElementById('detailFullDesc').innerHTML = app.fullDesc;
    document.getElementById('detailLink').href = app.downloadLink;
}

function showListPage() {
    // 隐藏详情页，显示列表页
    appDetailPage.classList.remove('active');
    appListPage.classList.add('active');
    backBtn.classList.add('hidden');
}

// 绑定事件
// 应用卡片点击事件
appCards.forEach(card => {
    card.addEventListener('click', () => {
        const appId = card.dataset.id;
        showDetailPage(appId);
    });
});

// 返回按钮点击事件
backBtn.addEventListener('click', showListPage);

// 卡密API客户端
class CardKeyAPI {
    constructor() {
        this.baseUrl = "http://175.27.253.177:8000";
        this.apiKey = "fhpeerless";
        this.aesKey = "nIpDDCrGKmN7d4nqRmIVfwHZgzCKDf/qdkGbL97/gEY=";
        this.aesIv = "P2m/UNJ5x+FCuILTacX96w==";
        this.aes = new AESUtils(this.aesKey, this.aesIv);
    }

    async checkCard(cardKey) {
        const url = `${this.baseUrl}/api/check`;
        const plainPayload = { card_key: cardKey.trim() };
        const encryptedPayload = this.aes.encrypt(JSON.stringify(plainPayload));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({ data: encryptedPayload })
            });

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            const encryptedResult = await response.json();
            const decryptedResult = JSON.parse(this.aes.decrypt(encryptedResult.data));
            return decryptedResult;
        } catch (error) {
            console.error('检查卡密失败:', error);
            throw error;
        }
    }
}

// DOM元素获取（卡密查询相关）
const cardCheckPage = document.getElementById('cardCheckPage');
const checkCardBtn = document.getElementById('checkCardBtn');
const submitCheckBtn = document.getElementById('submitCheckBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const cardKeyInput = document.getElementById('cardKeyInput');
const checkResult = document.getElementById('checkResult');
const checkError = document.getElementById('checkError');
const errorMessage = document.getElementById('errorMessage');

// 页面切换函数（卡密查询）
function showCardCheckPage() {
    // 隐藏所有页面
    appListPage.classList.remove('active');
    appDetailPage.classList.remove('active');
    backBtn.classList.add('hidden');
    
    // 显示卡密查询页面
    cardCheckPage.classList.add('active');
}

function hideCardCheckPage() {
    cardCheckPage.classList.remove('active');
    // 清空表单和结果
    cardKeyInput.value = '';
    checkResult.classList.add('hidden');
    checkError.classList.add('hidden');
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 处理卡密查询结果
function handleCheckResult(result) {
    const resultCardKey = document.getElementById('resultCardKey');
    const resultStatus = document.getElementById('resultStatus');
    const resultDays = document.getElementById('resultDays');
    const resultActivateTime = document.getElementById('resultActivateTime');
    const resultExpireTime = document.getElementById('resultExpireTime');
    const resultRemainingDays = document.getElementById('resultRemainingDays');

    const data = result.data;
    resultCardKey.textContent = data.card_key;
    resultDays.textContent = `${data.days} 天`;
    resultActivateTime.textContent = formatDate(data.activate_time);
    resultExpireTime.textContent = formatDate(data.expire_time);
    resultRemainingDays.textContent = `${data.remaining_days} 天`;

    // 设置状态显示
    if (data.is_active) {
        if (data.remaining_days > 0) {
            resultStatus.innerHTML = '<span class="status-active">✅ 已激活</span>';
        } else {
            resultStatus.innerHTML = '<span class="status-expired">❌ 已过期</span>';
        }
    } else {
        resultStatus.innerHTML = '<span class="status-inactive">⚠️ 未激活</span>';
    }

    // 显示结果
    checkResult.classList.remove('hidden');
    checkError.classList.add('hidden');
}

// 显示错误信息
function showError(message) {
    errorMessage.textContent = message;
    checkError.classList.remove('hidden');
    checkResult.classList.add('hidden');
}

// 绑定卡密查询事件
checkCardBtn.addEventListener('click', showCardCheckPage);

backToHomeBtn.addEventListener('click', () => {
    hideCardCheckPage();
    appListPage.classList.add('active');
});

submitCheckBtn.addEventListener('click', async () => {
    const cardKey = cardKeyInput.value.trim();
    if (!cardKey) {
        showError('请输入卡密');
        return;
    }

    // 显示加载状态
    submitCheckBtn.disabled = true;
    submitCheckBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 查询中...';

    try {
        const api = new CardKeyAPI();
        const result = await api.checkCard(cardKey);
        handleCheckResult(result);
    } catch (error) {
        showError('查询失败：' + error.message);
    } finally {
        // 恢复按钮状态
        submitCheckBtn.disabled = false;
        submitCheckBtn.innerHTML = '<i class="fa-solid fa-search"></i> 查询';
    }
});

// 添加回车键提交支持
cardKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitCheckBtn.click();
    }
});

// 初始化：确保列表页默认显示
document.addEventListener('DOMContentLoaded', () => {
    appListPage.classList.add('active');
});