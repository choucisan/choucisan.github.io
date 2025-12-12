// --- 图片资源库 ---
const unsplashLoveIds = [
     '1763713512972-58f361318408', '1762944080693-97bda189a62f',
     "1759770263968-f209e998c73e", "1759800805327-73e960ec7afe",
     "1611338314700-bd7c42231b44",
];
const unsplashPeopleIds = [
    '1763713382836-e2263bff42b3', '1635269847729-0b8e67f1f92e',
    '1761906261794-22c24b93cd7f', "1754769440490-2eb64d715775"
];

const unsplashSportsIds = [
    '1762944082029-1b70f07fd712', '1762306352610-8612057010ba',
    '1762392050936-cf787f78e812', "1763620077650-404ff4e7a685",
    '1762517414106-631b0cefcb6d', "1762709753401-702f95c27cf9",
    '1762289934659-ca15940fff08', "1609601243967-7ff7c286535a",
    "1712060563007-4f4012b1f2f3", "1532105111962-e23707867985",
    "1542408427-424ab3b2b04d",    "1470192581780-bf0a1cb67135",
    "1602361563339-0023db07a42e", "1761069234529-330768251b32",
    "1727986920536-e21345a9a960", "1754483174121-1abde2c42383",
    "1755682212897-65024adec786", "1762709753401-d0ff2c4936c5",
    "1762709753410-25f211f9402f", "1531259960912-746d0c872ee6",
];

const unsplashArtIds = [
     '1764123861344-0aad2673213c', "1516737488405-7b6d6868fad3",
     "1763718678099-fdb5c2f9cc50", 
];

const unsplashIds = [
    ...unsplashLoveIds,
    ...unsplashPeopleIds,
    ...unsplashSportsIds,
    ...unsplashArtIds
];

// --- 格言库 (Mottos) ---
const mottos = [
    "When I was a child, I talked like a child,I thought like a child,I reasoned like a child. When I became a man,I put the ways of childhood behind me. —— 1 Corinthians 13:11",
    "Trust in the Lord with all your heart and lean not on your own understanding;in all your ways submit to him,and he will make your paths straight. —— Proverbs 3:5-6",
    "They will not labor in vain,nor will they bear children doomed to misfortune;for they will be a people blessed by the Lord,they and their descendants with them. —— Isaiah 65:23",
    "And a voice from heaven said,“ This is my Son, whom I love; with him I am well pleased.” —— Matthew 3:17",
    "Man shall not live by bread alone,but by every word that proceedeth out of the mouth of God. —— Matthew 4:4",
    "Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. —— Matthew 22:37",


];

// --- 全局变量 ---
let currentQueue = [];
let currentMottoIndex = 0;
const intervalTime = 8000; 

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getNextImage() {
    if (currentQueue.length === 0) {
        currentQueue = [...unsplashIds];
        shuffleArray(currentQueue);
    }
    const nextId = currentQueue.pop();
    return `https://images.unsplash.com/photo-${nextId}?q=80&w=2560&auto=format&fit=crop`;
}

// --- 功能函数 ---

// 初始化 Logo
function initLogo() {
    const brand = document.querySelector('.navbar-brand');
    if (!brand) return;
    brand.innerHTML = `
        <div class="brand-wrapper">
            <span class="brand-num">Choucisan's Blogs</span>
        </div>
    `;
    brand.style.display = "flex";
    brand.style.flexDirection = "column";
    brand.style.opacity = "1";
}

// 标题显示控制
function titleController() {
    const subtitleWrap = document.getElementById('subtitle-wrap');
    if (!subtitleWrap) return;
    const path = location.pathname;
    const isHomePage = path === '/' || path === '/index.html';
    if (!isHomePage) {
        subtitleWrap.style.setProperty('display', 'block', 'important');
        subtitleWrap.style.setProperty('visibility', 'visible', 'important');
        subtitleWrap.style.setProperty('opacity', '1', 'important');
    }
}

// 更新格言文字
function updateBannerMotto() {
    const mottoText = document.querySelector('.motto-text');
    if (!mottoText) return;

    // 淡出
    mottoText.style.opacity = '0';
    mottoText.style.transform = 'translateY(10px)';

    setTimeout(() => {
        // 切换文字
        currentMottoIndex = (currentMottoIndex + 1) % mottos.length;
        mottoText.textContent = mottos[currentMottoIndex];
        
        // 淡入
        mottoText.style.opacity = '1';
        mottoText.style.transform = 'translateY(0)';
    }, 500); // 0.5s 后切换
}

// 初始化格言 DOM
function initBannerText() {
    const banner = document.getElementById('banner');
    if (!banner) return;

    const path = location.pathname;
    const isHomePage = path === '/' || path === '/index.html';
    if (!isHomePage) return;

    // 随机一个初始格言
    currentMottoIndex = Math.floor(Math.random() * mottos.length);

    const mottoDiv = document.createElement('div');
    mottoDiv.className = 'banner-motto';
    mottoDiv.innerHTML = `
        <span class="motto-line"></span>
        <span class="motto-text">${mottos[currentMottoIndex]}</span>
    `;
    banner.appendChild(mottoDiv);
}

// --- 主程序 ---
document.addEventListener("DOMContentLoaded", function () {
    const banner = document.getElementById('banner');
    
    // 初始化组件
    setTimeout(initLogo, 50);
    setTimeout(initBannerText, 100);
    titleController();

    // 启动背景轮播
    if (banner) {
        banner.style.transition = "none !important";
        banner.style.animation = "none !important";
        
        const firstImg = getNextImage();
        banner.style.backgroundImage = `url('${firstImg}')`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
        
        // 定时器：同步切换图片和格言
        setInterval(() => {
            // 换图
            const nextImg = getNextImage();
            const loader = new Image();
            loader.src = nextImg;
            loader.onload = () => {
                banner.style.backgroundImage = `url('${nextImg}')`;
            };
            
            // 换格言 (仅在首页有效)
            const path = location.pathname;
            if (path === '/' || path === '/index.html') {
                updateBannerMotto();
            }
            
        }, intervalTime);
    }
});