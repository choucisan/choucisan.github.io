const labels = {
  en: {
    heroText: 'Search, classify, and read bilingual structured summaries for CVPR 2026 papers.',
    search: 'Search title, author, abstract, category...',
    all: 'All',
    papers: 'papers',
    showing: 'Showing',
    noResults: 'No matching papers.',
    active: 'Active',
    categories: 'Categories',
    abstract: 'Abstract',
    citation: 'Citation',
    download: 'Download',
    dimensions: {
      research_motivation: 'Research Motivation',
      problem_solved: 'Problem Solved',
      phenomenon_analysis: 'Phenomenon Analysis',
      main_method: 'Main Method',
      data_experiments: 'Data & Experiments',
      main_contributions: 'Main Contributions'
    }
  },
  zh: {
    heroText: '检索、分类浏览并阅读 CVPR 2026 论文的中英结构化介绍。',
    search: '搜索题目、作者、摘要、分类...',
    all: '全部',
    papers: '篇论文',
    showing: '当前显示',
    noResults: '没有匹配的论文。',
    active: '当前',
    categories: '分类',
    abstract: '摘要',
    citation: '引用',
    download: '下载',
    dimensions: {
      research_motivation: '研究动机',
      problem_solved: '解决问题',
      phenomenon_analysis: '现象分析',
      main_method: '主要方法',
      data_experiments: '数据与实验',
      main_contributions: '主要贡献'
    }
  }
};

let papers = [];
let currentLang = 'en';
let activePrimary = 'all';
let query = '';

const els = {
  search: document.querySelector('[data-search]'),
  primaryList: document.querySelector('[data-primary-list]'),
  grid: document.querySelector('[data-paper-grid]'),
  count: document.querySelector('[data-paper-count]'),
  resultSummary: document.querySelector('[data-result-summary]'),
  activeFilter: document.querySelector('[data-active-filter]'),
  empty: document.querySelector('[data-empty-state]'),
  reset: document.querySelector('[data-reset-filter]'),
  categoryToggle: document.querySelector('[data-category-toggle]'),
  categoryToggleLabel: document.querySelector('[data-category-toggle-label]'),
  categoryPopover: document.querySelector('[data-category-popover]'),
  langButtons: Array.from(document.querySelectorAll('[data-lang]')),
  i18n: Array.from(document.querySelectorAll('[data-i18n]'))
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getCategory = (paper, level) => paper[`category_${level}`]?.[currentLang] ?? paper[`category_${level}`]?.en ?? 'Uncategorized';
const getAnalysis = (paper) => paper[`analysis_${currentLang}`] ?? paper.analysis_en ?? {};
const normalize = (value) => String(value ?? '').toLowerCase();

const categoryIcon = (name) => {
  const text = normalize(name);
  if (text.includes('single images') || text.includes('单图像')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m8 15 3-3 2 2 3-4 3 5"/><circle cx="9" cy="9" r="1.2"/></svg>';
  }
  if (text.includes('3d') || text.includes('三维')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 7 4v10l-7 4-7-4V7l7-4Z"/><path d="m5 7 7 4 7-4M12 11v10"/></svg>';
  }
  if (text.includes('adversarial') || text.includes('attack') || text.includes('对抗')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.2 2.8 7.7 7 9 4.2-1.3 7-4.8 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>';
  }
  if (text.includes('autonomous') || text.includes('driving') || text.includes('自动驾驶')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 1.5-5h9L18 15"/><path d="M5 15h14v4H5v-4Z"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/><path d="M8 10V7h8v3"/></svg>';
  }
  if (text.includes('biometrics') || text.includes('生物识别')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a4 4 0 0 1 8 0c0 4-2 7-4 9"/><path d="M12 11c0 2.8-1 5-3 7"/><path d="M16 15c.8-1.2 1-2.5 1-4a5 5 0 0 0-10 0"/><path d="M7 15c.4-.9.7-2.1.7-4"/></svg>';
  }
  if (text.includes('computational imaging') || text.includes('计算成像')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M8 7 9.5 4h5L16 7"/><circle cx="12" cy="13" r="3"/><path d="M18 10h.1"/></svg>';
  }
  if (text.includes('robotics') || text.includes('机器人')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="8" width="12" height="9" rx="2"/><path d="M12 8V4M9 4h6M8.5 12h.1M15.5 12h.1M9 17l-2 3M15 17l2 3"/></svg>';
  }
  if (text.includes('social good') || text.includes('社会公益')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z"/><path d="M8 12h8"/></svg>';
  }
  if (text.includes('theory') || text.includes('理论')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h14"/><path d="M7 16 12 5l5 11"/><path d="M9 12h6"/></svg>';
  }
  if (text.includes('datasets') || text.includes('evaluation') || text.includes('数据集') || text.includes('评估')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Z"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/><path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/></svg>';
  }
  if (text.includes('deep learning') || text.includes('architecture') || text.includes('深度学习')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/><path d="M8 7h8M8 17h8M7.5 8.7l9 6.6M16.5 8.7l-9 6.6"/></svg>';
  }
  if (text.includes('document') || text.includes('文档')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></svg>';
  }
  if (text.includes('efficient') || text.includes('scalable') || text.includes('高效') || text.includes('可扩展')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14a8 8 0 1 1 16 0"/><path d="m12 14 4-6"/><path d="M6 18h12"/></svg>';
  }
  if (text.includes('embodied') || text.includes('active agents') || text.includes('具身')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M8 14h8l2 6H6l2-6Z"/><path d="M9 17h6"/></svg>';
  }
  if (text.includes('event-based') || text.includes('事件')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 5 13h6l-1 9 8-12h-6l1-8Z"/></svg>';
  }
  if (text.includes('explainable') || text.includes('可解释')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6Z"/><circle cx="12" cy="12" r="2.6"/><path d="M12 15v3"/></svg>';
  }
  if (text.includes('humans') || text.includes('face') || text.includes('pose') || text.includes('人类')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="3"/><path d="M6 21c.8-4 3-6 6-6s5.2 2 6 6"/><path d="M8 13h8"/></svg>';
  }
  if (text.includes('synthesis') || text.includes('generation') || text.includes('生成')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z"/><path d="M4 12.5 12 17l8-4.5"/><path d="M4 17.5 12 22l8-4.5"/></svg>';
  }
  if (text.includes('low-level vision') || text.includes('低层视觉')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h16"/><path d="M6 14c2-5 4-7 6-7s4 2 6 7"/><path d="M8 11h8M10 8h4"/></svg>';
  }
  if (text.includes('machine learning') || text.includes('机器学习')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18V6M6 18h12"/><path d="m8 15 3-4 3 2 4-6"/></svg>';
  }
  if (text.includes('medical') || text.includes('biological') || text.includes('医学') || text.includes('细胞')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/><rect x="4" y="4" width="16" height="16" rx="4"/></svg>';
  }
  if (text.includes('multimodal') || text.includes('多模态')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="7" height="6" rx="1.5"/><rect x="13" y="5" width="7" height="6" rx="1.5"/><rect x="8.5" y="15" width="7" height="5" rx="1.5"/><path d="M11 11.5 10 15M13 11.5l1 3.5"/></svg>';
  }
  if (text.includes('optimization') || text.includes('优化')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="7" r="2"/><path d="M9 16c4-.8 6.2-3 7-7"/><path d="M5 5h5v5"/></svg>';
  }
  if (text.includes('photogrammetry') || text.includes('remote sensing') || text.includes('摄影测量') || text.includes('遥感')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.4 2.3 3.5 5 3.5 8s-1.1 5.7-3.5 8M12 4c-2.4 2.3-3.5 5-3.5 8S9.6 17.7 12 20"/></svg>';
  }
  if (text.includes('physics') || text.includes('shape-from') || text.includes('物理')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v6l5 9H7l5-9V3"/><path d="M9 14h6"/></svg>';
  }
  if (text.includes('recognition') || text.includes('detection') || text.includes('retrieval') || text.includes('识别')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="12" cy="12" r="3"/><path d="m16 16 3 3"/></svg>';
  }
  if (text.includes('representation') || text.includes('表征')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="12" cy="17" r="2"/><path d="M9 8.5 11 15M15 8.5 13 15M9 7h6"/></svg>';
  }
  if (text.includes('scene analysis') || text.includes('场景')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V6h16v12H4Z"/><path d="m6 16 4-5 3 3 2-2 3 4"/></svg>';
  }
  if (text.includes('segmentation') || text.includes('shape analysis') || text.includes('分割')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z"/><path d="M11 8h2M8 11v2M16 11v2M11 16h2"/></svg>';
  }
  if (text.includes('self-') || text.includes('unsupervised') || text.includes('自监督') || text.includes('无监督')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7a7 7 0 0 1 11 2"/><path d="M17 7h1V4"/><path d="M17 17a7 7 0 0 1-11-2"/><path d="M7 17H6v3"/></svg>';
  }
  if (text.includes('transfer') || text.includes('low-shot') || text.includes('迁移') || text.includes('小样本')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-3-3M17 17H7l3 3"/><path d="M17 7 7 17"/></svg>';
  }
  if (text.includes('transparency') || text.includes('fairness') || text.includes('privacy') || text.includes('ethics') || text.includes('隐私') || text.includes('伦理')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.2 2.8 7.7 7 9 4.2-1.3 7-4.8 7-9V6l-7-3Z"/><path d="M9 12h6M12 9v6"/></svg>';
  }
  if (text.includes('action and event') || text.includes('动作') || text.includes('事件理解')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7-11-7Z"/><path d="M4 6v12"/></svg>';
  }
  if (text.includes('motion') || text.includes('tracking') || text.includes('运动') || text.includes('跟踪')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h8a4 4 0 0 1 0 8H8"/><path d="m8 11-4 4 4 4"/><path d="M16 5h3M18 8h2"/></svg>';
  }
  if (text.includes('vision + graphics') || text.includes('图形学')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z"/><path d="M8 16 16 8M8 8h8v8"/></svg>';
  }
  if (text.includes('applications') || text.includes('systems') || text.includes('应用') || text.includes('系统')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M8 9h8M8 13h5"/></svg>';
  }
  if (text.includes('language') || text.includes('reasoning') || text.includes('语言') || text.includes('推理')) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H8l-3 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H4z"/><path d="M8 19h8M12 15v4"/><path d="m8 9 3 3 5-6"/></svg>';
};

const dimensionIcon = (key) => {
  const icons = {
    research_motivation: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M4.6 6.6l2.1 2.1M17.3 17.3l2.1 2.1M3 12h3M18 12h3M4.6 17.4l2.1-2.1M17.3 6.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/></svg>',
    problem_solved: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="3.2"/><path d="m8.2 12.2 2.7 2.7 5-5.8"/></svg>',
    phenomenon_analysis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-4 3 2 4-7"/></svg>',
    main_method: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6z"/><path d="M10 10h4M17 10v4"/></svg>',
    data_experiments: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10M9 4v5l-4 8a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-4-8V4"/><path d="M8 14h8"/></svg>',
    main_contributions: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 9.7 8l-5.4.6 4 3.7-1.1 5.3L12 15l4.8 2.6-1.1-5.3 4-3.7-5.4-.6L12 3Z"/></svg>'
  };
  return icons[key] ?? icons.main_contributions;
};

const categoryList = () => {
  const categories = new Map();
  papers.forEach((paper) => {
    const primary = getCategory(paper, 'primary');
    categories.set(primary, (categories.get(primary) ?? 0) + 1);
  });
  return Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
};

const setLanguageText = () => {
  const t = labels[currentLang];
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  els.i18n.forEach((node) => {
    const key = node.dataset.i18n;
    if (t[key]) node.textContent = t[key];
  });
  els.search.placeholder = t.search;
  els.reset.textContent = t.all;
  els.empty.textContent = t.noResults;
  els.count.textContent = `${papers.length} ${t.papers}`;
  updateCategoryToggleLabel();
};

const renderCategories = () => {
  const categories = categoryList();
  els.primaryList.innerHTML = categories.map(([primary, total], index) => `
      <button class="primary-button ${activePrimary === primary ? 'is-active' : ''}" type="button" data-primary-index="${index}">
        <span class="category-label"><span class="category-icon">${categoryIcon(primary)}</span><span>${escapeHtml(primary)}</span></span>
        <span class="category-count">${total}</span>
      </button>
    `).join('');
  updateCategoryToggleLabel();
};

els.primaryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-primary-index]');
  if (!button) return;
  const categories = categoryList();
  activePrimary = categories[Number(button.dataset.primaryIndex)]?.[0] ?? 'all';
  els.categoryPopover.hidden = true;
  render();
});

const updateCategoryToggleLabel = () => {
  if (!els.categoryToggleLabel) return;
  const t = labels[currentLang];
  els.categoryToggleLabel.textContent = activePrimary === 'all' ? t.categories : activePrimary;
};

const matchesPaper = (paper) => {
  const primary = getCategory(paper, 'primary');
  const analysis = getAnalysis(paper);
  const text = normalize([
    paper.title,
    paper.authors,
    paper.abstract,
    primary,
    ...Object.values(analysis)
  ].join(' '));

  return (!query || text.includes(query)) &&
    (activePrimary === 'all' || primary === activePrimary);
};

const renderPaper = (paper, index) => {
  const t = labels[currentLang];
  const analysis = getAnalysis(paper);
  const primary = getCategory(paper, 'primary');
  const dims = Object.entries(t.dimensions).map(([key, label]) => `
    <div class="analysis-item">
      <h3><span class="analysis-icon">${dimensionIcon(key)}</span><span>${escapeHtml(label)}</span></h3>
      <p>${escapeHtml(analysis[key] ?? '')}</p>
    </div>
  `).join('');

  return `
    <article class="paper-card">
      <a class="paper-title" href="${escapeHtml(paper.download_url)}" target="_blank" rel="noreferrer">${escapeHtml(paper.title)}</a>
      <p class="paper-authors">${escapeHtml(paper.authors)}</p>
      <div class="paper-tags">
        <span class="paper-tag">CVPR 2026</span>
        <span class="paper-tag">${escapeHtml(primary)}</span>
      </div>
      <div class="analysis-grid">${dims}</div>
      <div class="expand-panel" id="abstract-${index}" hidden>${escapeHtml(paper.abstract)}</div>
      <div class="expand-panel" id="bibtex-${index}" hidden>${escapeHtml(paper.bibtex)}</div>
      <div class="paper-actions">
        <button class="paper-action secondary" type="button" data-toggle="abstract-${index}">${t.abstract}</button>
        <button class="paper-action secondary" type="button" data-toggle="bibtex-${index}">${t.citation}</button>
        <a class="paper-action" href="${escapeHtml(paper.download_url)}" target="_blank" rel="noreferrer">${t.download}</a>
      </div>
    </article>
  `;
};

const renderPapers = () => {
  const filtered = papers.filter(matchesPaper);
  const t = labels[currentLang];
  els.grid.innerHTML = filtered.map(renderPaper).join('');
  els.empty.hidden = filtered.length !== 0;
  els.resultSummary.textContent = `${t.showing} ${filtered.length} / ${papers.length} ${t.papers}`;
  els.activeFilter.textContent = activePrimary === 'all' ? '' : `${t.active}: ${activePrimary}`;

  els.grid.querySelectorAll('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.dataset.toggle);
      if (panel) panel.hidden = !panel.hidden;
    });
  });
};

const render = () => {
  setLanguageText();
  renderCategories();
  renderPapers();
};

els.search.addEventListener('input', () => {
  query = normalize(els.search.value.trim());
  renderPapers();
});

els.reset.addEventListener('click', () => {
  activePrimary = 'all';
  els.categoryPopover.hidden = true;
  render();
});

els.categoryToggle.addEventListener('click', () => {
  els.categoryPopover.hidden = !els.categoryPopover.hidden;
  renderCategories();
});

document.addEventListener('click', (event) => {
  if (!els.categoryPopover.hidden && !event.target.closest('.cvpr-category-dropdown')) {
    els.categoryPopover.hidden = true;
  }
});

els.langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentLang = button.dataset.lang ?? 'en';
    activePrimary = 'all';
    els.langButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    render();
  });
});

let previousScrollY = window.scrollY;
const updateCvprHeader = () => {
  const currentScrollY = window.scrollY;
  const goingDown = currentScrollY > previousScrollY;
  document.body.classList.toggle('cvpr-nav-hidden', goingDown && currentScrollY > 120);
  previousScrollY = currentScrollY;
};

updateCvprHeader();
window.addEventListener('scroll', updateCvprHeader, { passive: true });

fetch('/assets/cvpr2026/cvpr2026meta.json')
  .then((response) => response.json())
  .then((data) => {
    papers = Array.isArray(data) ? data : [];
    render();
  })
  .catch(() => {
    els.resultSummary.textContent = 'Failed to load CVPR 2026 papers.';
  });
