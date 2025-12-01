
const unsplashIds = [
    "1761839258289-72f12b0de058", 
    '1763713512972-58f361318408',
    '1762944080693-97bda189a62f',
    '1764017884266-b53a65cf0044',
    '1763713382836-e2263bff42b3',
    '1762944082029-1b70f07fd712',
    '1762306352610-8612057010ba',
    '1762392050936-cf787f78e812',
    '1764123861344-0aad2673213c',
    '1761300429894-dc59a24bd48c',
    '1671226366569-695da0085013',
    '1761839258075-585182da7521',
    '1635269847729-0b8e67f1f92e',
    "1763620077650-404ff4e7a685",
    '1762517414106-631b0cefcb6d',
    "1762709753401-702f95c27cf9",
    '1762289934659-ca15940fff08',
    '1761906261794-22c24b93cd7f',
    "1759800805327-73e960ec7afe",
    "1760981253092-5d1a9f04eef6",
    '1626554682199-1e0e342a52f7',
];




let currentQueue = [];
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


function initLogo() {
    const brand = document.querySelector('.navbar-brand');
    if (!brand) return;


    brand.innerHTML = `
        <div class="brand-wrapper">
            <span class="brand-num">13</span><span class="brand-log">log</span>
        </div>
    `;
    
    // 强制显示
    brand.style.display = "flex";
    brand.style.flexDirection = "column";
    brand.style.opacity = "1";
}

document.addEventListener("DOMContentLoaded", function () {
    // 初始化背景
    const banner = document.getElementById('banner');
    if (banner) {
        banner.style.transition = "none !important";
        banner.style.animation = "none !important";
        const firstImg = getNextImage();
        banner.style.backgroundImage = `url('${firstImg}')`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
        
        setInterval(() => {
            const nextImg = getNextImage();
            const loader = new Image();
            loader.src = nextImg;
            loader.onload = () => {
                banner.style.backgroundImage = `url('${nextImg}')`;
            };
        }, 5000);
    }

    // 初始化 Logo (延迟一点点确保覆盖 Fluid 默认行为)
    setTimeout(initLogo, 50);
});


