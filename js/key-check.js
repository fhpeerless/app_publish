// 移除强制HTTP重定向，支持HTTPS访问

// AES加密解密工具类
class AESUtils {
    constructor(key, iv) {
        // 密钥处理：与后端Python保持一致
        // 后端使用：hashlib.sha256(key.encode()).digest()[:32]
        // 前端需要：直接将key字符串进行SHA256哈希
        const keyUtf8Bytes = CryptoJS.enc.Utf8.parse(key);
        this.key = CryptoJS.SHA256(keyUtf8Bytes);
        
        // IV处理：确保长度为16字节，与后端Python的处理方式完全一致
        if (iv) {
            // 与后端Python一致：直接将iv字符串进行处理，用空格填充到16字节
            const ivUtf8 = iv;
            
            // 创建16字节的数组，用空格（0x20）填充
            const paddedIVBytes = new Uint8Array(16);
            paddedIVBytes.fill(0x20); // ASCII空格
            
            // 复制原始IV到填充后的数组
            const ivTextBytes = new TextEncoder().encode(ivUtf8);
            paddedIVBytes.set(ivTextBytes.slice(0, 16), 0);
            
            // 将Uint8Array转换为WordArray
            const ivWordArray = CryptoJS.lib.WordArray.create(paddedIVBytes);
            
            this.iv = ivWordArray;
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
    constructor(baseUrl = "/") {
        // 后端API地址 - 使用相对路径，连接到当前域名的API服务器
        this.baseUrl = baseUrl;
        
        this.apiKey = "fhpeerless";
        this.aesKey = "nIpDDCrGKmN7d4nqRmIVfwHZgzCKDf/qdkGbL97/gEY=";
        this.aesIv = "P2m/UNJ5x+FCuILTacX96w==";
        this.aes = new AESUtils(this.aesKey, this.aesIv);
    }

    async checkCard(cardKey) {
        // 直接访问API接口
        const url = `${this.baseUrl}/api/check`;
        
        const plainPayload = { card_key: cardKey.trim() };
        const encryptedPayload = this.aes.encrypt(JSON.stringify(plainPayload));

        try {
            console.log('发送API请求:', url);
            console.log('请求数据:', { data: encryptedPayload });
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
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

            // 解析响应，Worker代理会直接返回目标API的响应
            let responseText;
            try {
                // 首先读取原始响应文本，以便调试
                responseText = await response.text();
                console.log('原始响应文本:', responseText);
                
                // 尝试解析JSON
                const responseData = JSON.parse(responseText);
                console.log('解析后的响应数据:', responseData);
                
                // 根据后端API结构处理响应
                if (responseData && responseData.data) {
                    // 解密响应数据
                    let decryptedResult;
                    try {
                        decryptedResult = JSON.parse(this.aes.decrypt(responseData.data));
                        console.log('解密响应:', decryptedResult);
                        return decryptedResult;
                    } catch (decryptError) {
                        console.error('解密响应失败:', decryptError);
                        console.error('解密失败的密文:', responseData.data);
                        throw new Error(`解密响应失败: ${decryptError.message}`);
                    }
                } else {
                    // 如果没有data字段，可能是直接返回的错误信息
                    throw new Error(`API响应格式错误: ${responseText}`);
                }
            } catch (parseError) {
                console.error('响应解析失败:', parseError);
                console.error('失败的响应文本:', responseText);
                throw new Error(`API响应格式错误: ${parseError.message}`);
            }
        } catch (error) {
            console.error('检查密钥失败:', error);
            console.error('错误堆栈:', error.stack);
            throw error;
        }
    }
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

// 处理密钥查询结果
function handleCheckResult(result) {
    const resultCardKey = document.getElementById('resultCardKey');
    const resultStatus = document.getElementById('resultStatus');
    const resultDays = document.getElementById('resultDays');
    const resultActivateTime = document.getElementById('resultActivateTime');
    const resultExpireTime = document.getElementById('resultExpireTime');
    const resultRemainingDays = document.getElementById('resultRemainingDays');

    // 解析API响应结构 - 实际响应是 {status: "success", data: {...}} 格式
    console.log('处理的响应结果:', result);
    const cardData = result.data || result; // 兼容两种可能的响应格式
    
    // 设置显示内容
    resultCardKey.textContent = cardData.card_key;
    resultDays.textContent = `${cardData.days} 天`;
    resultActivateTime.textContent = formatDate(cardData.activate_time);
    resultExpireTime.textContent = formatDate(cardData.expire_time);

    // 设置状态显示 - 正确判断激活状态和过期时间
    console.log(`卡密数据:`, cardData);
    
    // 检查卡密是否未激活
    if (!cardData.is_active || cardData.activate_time === null || cardData.expire_time === null) {
        resultStatus.innerHTML = '<span class="status-inactive">⚠️ 未激活</span>';
        resultRemainingDays.textContent = '7 天'; // 未激活的卡密剩余时间显示为7天
    } else {
        // 卡密已激活，计算精确的剩余时间
        const now = new Date();
        const expireTime = new Date(cardData.expire_time);
        const remainingHours = (expireTime - now) / (1000 * 60 * 60);
        
        console.log(`剩余小时数: ${remainingHours}`);
        
        // 根据剩余时间设置显示
        if (remainingHours > 24) {
            // 超过24小时，显示剩余天数
            const remainingDays = Math.ceil(remainingHours / 24);
            resultRemainingDays.textContent = `${remainingDays} 天`;
        } else if (remainingHours > 0) {
            // 不足24小时，显示剩余小时数
            const remainingHoursInt = Math.ceil(remainingHours);
            resultRemainingDays.textContent = `${remainingHoursInt} 小时`;
        } else {
            // 已过期
            resultRemainingDays.textContent = '0 小时';
        }
        
        if (remainingHours > 0) {
            resultStatus.innerHTML = '<span class="status-active">✅ 已激活</span>';
        } else {
            resultStatus.innerHTML = '<span class="status-expired">❌ 已过期</span>';
        }
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

// 页面加载完成后执行初始化
if (document.readyState === 'loading') {
    // 页面正在加载中
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    // 页面已经加载完成
    initializePage();
}

function initializePage() {
    // DOM元素获取（密钥查询相关）
    const submitCheckBtn = document.getElementById('submitCheckBtn');
    const cardKeyInput = document.getElementById('cardKeyInput');
    const checkResult = document.getElementById('checkResult');
    const checkError = document.getElementById('checkError');
    const errorMessage = document.getElementById('errorMessage');

    // 检查DOM元素是否存在
    if (!submitCheckBtn || !cardKeyInput || !checkResult || !checkError || !errorMessage) {
        console.log('未找到卡密查询相关DOM元素，可能当前页面不是卡密查询页面');
        return;
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
            // 直接使用生产环境API地址
            const apiUrl = 'https://api.ddda.cc';
            const api = new CardKeyAPI(apiUrl);
            const result = await api.checkCard(cardKey);
            console.log('查询成功，结果:', result);
            handleCheckResult(result);
        } catch (error) {
            console.error('查询失败，详细错误:', error);
            // 检查是否为404错误
            if (error.message.includes('404')) {
                showError('密钥无效');
            } else if (error.message.includes('Failed to fetch')) {
                showError('网络错误：无法连接到API服务器。请检查网络连接或稍后再试。\n错误详情: ' + error.message);
                console.error('Failed to fetch错误详情:', error);
            } else if (error.message.includes('HTTP错误')) {
                showError('服务器错误：' + error.message);
            } else {
                showError('查询失败：' + error.message + '\n错误类型: ' + error.name);
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

    console.log('密钥查询功能初始化完成');
}
