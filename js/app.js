// 移除强制HTTP重定向，支持HTTPS访问

// 页面元素获取
const appListPage = document.getElementById('appListPage');
const appDetailPage = document.getElementById('appDetailPage');
const keyCheckPage = document.getElementById('keyCheckPage');

// 导航按钮获取
const checkCardBtn = document.getElementById('checkCardBtn');
const backBtn = document.getElementById('backBtn');
const backToAppList = document.getElementById('backToAppList');

// 显示指定页面，隐藏其他页面
function showPage(page) {
    // 隐藏所有页面
    appListPage.classList.remove('active');
    appDetailPage.classList.remove('active');
    keyCheckPage.classList.remove('active');
    
    // 显示指定页面
    page.classList.add('active');
    
    // 控制返回按钮的显示
    if (page === appDetailPage || page === keyCheckPage) {
        backBtn.classList.remove('hidden');
    } else {
        backBtn.classList.add('hidden');
    }
}

// 返回列表页
function goBackToList() {
    showPage(appListPage);
}

// 初始化事件监听器
function initEventListeners() {
    // 密钥查询按钮点击事件
    if (checkCardBtn) {
        checkCardBtn.addEventListener('click', () => {
            showPage(keyCheckPage);
        });
    }
    
    // 返回按钮点击事件
    if (backBtn) {
        backBtn.addEventListener('click', goBackToList);
    }
    
    // 密钥查询页面的返回应用列表按钮
    if (backToAppList) {
        backToAppList.addEventListener('click', goBackToList);
    }
}

// 初始化：确保列表页默认显示并生成应用卡片
document.addEventListener('DOMContentLoaded', () => {
    showPage(appListPage);
    initYingyong();
    initEventListeners();
});
