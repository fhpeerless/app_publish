// 移除强制HTTP重定向，支持HTTPS访问

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
        // 后端API地址 - 使用远程服务器
        this.baseUrl = "https://175.27.253.177:8000";
        
        // 启用CORS代理，解决HTTPS到HTTP的混合内容问题
        this.useProxy = true;
        // 使用Cloudflare Worker作为CORS代理（Worker已配置直接转发到目标API）
        this.proxyUrl = "https://my-cors-proxy.68208932.workers.dev";
        
        this.apiKey = "fhpeerless";
        this.aesKey = "nIpDDCrGKmN7d4nqRmIVfwHZgzCKDf/qdkGbL97/gEY=";
        this.aesIv = "P2m/UNJ5x+FCuILTacX96w==";
        this.aes = new AESUtils(this.aesKey, this.aesIv);
    }

    async checkCard(cardKey) {
        // 应用代理（如果启用）
        let url;
        if (this.useProxy) {
            // 由于Cloudflare Worker已配置直接转发到目标API，我们直接使用Worker URL
            url = this.proxyUrl;
        } else {
            const baseUrl = `${this.baseUrl}/api/check`;
            url = baseUrl;
        }
        
        const plainPayload = { card_key: cardKey.trim() };
        const encryptedPayload = this.aes.encrypt(JSON.stringify(plainPayload));

        try {
            console.log('发送API请求:', url);
            console.log('请求数据:', { data: encryptedPayload });
            console.log('是否使用代理:', this.useProxy);
            
            // 使用CORS代理发送请求
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                    'User-Agent': 'CardKey-Client/1.0' // 与Python和Worker一致
                },
                body: JSON.stringify({ data: encryptedPayload })
            });

            console.log('API响应状态:', response.status);
            console.log('API响应头:', response.headers);

            if (!response.ok) {
                // 传递具体的HTTP状态码和响应文本
                const errorText = await response.text();
                throw new Error(`HTTP错误! 状态码: ${response.status}, 响应: ${errorText}`);
            }

            // 解析响应，allorigins.win会返回JSON格式的response对象
            let encryptedResult;
            try {
                encryptedResult = await response.json();
                // 如果使用了代理，响应可能嵌套在contents字段中
                if (this.useProxy && encryptedResult.contents) {
                    encryptedResult = JSON.parse(encryptedResult.contents);
                }
            } catch (jsonError) {
                // 如果JSON解析失败，尝试直接读取响应文本
                const responseText = await response.text();
                console.log('原始响应文本:', responseText);
                throw new Error('API响应格式错误');
            }
            
            console.log('加密响应:', encryptedResult);
            const decryptedResult = JSON.parse(this.aes.decrypt(encryptedResult.data));
            console.log('解密响应:', decryptedResult);
            return decryptedResult;
        } catch (error) {
            console.error('检查密钥失败:', error);
            console.error('错误堆栈:', error.stack);
            throw error;
        }
    }
}

// DOM元素获取（密钥查询相关）
const submitCheckBtn = document.getElementById('submitCheckBtn');
const cardKeyInput = document.getElementById('cardKeyInput');
const checkResult = document.getElementById('checkResult');
const checkError = document.getElementById('checkError');
const errorMessage = document.getElementById('errorMessage');

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

// 处理密钥查询结果
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

// 绑定查询按钮事件
submitCheckBtn.addEventListener('click', async () => {
    const cardKey = cardKeyInput.value.trim();
    if (!cardKey) {
        showError('请输入密钥');
        return;
    }

    // 显示加载状态
    submitCheckBtn.disabled = true;
    submitCheckBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 查询中...';

    try {
        console.log('开始查询密钥:', cardKey);
        const api = new CardKeyAPI();
        const result = await api.checkCard(cardKey);
        console.log('查询成功，结果:', result);
        handleCheckResult(result);
    } catch (error) {
        console.error('查询失败，详细错误:', error);
        // 检查是否为404错误
        if (error.message.includes('404')) {
            showError('密钥无效');
        } else if (error.message.includes('Failed to fetch')) {
            showError('网络错误：无法连接到API服务器。请检查网络连接或稍后再试。');
            console.error('Failed to fetch错误详情:', error);
        } else if (error.message.includes('HTTP错误')) {
            showError('服务器错误：' + error.message);
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
