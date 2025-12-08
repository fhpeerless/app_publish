// 移除强制HTTP重定向，支持HTTPS访问

// 初始化事件监听器
function initEventListeners() {
    // 页面元素获取
    const appListPage = document.getElementById('appListPage');
    const appDetailPage = document.getElementById('appDetailPage');
    const keyCheckPage = document.getElementById('keyCheckPage');
    
    // 导航按钮获取
    const checkCardBtn = document.getElementById('checkCardBtn');
    const backToAppList = document.getElementById('backToAppList');

    // 显示指定页面，隐藏其他页面
    function showPage(page) {
        // 隐藏所有页面
        appListPage.classList.remove('active');
        appDetailPage.classList.remove('active');
        keyCheckPage.classList.remove('active');
        
        // 显示指定页面
        page.classList.add('active');
    }

    // 返回列表页
    function goBackToList() {
        showPage(appListPage);
    }

    // 密钥查询按钮点击事件
    if (checkCardBtn) {
        checkCardBtn.addEventListener('click', () => {
            showPage(keyCheckPage);
        });
    }
    
    // 密钥查询页面的返回应用列表按钮
    if (backToAppList) {
        backToAppList.addEventListener('click', goBackToList);
    }
    
    // 移除了首页按钮的事件监听器
    
    // 导航栏首页按钮点击事件
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', goBackToList);
    }

    // 初始化：确保列表页默认显示并生成应用卡片
    showPage(appListPage);
    
    // 确保应用卡片被生成
    if (typeof initYingyong === 'function') {
        initYingyong();
    }
}

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
});
