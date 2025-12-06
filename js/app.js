// AES加密解密工具类
class AESUtils {
    constructor(key, iv) {
        // 与后端保持一致的密钥处理方式：SHA256哈希后取前32字节的原始二进制数据
        this.key = CryptoJS.SHA256(key); // SHA256哈希后得到32字节的二进制数据
        
        // IV处理：确保长度为16字节
        if (iv) {
            // 与后端一致：将IV转换为UTF-8编码，然后补到16字节
            const ivStr = iv.substring(0, 16).padEnd(16, ' ');
            this.iv = CryptoJS.enc.Utf8.parse(ivStr);
        } else {
            // 默认使用密钥前16字节作为IV
            this.iv = CryptoJS.lib.WordArray.create(this.key.words.slice(0, 4)); // 4个32位字 = 16字节
        }
    }

    encrypt(plaintext) {
        const encrypted = CryptoJS.AES.encrypt(plaintext, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        // 返回Base64编码的密文，与后端完全一致
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    }

    decrypt(ciphertext) {
        // 密文是Base64编码，需要先转换为WordArray
        const ciphertextWordArray = CryptoJS.enc.Base64.parse(ciphertext);
        const decrypted = CryptoJS.AES.decrypt({
            ciphertext: ciphertextWordArray
        }, this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}



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
                // 传递具体的HTTP状态码
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

    // API响应包含data对象嵌套
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
        // 检查是否为404错误
        if (error.message.includes('404')) {
            showError('卡密无效');
        } else {
            showError('查询失败：' + error.message);
        }
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

// 初始化：确保列表页默认显示并生成应用卡片
document.addEventListener('DOMContentLoaded', () => {
    appListPage.classList.add('active');
    initYingyong();
});
