// API基础URL
const API_BASE_URL = 'https://api.ddda.cc/mima';

// DOM元素
let cpuIdInput, calculateBtn;
let loading, passwordResult, passwordResultText, passwordError, passwordErrorMessage;

// 初始化函数
function initPasswordCalc() {
    // 获取DOM元素
    cpuIdInput = document.getElementById('cpuIdInput');
    calculateBtn = document.getElementById('calculateBtn');
    
    loading = document.getElementById('loading');
    passwordResult = document.getElementById('passwordResult');
    passwordResultText = document.getElementById('passwordResultText');
    passwordError = document.getElementById('passwordError');
    passwordErrorMessage = document.getElementById('passwordErrorMessage');
    
    // 绑定事件监听器
    bindEvents();
}

// 绑定事件监听器
function bindEvents() {
    // 计算密码按钮点击事件
    calculateBtn.addEventListener('click', calculatePassword);
    
    // 回车触发计算
    cpuIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculatePassword();
        }
    });
}

// 显示加载状态
function showLoading() {
    loading.classList.remove('hidden');
}

// 隐藏加载状态
function hideLoading() {
    loading.classList.add('hidden');
}

// 显示结果
function showResult(message) {
    // 清理之前的内容
    passwordResultText.innerHTML = '';
    
    // 创建结果显示和复制按钮容器
    const resultContainer = document.createElement('div');
    resultContainer.style.display = 'flex';
    resultContainer.style.alignItems = 'center';
    resultContainer.style.gap = '10px';
    
    // 创建结果文本元素
    const resultText = document.createElement('span');
    resultText.textContent = message;
    resultText.style.flex = '1';
    
    // 创建复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制密码';
    copyBtn.className = 'btn-secondary';
    copyBtn.style.fontSize = '12px';
    copyBtn.style.padding = '6px 12px';
    copyBtn.style.cursor = 'pointer';
    
    // 添加复制图标
    const copyIcon = document.createElement('i');
    copyIcon.className = 'fa-solid fa-copy';
    copyIcon.style.marginRight = '5px';
    copyBtn.prepend(copyIcon);
    
    // 提取密码部分（去掉"计算结果："前缀）
    const password = message.replace('计算结果：', '').trim();
    
    // 添加复制按钮点击事件
    copyBtn.addEventListener('click', () => {
        // 复制密码到剪贴板
        navigator.clipboard.writeText(password)
            .then(() => {
                // 临时修改按钮文本为"已复制"
                const originalText = copyBtn.textContent;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
                copyBtn.style.backgroundColor = '#4CAF50';
                
                // 2秒后恢复原按钮样式
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> 复制密码';
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                // 降级方案：使用输入框复制
                const tempInput = document.createElement('input');
                tempInput.value = password;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // 显示复制成功
                const originalText = copyBtn.textContent;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制';
                copyBtn.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> 复制密码';
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            });
    });
    
    // 组装结果容器
    resultContainer.appendChild(resultText);
    resultContainer.appendChild(copyBtn);
    
    // 将结果容器添加到DOM
    passwordResultText.appendChild(resultContainer);
    
    // 显示结果
    passwordResult.classList.remove('hidden');
    hideError();
}

// 隐藏结果
function hideResult() {
    passwordResult.classList.add('hidden');
}

// 显示错误
function showError(message) {
    passwordErrorMessage.textContent = message;
    passwordError.classList.remove('hidden');
    hideResult();
}

// 隐藏错误
function hideError() {
    passwordError.classList.add('hidden');
}

// 发送HTTP请求
async function fetchData(url, options = {}) {
    try {
        showLoading();
        console.log('正在请求：', url);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        console.log('响应状态：', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP错误！状态：${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('请求失败：', error);
        throw error;
    } finally {
        hideLoading();
    }
}

// 计算密码（GET方式 - 使用简化的password端点）
async function calculatePassword() {
    const cpuId = cpuIdInput.value.trim();
    
    if (!cpuId) {
        showError('请输入CPU ID！');
        return;
    }
    
    try {
        // 尝试使用简化的password端点（直接返回密码文本）
        const response = await fetch(`${API_BASE_URL}/password/${encodeURIComponent(cpuId)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP错误！状态：${response.status}`);
        }
        
        // 简化端点直接返回文本，不需要解析JSON
        let password = await response.text();
        // 移除可能的引号（处理API返回带引号的情况）
        if ((password.startsWith('"') && password.endsWith('"')) || (password.startsWith("'") && password.endsWith("'")) || (password.startsWith('`') && password.endsWith('`'))) {
            password = password.slice(1, -1);
        }
        // 移除可能的空格
        password = password.trim();
        showResult(`计算结果：${password}`);
    } catch (error) {
        try {
            // 如果简化端点失败，尝试使用标准的calculate端点
            console.log('简化端点失败，尝试使用标准端点...');
            const response = await fetchData(`${API_BASE_URL}/calculate/${encodeURIComponent(cpuId)}`);
            const data = await response.json();
            // 获取密码并确保它是字符串类型
            let password = String(data.password);
            showResult(`计算结果：${password}`);
        } catch (fallbackError) {
            showError(`计算失败：${fallbackError.message}`);
            console.error('计算密码失败：', fallbackError);
        }
    }
}

// 初始化密码计算功能
initPasswordCalc();

// 导出函数（如果需要在其他地方调用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPasswordCalc,
        calculatePassword
    };
}