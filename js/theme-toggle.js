// 主题切换功能
class ThemeToggle {
    constructor() {
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.currentTheme = this.loadThemePreference();
        
        this.init();
    }

    // 初始化主题
    init() {
        this.applyTheme(this.currentTheme);
        this.bindEventListeners();
    }

    // 加载主题偏好（从localStorage或用户系统偏好）
    loadThemePreference() {
        // 检查localStorage中是否有保存的主题
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            return savedTheme;
        }

        // 检查用户系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // 默认使用亮色主题
        return 'light';
    }

    // 应用主题
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }

        // 更新按钮文本和图标
        this.updateButton(theme);

        // 保存主题偏好到localStorage
        localStorage.setItem('appTheme', theme);

        // 更新当前主题
        this.currentTheme = theme;
    }

    // 切换主题
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    // 更新按钮文本和图标
    updateButton(theme) {
        if (this.themeToggleBtn) {
            const iconElement = this.themeToggleBtn.querySelector('i');
            if (theme === 'dark') {
                iconElement.className = 'fa-solid fa-sun';
                this.themeToggleBtn.textContent = ' 白天模式';
                this.themeToggleBtn.prepend(iconElement);
            } else {
                iconElement.className = 'fa-solid fa-moon';
                this.themeToggleBtn.textContent = ' 黑夜模式';
                this.themeToggleBtn.prepend(iconElement);
            }
        }
    }

    // 绑定事件监听器
    bindEventListeners() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
}

// DOM加载完成后初始化主题切换
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeToggle();
        initContactQRCode();
    });
} else {
    new ThemeToggle();
    initContactQRCode();
}

// 初始化联系方式二维码功能
function initContactQRCode() {
    const contactLink = document.getElementById('contact-link');
    const qrcodeContainer = document.getElementById('qrcode-container');
    
    if (contactLink && qrcodeContainer) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默认跳转行为
            qrcodeContainer.style.display = qrcodeContainer.style.display === 'block' ? 'none' : 'block';
        });
        
        // 点击页面其他地方关闭二维码
        document.addEventListener('click', (e) => {
            if (!contactLink.contains(e.target) && !qrcodeContainer.contains(e.target)) {
                qrcodeContainer.style.display = 'none';
            }
        });
    }
}
