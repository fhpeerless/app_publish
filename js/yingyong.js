// 应用数据（模拟后端数据，可替换为真实接口请求）
const appData = [
    {
        id: 1,
        title: "谷歌多开",
        tag: "效率工具",
        shortDesc: "一键多开指定数量的google的浏览器。",
        fullDesc: `
            <h4>核心功能</h4>
            <ul>
                <li>存储位置自定义%+</li>
                <li>多开数量自定义</li>
                <li>每个多开相互独立</li>
                <li>几秒中创建上百个google新页面</li>
                <li>离线编辑模式，无网络也能正常使用</li>
                <li>源代码支持，不用担心google中数据泄露的问题</li>
            </ul>
            <h4>适配平台</h4>
            <p>Windows / macOS /</p>
            <h4>更新日志</h4>
            <p>v2.1.0 (2025-01-15)：新增AI总结功能，支持一键生成笔记摘要</p>
        `,
        imgUrl: "http://i0.hdslb.com/bfs/mallup/mall/2x/03/2x03zy10x0zy02x23xx302zzw3x300w0.png@.webp",
        videoEmbed: "<iframe src=\"http://player.bilibili.com/player.html?isOutside=true&aid=1303107810&bvid=BV1LM4m1X7dk&cid=1508435093&p=1\" scrolling=\"no\" border=\"0\" frameborder=\"no\" framespacing=\"0\" allowfullscreen=\"true\"></iframe>",
        downloadLinks: [
            { platform: "源码购买", link: "http://mall.bilibili.com/neul-next/detailuniversal/detail.html?isMerchant=1&page=detailuniversal_detail&saleType=10&itemsId=12328456&loadingShow=1&noTitleBar=1&msource=merchant_share" },
            { platform: "源码购买", link: "http://mall.bilibili.com/neul-next/detailuniversal/detail.html?isMerchant=1&page=detailuniversal_detail&saleType=10&itemsId=12328456&loadingShow=1&noTitleBar=1&msource=merchant_share" }
        ]
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
        imgUrl: "http://picsum.photos/seed/app2/800/400",
        downloadLinks: [
            { platform: "iOS", link: "#ios" },
            { platform: "Android", link: "#android" }
        ]
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
        imgUrl: "http://picsum.photos/seed/app3/800/400",
        downloadLinks: [
            { platform: "Windows", link: "#windows" },
            { platform: "macOS", link: "#macos" },
            { platform: "iOS", link: "#ios" },
            { platform: "Android", link: "#android" },
            { platform: "网页端", link: "#web" }
        ]
    }
];

// DOM元素获取
const appListPage = document.getElementById('appListPage');
const appDetailPage = document.getElementById('appDetailPage');
const backBtn = document.getElementById('backBtn');
const appGrid = document.getElementById('appGrid');
let appCards;

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
    const detailImgContainer = document.querySelector('.detail-img');
    const detailImg = document.getElementById('detailImg');
    
    // 清空容器内容
    detailImgContainer.innerHTML = '';
    
    if (app.videoEmbed) {
        // 如果有视频嵌入代码，显示视频
        detailImgContainer.innerHTML = app.videoEmbed;
    } else {
        // 否则显示图片
        detailImg.src = app.imgUrl;
        detailImg.alt = app.title;
        detailImgContainer.appendChild(detailImg);
    }
    
    document.getElementById('detailTitle').textContent = app.title;
    document.getElementById('detailTag').textContent = app.tag;
    document.getElementById('detailDesc').textContent = app.shortDesc;
    document.getElementById('detailFullDesc').innerHTML = app.fullDesc;
    
    // 生成多个下载链接按钮
    const detailActions = document.querySelector('.detail-actions');
    detailActions.innerHTML = '';
    
    if (app.downloadLinks && app.downloadLinks.length > 0) {
        app.downloadLinks.forEach(download => {
            const downloadBtn = document.createElement('a');
            downloadBtn.href = download.link;
            downloadBtn.className = 'btn-primary';
            downloadBtn.target = '_blank';
            downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> ${download.platform}`;
            detailActions.appendChild(downloadBtn);
        });
    } else {
        // 兼容旧格式，提供默认下载按钮
        const downloadBtn = document.createElement('a');
        downloadBtn.href = app.downloadLink || '#';
        downloadBtn.className = 'btn-primary';
        downloadBtn.target = '_blank';
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> 立即下载';
        detailActions.appendChild(downloadBtn);
    }
}

function showListPage() {
    // 隐藏详情页，显示列表页
    appDetailPage.classList.remove('active');
    appListPage.classList.add('active');
    backBtn.classList.add('hidden');
}

// 动态生成应用卡片函数
function generateAppCards() {
    // 清空现有卡片
    appGrid.innerHTML = '';
    
    // 遍历应用数据生成卡片
    appData.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.dataset.id = app.id;
        
        // 生成卡片图片或视频内容
        let mediaContent;
        if (app.videoEmbed) {
            mediaContent = app.videoEmbed;
        } else {
            mediaContent = `<img src="${app.imgUrl}" alt="${app.title}">`;
        }
        
        card.innerHTML = `
            <div class="card-img">
                ${mediaContent}
            </div>
            <div class="card-content">
                <h3 class="card-title">${app.title}</h3>
                <p class="card-desc">${app.shortDesc}</p>
                <div class="card-tag">${app.tag}</div>
            </div>
        `;
        
        appGrid.appendChild(card);
    });
    
    // 更新appCards变量
    appCards = document.querySelectorAll('.app-card');
    
    // 绑定卡片点击事件
    appCards.forEach(card => {
        card.addEventListener('click', () => {
            const appId = card.dataset.id;
            showDetailPage(appId);
        });
    });
}

// 绑定事件
// 返回按钮点击事件
backBtn.addEventListener('click', showListPage);

// 初始化函数
function initYingyong() {
    // 生成应用卡片
    generateAppCards();
}

// 导出函数（如果需要在其他地方调用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appData,
        generateAppCards,
        showDetailPage,
        showListPage,
        initYingyong
    };
}
