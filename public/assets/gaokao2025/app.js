(() => {
  const els = {
    province: document.querySelector('[data-gaokao-province]'),
    category: document.querySelector('[data-gaokao-category]'),
    batch: document.querySelector('[data-gaokao-batch]'),
    search: document.querySelector('[data-gaokao-search]'),
    query: document.querySelector('[data-gaokao-query]'),
    status: document.querySelector('[data-gaokao-status]'),
    rank: document.querySelector('[data-gaokao-rank]'),
    insights: document.querySelector('[data-gaokao-insights]'),
    panel: document.querySelector('[data-gaokao-panel]'),
    title: document.querySelector('[data-gaokao-results-title]'),
    count: document.querySelector('[data-gaokao-results-count]'),
    results: document.querySelector('[data-gaokao-results]'),
    empty: document.querySelector('[data-gaokao-empty]')
  };

  const state = {
    index: null,
    activeProvince: null,
    cache: new Map(),
    records: null,
    activePanel: null
  };

  const fmt = new Intl.NumberFormat('zh-CN');
  const compactFmt = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });
  const MAX_RESULTS = 80;

  const fileMap = {
    scoreRange: 'score-range',
    enrollmentPlan: 'enrollment-plan',
    schoolAdmission: 'school-admission',
    majorAdmission: 'major-admission'
  };

  const setStatus = (text) => {
    if (els.status) els.status.textContent = text;
  };

  const hideOverviewCards = () => {
    if (els.insights) els.insights.hidden = true;
  };

  const showOverviewCards = () => {
    if (els.insights) els.insights.hidden = false;
  };

  const num = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatNumber = (value, fallback = '暂无') => {
    const parsed = num(value);
    return parsed === null ? fallback : fmt.format(parsed);
  };

  const text = (value, fallback = '暂无') => {
    const result = String(value ?? '').trim();
    return result || fallback;
  };

  const normalize = (value) => String(value ?? '').toLowerCase().replace(/\s+/g, '');
  const normalizeGroup = (value) => normalize(value).replace(/[{}（）()]/g, '');
  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const option = (value, label = value) => {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = label;
    return item;
  };

  const populateSelect = (select, values, current, includeAll = false) => {
    if (!select) return;
    select.replaceChildren();
    if (includeAll) select.append(option('', '全部'));
    values.forEach((value) => select.append(option(value)));
    const hasCurrent = values.includes(current);
    select.value = hasCurrent ? current : includeAll ? '' : values[0] ?? '';
  };

  const parseCsv = (csvText) => {
    const cleaned = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < cleaned.length; i += 1) {
      const char = cleaned[i];
      const next = cleaned[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1;
        row.push(field);
        if (row.some((item) => item !== '')) rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }

    if (field || row.length) {
      row.push(field);
      if (row.some((item) => item !== '')) rows.push(row);
    }

    if (!rows.length) return [];
    const headers = rows.shift().map((header) => header.replace(/^\ufeff/, '').trim());
    return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
  };

  const fetchGzipCsv = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`无法加载数据文件：${url}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
    let csvText = '';

    if (isGzip) {
      if (!('DecompressionStream' in window)) {
        throw new Error('当前浏览器不支持直接读取 .csv.gz，请使用新版 Chrome、Edge 或 Safari。');
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      csvText = await new Response(stream).text();
    } else {
      csvText = new TextDecoder('utf-8').decode(bytes);
    }

    return parseCsv(csvText);
  };

  const loadProvince = async (province) => {
    if (state.cache.has(province.slug)) return state.cache.get(province.slug);
    const promise = (async () => {
      setStatus(`正在加载 ${province.name} 的录取明细数据...`);
      const load = async (key) => {
        const file = province.files?.[fileMap[key]];
        return file?.url ? fetchGzipCsv(file.url) : [];
      };
      const [scoreRange, enrollmentPlan, schoolAdmission, majorAdmission] = await Promise.all([
        load('scoreRange'),
        load('enrollmentPlan'),
        load('schoolAdmission'),
        load('majorAdmission')
      ]);
      return { scoreRange, enrollmentPlan, schoolAdmission, majorAdmission };
    })();
    state.cache.set(province.slug, promise);
    return promise;
  };

  const makePlanIndex = (plans) => {
    const index = new Map();
    plans.forEach((plan) => {
      const key = [
        plan.university_code,
        plan.university_name,
        normalizeGroup(plan.major_group),
        plan.major_code,
        normalize(plan.major_name)
      ].join('|');
      if (!index.has(key)) index.set(key, plan);
    });
    return index;
  };

  const planForAdmission = (admission, planIndex) => {
    const exactKey = [
      admission.university_code,
      admission.university_name,
      normalizeGroup(admission.major_group),
      admission.major_code,
      normalize(admission.major_name)
    ].join('|');
    if (planIndex.has(exactKey)) return planIndex.get(exactKey);

    const fallbackKey = [
      admission.university_code,
      admission.university_name,
      normalizeGroup(admission.major_group),
      '',
      normalize(admission.major_name)
    ].join('|');
    return planIndex.get(fallbackKey) ?? null;
  };

  const enrollmentProjectCount = (province, records = null, filters = null) => {
    if (records) {
      return uniquePlanProjectCount(records.enrollmentPlan.filter((row) => !filters || matchFilters(row, filters)));
    }
    return num(province.enrollmentComputed?.projectCount) ?? num(province.enrollmentStats?.major_count) ?? 0;
  };

  const enrollmentPeopleCount = (province) => {
    return num(province.enrollmentComputed?.knownPlanPeople);
  };

  const uniquePlanProjectCount = (rows) => new Set(rows.map((row) => [
    row.university_code,
    row.university_name,
    row.major_group,
    row.major_code,
    row.major_name,
    row.subject_req,
    row.batch
  ].join('|'))).size;

  const dedupeBy = (rows, getKey) => {
    const seen = new Set();
    return rows.filter((row) => {
      const key = getKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const universityName = (row) => text(row.university_name ?? row.name, '');

  const allUniversityRows = (records, filters = {}) => {
    const rows = [
      ...records.majorAdmission.filter((row) => matchFilters(row, filters)),
      ...records.schoolAdmission.filter((row) => matchFilters(row, filters)),
      ...records.enrollmentPlan.filter((row) => matchFilters(row, filters))
    ];
    return dedupeBy(rows, (row) => `${row.university_code || ''}|${universityName(row)}`)
      .sort((a, b) => universityName(a).localeCompare(universityName(b), 'zh-Hans-CN'));
  };

  const rowsToTable = (columns, rows, limit = 300) => `
    <div class="gaokao-table-wrap">
      <table class="gaokao-data-table">
        <thead>
          <tr>${columns.map((column) => `<th>${column.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.slice(0, limit).map((row) => `
            <tr>${columns.map((column) => `<td>${escapeHtml(column.value(row))}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const sparkline = (points) => {
    const raw = points
      .map((point) => ({
        score: num(point.score),
        count: num(point.segment_count ?? point.cumulative_count)
      }))
      .filter((point) => point.score !== null && point.count !== null)
      .slice()
      .sort((a, b) => a.score - b.score);

    if (raw.length < 2) return '<div class="gaokao-chart-empty">暂无可绘制的一分一段数据</div>';

    const width = 920;
    const height = 270;
    const padX = 46;
    const padTop = 28;
    const padBottom = 42;
    const smooth = raw.map((point, index) => {
      const window = raw.slice(Math.max(0, index - 2), Math.min(raw.length, index + 3));
      const average = window.reduce((sum, item) => sum + item.count, 0) / window.length;
      return { ...point, count: average };
    });
    const step = Math.max(1, Math.ceil(smooth.length / 120));
    const usable = smooth.filter((_, index) => index % step === 0 || index === smooth.length - 1);
    const minScore = Math.min(...usable.map((point) => point.score));
    const maxScore = Math.max(...usable.map((point) => point.score));
    const maxCount = Math.max(...usable.map((point) => point.count));
    const x = (score) => padX + ((score - minScore) / Math.max(1, maxScore - minScore)) * (width - padX * 2);
    const y = (count) => height - padBottom - (count / Math.max(1, maxCount)) * (height - padTop - padBottom);
    const coords = usable.map((point) => [x(point.score), y(point.count), point]);
    const linePath = coords.map(([cx, cy], index) => {
      if (index === 0) return `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
      const [px, py] = coords[index - 1];
      const midX = (px + cx) / 2;
      return `C${midX.toFixed(1)} ${py.toFixed(1)} ${midX.toFixed(1)} ${cy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }).join(' ');
    const baseline = height - padBottom;
    const areaPath = `${linePath} L${coords.at(-1)[0].toFixed(1)} ${baseline} L${coords[0][0].toFixed(1)} ${baseline} Z`;
    const peak = coords.reduce((best, item) => item[2].count > best[2].count ? item : best, coords[0]);
    const ticks = Array.from({ length: 5 }, (_, index) => {
      const value = Math.round(minScore + ((maxScore - minScore) * index) / 4);
      return { value, x: x(value) };
    });

    return `
      <svg class="gaokao-rank-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="一分一段折线图">
        <defs>
          <linearGradient id="gaokaoRankFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#386196" stop-opacity="0.24" />
            <stop offset="68%" stop-color="#6f9f86" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#faf9f1" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect class="gaokao-chart-bg" x="0" y="0" width="${width}" height="${height}" rx="22" />
        ${[0.25, 0.5, 0.75, 1].map((ratio) => {
          const gy = padTop + (height - padTop - padBottom) * ratio;
          return `<path class="gaokao-chart-grid" d="M${padX} ${gy.toFixed(1)}H${width - padX}" />`;
        }).join('')}
        <path class="gaokao-chart-axis" d="M${padX} ${baseline}H${width - padX}" />
        <path class="gaokao-chart-area" d="${areaPath}" />
        <path class="gaokao-chart-line" d="${linePath}" />
        <circle class="gaokao-chart-peak" cx="${peak[0].toFixed(1)}" cy="${peak[1].toFixed(1)}" r="5.2" />
        <text class="gaokao-chart-label" x="${peak[0].toFixed(1)}" y="${Math.max(18, peak[1] - 12).toFixed(1)}" text-anchor="middle">峰值 ${formatNumber(maxCount)}</text>
        ${ticks.map((tick) => `
          <g class="gaokao-chart-tick">
            <path d="M${tick.x.toFixed(1)} ${baseline}V${baseline + 6}" />
            <text x="${tick.x.toFixed(1)}" y="${height - 14}" text-anchor="middle">${tick.value}</text>
          </g>
        `).join('')}
        <text class="gaokao-chart-title" x="${padX}" y="22">单分人数分布</text>
      </svg>
    `;
  };

  const renderPanel = async (panelType) => {
    const province = state.activeProvince;
    if (!province || !els.panel || !els.insights) return;

    state.activePanel = panelType;
    hideOverviewCards();
    if (els.results) els.results.innerHTML = '';
    if (els.empty) els.empty.hidden = true;
    if (els.title) els.title.textContent = '正在查看数据面板';
    if (els.count) els.count.textContent = '';
    els.panel.hidden = false;
    els.panel.innerHTML = '<div class="gaokao-panel-loading">正在加载分析数据...</div>';

    const filters = currentFilters();
    const records = await loadProvince(province);
    state.records = records;

    const close = `
      <button class="gaokao-panel-back" type="button" data-gaokao-panel-back>
        <span aria-hidden="true">←</span>
        返回概览卡片
      </button>
    `;

    const panelHtml = {
      rank: () => {
        const rankRows = records.scoreRange
          .filter((row) => matchFilters(row, filters))
          .sort((a, b) => (num(b.score) ?? 0) - (num(a.score) ?? 0));
        const chartPoints = rankRows.map((row) => ({ score: row.score, segment_count: row.segment_count }));
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>一分一段</p>
            <h2>${province.name}${filters.category ? ` · ${filters.category}` : ''}${filters.batch ? ` · ${filters.batch}` : ''}</h2>
            <span>${formatNumber(rankRows.length, '0')} 个分数段</span>
          </div>
          ${sparkline(chartPoints)}
          ${rowsToTable([
            { label: '分数', value: (row) => row.score },
            { label: '分数段', value: (row) => row.score_range },
            { label: '本段人数', value: (row) => formatNumber(row.segment_count, '0') },
            { label: '累计人数', value: (row) => formatNumber(row.cumulative_count, '0') },
            { label: '位次范围', value: (row) => text(row.rank_range) },
            { label: '控制线', value: (row) => row.control_score ? `${row.control_score}分` : '暂无' }
          ], rankRows, 520)}
        `;
      },
      schools: () => {
        const rows = allUniversityRows(records, filters);
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>院校统计</p>
            <h2>${province.name}可检索院校明细</h2>
            <span>${formatNumber(rows.length, '0')} 所院校</span>
          </div>
          ${rowsToTable([
            { label: '院校', value: (row) => universityName(row) },
            { label: '所在地', value: (row) => text(row.school_province) },
            { label: '性质', value: (row) => text(row.school_nature) },
            { label: '985', value: (row) => String(row.is_985 ?? '') === '1' ? '是' : '否' },
            { label: '211', value: (row) => String(row.is_211 ?? '') === '1' ? '是' : '否' },
            { label: '院校代码', value: (row) => text(row.university_code) }
          ], rows, 500)}
        `;
      },
      lines: () => {
        const rows = province.admissionBands ?? [];
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>批次与分数线</p>
            <h2>${province.name}批次录取分数带</h2>
            <span>${formatNumber(rows.length, '0')} 个批次</span>
          </div>
          ${rowsToTable([
            { label: '批次', value: (row) => row.batch },
            { label: '记录数', value: (row) => formatNumber(row.count, '0') },
            { label: '最低分', value: (row) => formatNumber(row.min_score) },
            { label: '最高分', value: (row) => formatNumber(row.max_score) },
            { label: '中位分', value: (row) => formatNumber(row.median_score) }
          ], rows, 200)}
        `;
      },
      plan: () => {
        const rows = records.enrollmentPlan.filter((row) => matchFilters(row, filters));
        const uniqueProjects = uniquePlanProjectCount(rows);
        const people = rows.reduce((sum, row) => sum + (num(row.plan_count) ?? 0), 0);
        const knownRows = rows.filter((row) => (num(row.plan_count) ?? 0) > 0).length;
        const candidateCount = num(province.totalCandidates);
        const peopleNote = people
          ? `当前筛选下有 ${formatNumber(knownRows)} 条明细披露招生人数，合计 ${formatNumber(people)} 人${candidateCount ? `；本省考生人数为 ${formatNumber(candidateCount)} 人。两者是不同口径。` : '。'}`
          : '当前筛选下没有可直接汇总的招生人数，下表按招生计划 CSV 明细记录统计。';
        const grouped = Object.values(rows.reduce((acc, row) => {
          const key = `${row.university_code}|${row.university_name}`;
          acc[key] ??= { university_name: row.university_name, university_code: row.university_code, count: 0, planTotal: 0 };
          acc[key].count += 1;
          acc[key].planTotal += num(row.plan_count) ?? 0;
          return acc;
        }, {})).sort((a, b) => b.count - a.count);
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>招生计划</p>
            <h2>${province.name}招生计划明细最多的学校</h2>
            <span>${formatNumber(rows.length, '0')} 条 CSV 明细 · 去重约 ${formatNumber(uniqueProjects, '0')} 项</span>
          </div>
          <p class="gaokao-panel-note">${peopleNote} 下表“CSV 明细人数合计”按当前可见明细中的 plan_count 字段直接求和，可能与数据源汇总口径不同。</p>
          ${rowsToTable([
            { label: '院校', value: (row) => row.university_name },
            { label: '明细记录', value: (row) => `${formatNumber(row.count, '0')} 条` },
            { label: 'CSV 明细人数合计', value: (row) => row.planTotal ? `${formatNumber(row.planTotal)} 人` : '未披露' },
            { label: '院校代码', value: (row) => text(row.university_code) }
          ], grouped, 300)}
        `;
      },
      majors: () => {
        const rows = province.topMajors ?? [];
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>热门专业</p>
            <h2>${province.name}招生明细中的高频专业</h2>
            <span>${formatNumber(rows.length, '0')} 个专业</span>
          </div>
          ${rowsToTable([
            { label: '专业', value: (row) => row.name },
            { label: '出现次数', value: (row) => `${formatNumber(row.plan_count, '0')} 次` },
            { label: '覆盖院校', value: (row) => `${formatNumber(row.university_count, '0')} 所` }
          ], rows, 300)}
        `;
      },
      reference: () => {
        const majorRows = records.majorAdmission.filter((row) => matchFilters(row, filters) && num(row.min_score) !== null);
        const sorted = majorRows.slice().sort((a, b) => (num(b.min_score) ?? 0) - (num(a.min_score) ?? 0));
        return `
          ${close}
          <div class="gaokao-panel-head">
            <p>录取参考</p>
            <h2>分数、位次与专业录取线联动说明</h2>
            <span>${formatNumber(sorted.length, '0')} 条专业录取线</span>
          </div>
          <div class="gaokao-reference-grid">
            <article><strong>输入学校</strong><span>返回该学校在当前省份、类别、批次下的学校投档线、专业线和招生计划项目。</span></article>
            <article><strong>输入专业</strong><span>返回开设该专业的学校，适合横向比较专业组、最低分、位次和学费。</span></article>
            <article><strong>输入分数</strong><span>返回上下 10 分范围内的学校和专业，并显示你与最低分之间的差值。</span></article>
          </div>
          ${rowsToTable([
            { label: '院校', value: (row) => row.university_name },
            { label: '专业', value: (row) => row.major_name },
            { label: '最低分', value: (row) => `${row.min_score}分` },
            { label: '最低位次', value: (row) => row.min_rank ? `第${formatNumber(row.min_rank)}名` : '暂无' },
            { label: '批次', value: (row) => row.batch },
            { label: '选科', value: (row) => text(row.subject_req) }
          ], sorted.slice(0, 120), 120)}
        `;
      }
    }[panelType]?.();

    els.panel.innerHTML = panelHtml ?? `${close}<div class="gaokao-panel-loading">暂无数据</div>`;
    els.panel.querySelector('[data-gaokao-panel-back]')?.addEventListener('click', () => {
      state.activePanel = null;
      els.panel.hidden = true;
      els.panel.innerHTML = '';
      els.insights.hidden = false;
    });
  };

  const currentFilters = () => ({
    category: els.category?.value ?? '',
    batch: els.batch?.value ?? '',
    query: els.search?.value.trim() ?? ''
  });

  const matchFilters = (row, filters) => {
    const categoryOk = !filters.category || row.category === filters.category;
    const batchOk = !filters.batch || row.batch === filters.batch;
    return categoryOk && batchOk;
  };

  const findRank = (scoreRange, score, category, batch) => {
    const rows = scoreRange
      .filter((row) => (!category || row.category === category) && (!batch || row.batch === batch || !row.batch))
      .map((row) => ({ ...row, scoreNumber: num(row.score) }))
      .filter((row) => row.scoreNumber !== null);
    if (!rows.length) return null;
    rows.sort((a, b) => Math.abs(a.scoreNumber - score) - Math.abs(b.scoreNumber - score));
    return rows[0];
  };

  const isNumericQuery = (query) => /^\d{2,3}$/.test(query);

  const classifyQuery = (query) => {
    if (!query) return 'empty';
    if (isNumericQuery(query)) return 'score';
    if (/大学|学院|学校|校区|职业|师范|医科|理工|中学|院$/.test(query)) return 'school';
    return 'major';
  };

  const buildResults = (records, filters) => {
    const queryType = classifyQuery(filters.query);
    const q = normalize(filters.query);
    const score = num(filters.query);
    const planIndex = makePlanIndex(records.enrollmentPlan.filter((row) => matchFilters(row, filters)));
    const majorRows = records.majorAdmission.filter((row) => matchFilters(row, filters));
    const schoolRows = records.schoolAdmission.filter((row) => matchFilters(row, filters));
    const planRows = records.enrollmentPlan.filter((row) => matchFilters(row, filters));

    if (queryType === 'empty') {
      return {
        queryType,
        rows: majorRows
          .slice()
          .sort((a, b) => (num(b.min_score) ?? -1) - (num(a.min_score) ?? -1))
          .slice(0, 24)
          .map((row) => ({ type: 'major', admission: row, plan: planForAdmission(row, planIndex) }))
      };
    }

    if (queryType === 'score' && score !== null) {
      const inBand = (row) => {
        const minScore = num(row.min_score);
        return minScore !== null && Math.abs(minScore - score) <= 10;
      };
      const rows = [
        ...majorRows.filter(inBand).map((row) => ({ type: 'major', admission: row, plan: planForAdmission(row, planIndex) })),
        ...schoolRows.filter(inBand).map((row) => ({ type: 'school', admission: row, plan: null }))
      ]
        .sort((a, b) => Math.abs((num(a.admission.min_score) ?? score) - score) - Math.abs((num(b.admission.min_score) ?? score) - score))
        .slice(0, MAX_RESULTS);
      return { queryType, rows, score };
    }

    if (queryType === 'school') {
      const rows = [
        ...majorRows
          .filter((row) => normalize(row.university_name).includes(q))
          .map((row) => ({ type: 'major', admission: row, plan: planForAdmission(row, planIndex) })),
        ...schoolRows
          .filter((row) => normalize(row.university_name).includes(q))
          .map((row) => ({ type: 'school', admission: row, plan: null })),
        ...planRows
          .filter((row) => normalize(row.university_name).includes(q))
          .map((row) => ({ type: 'plan', admission: null, plan: row }))
      ].slice(0, MAX_RESULTS);
      return { queryType, rows };
    }

    const rows = [
      ...majorRows
        .filter((row) => normalize(`${row.major_name}${row.major_note}${row.university_name}`).includes(q))
        .map((row) => ({ type: 'major', admission: row, plan: planForAdmission(row, planIndex) })),
      ...planRows
        .filter((row) => normalize(`${row.major_name}${row.major_note}${row.university_name}`).includes(q))
        .map((row) => ({ type: 'plan', admission: null, plan: row }))
    ].slice(0, MAX_RESULTS);
    return { queryType, rows };
  };

  const statLine = (label, value) => `
    <span class="gaokao-stat-line">
      <span>${label}</span>
      <strong>${value}</strong>
    </span>
  `;

  const renderInsights = (province) => {
    if (!els.insights) return;
    const meta = province;
    const university = meta.universityStats ?? {};
    const enrollment = meta.enrollmentStats ?? {};
    const categories = meta.categories ?? [];
    const categoryOverviews = meta.examOverview?.categories ?? [];
    const batchLines = (meta.scoreDistribution ?? []).length;
    const lineItems = (meta.admissionBands ?? []).slice(0, 4);
    const topMajors = (meta.topMajors ?? []).slice(0, 5);
    const topSchools = (meta.enrollmentComputed?.topUniversities ?? []).slice(0, 5);
    const batchStats = Object.entries(enrollment.by_batch ?? {}).slice(0, 5);
    const projectCount = enrollmentProjectCount(meta);
    const peopleCount = enrollmentPeopleCount(meta);
    const detailRows = num(meta.enrollmentComputed?.detailRows);
    const knownRows = num(meta.enrollmentComputed?.knownPlanCountRows);
    const topSchoolValue = (item) => `${formatNumber(item.project_count ?? item.detail_rows, '0')} 项`;

    const cards = [
      {
        type: 'rank',
        title: '考生与位次',
        icon: 'rank',
        value: meta.totalCandidates ? `${compactFmt.format(meta.totalCandidates)} 人` : '等待补充',
        body: categories.length
          ? categories.map((name) => statLine(name, `${formatNumber(categoryOverviews.find((item) => item.name === name)?.total_candidates, '暂无')} 人`)).join('')
          : statLine('省内一分一段', batchLines ? `${batchLines} 组分布` : '暂无'),
        detail: '点击查看一分一段折线和完整位次表。'
      },
      {
        type: 'schools',
        title: '院校统计',
        icon: 'school',
        value: `${formatNumber(university.total, '0')} 所`,
        body: [
          statLine('985', formatNumber(university.is_985, '0')),
          statLine('211', formatNumber(university.is_211, '0')),
          statLine('公办', formatNumber(university.public, '0')),
          statLine('民办', formatNumber(university.private, '0'))
        ].join(''),
        detail: '点击查看可检索院校名称、所在地、性质和 985/211 标记。'
      },
      {
        type: 'lines',
        title: '批次与分数线',
        icon: 'line',
        value: `${(meta.batches ?? []).length} 个批次`,
        body: lineItems.length
          ? lineItems.map((item) => statLine(text(item.batch), `${formatNumber(item.min_score ?? item.score, '暂无')} 分`)).join('')
          : (meta.batches ?? []).slice(0, 5).map((batch) => statLine(batch, '可检索')).join(''),
        detail: '点击查看各批次最低分、最高分、中位分和记录数。'
      },
      {
        type: 'plan',
        title: '招生计划',
        icon: 'plan',
        value: `${formatNumber(projectCount, '0')} 个招生项目`,
        body: topSchools.length
          ? [
              detailRows ? statLine('CSV 明细记录', `${formatNumber(detailRows)} 条`) : '',
              peopleCount ? statLine('已披露人数合计', `${formatNumber(peopleCount)} 人`) : '',
              knownRows ? statLine('披露人数明细', `${formatNumber(knownRows)} 条`) : '',
              ...topSchools.slice(0, 2).map((item) => statLine(item.name, topSchoolValue(item)))
            ].join('')
          : batchStats.map(([name]) => statLine(name, '可查看')).join(''),
        detail: peopleCount
          ? '点击查看招生计划明细最多的学校；人数只统计 CSV 中明确披露 plan_count 的记录。'
          : '点击查看招生计划明细最多的学校；该省份未披露具体计划人数，面板按 CSV 明细记录统计。'
      },
      {
        type: 'majors',
        title: '热门专业',
        icon: 'major',
        value: `${formatNumber(enrollment.major_count, '0')} 个专业`,
        body: topMajors.map((item) => statLine(item.name, `${formatNumber(item.university_count, '0')} 校`)).join(''),
        detail: '点击查看招生计划明细中的高频专业和覆盖院校数量。'
      },
      {
        type: 'reference',
        title: '录取参考',
        icon: 'compass',
        value: '冲稳保联动',
        body: [
          statLine('学校检索', '看专业组'),
          statLine('专业检索', '比院校'),
          statLine('分数检索', '±10 分'),
          statLine('关联字段', '位次 / 计划 / 学费')
        ].join(''),
        detail: '点击查看分数、位次、专业线和计划字段如何联动使用。'
      }
    ];

    els.insights.innerHTML = cards.map((card) => `
      <article class="gaokao-insight-card" tabindex="0" role="button" data-panel-type="${card.type}">
        <div class="gaokao-insight-top">
          <span class="gaokao-insight-icon" aria-hidden="true">${iconSvg(card.icon)}</span>
          <span>${card.title}</span>
        </div>
        <strong>${card.value}</strong>
        <div class="gaokao-insight-body">${card.body || statLine('暂无', '等待数据')}</div>
        <p class="gaokao-insight-detail">${card.detail}</p>
      </article>
    `).join('');

    els.insights.querySelectorAll('.gaokao-insight-card').forEach((card) => {
      const toggle = () => {
        renderPanel(card.dataset.panelType);
      };
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  };

  const iconSvg = (name) => {
    const icons = {
      rank: '<svg viewBox="0 0 24 24"><path d="M5 19V9m7 10V5m7 14v-7"/><path d="M3 19h18"/></svg>',
      school: '<svg viewBox="0 0 24 24"><path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/></svg>',
      line: '<svg viewBox="0 0 24 24"><path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-7"/></svg>',
      plan: '<svg viewBox="0 0 24 24"><path d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
      major: '<svg viewBox="0 0 24 24"><path d="M12 4v16"/><path d="M6 8h12"/><path d="M7 8c0 6 5 6 5 12 0-6 5-6 5-12"/></svg>',
      compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m15 9-2 5-5 2 2-5 5-2Z"/></svg>'
    };
    return icons[name] ?? icons.compass;
  };

  const badge = (label, className = '') => label ? `<span class="gaokao-badge ${className}">${label}</span>` : '';

  const renderResultCard = (item, filters) => {
    const row = item.admission ?? item.plan ?? {};
    const plan = item.plan ?? {};
    const university = text(row.university_name ?? plan.university_name);
    const major = text(row.major_name ?? plan.major_name, item.type === 'school' ? '学校投档线' : '专业待补充');
    const minScore = row.min_score ? `${row.min_score} 分` : '暂无分数';
    const minRank = row.min_rank ? `第 ${formatNumber(row.min_rank)} 名` : '暂无位次';
    const planCount = plan.plan_count ? `${formatNumber(plan.plan_count)} 人` : row.admit_count ? `录取 ${formatNumber(row.admit_count)} 人` : '暂无计划';
    const tuition = plan.tuition ? `${formatNumber(plan.tuition)} 元/年` : '学费暂无';
    const nature = row.school_nature ?? '';
    const scoreDiff = row.score_diff ? `超线 ${row.score_diff} 分` : '';
    const userScore = isNumericQuery(filters.query) ? num(filters.query) : null;
    const delta = userScore !== null && row.min_score ? userScore - num(row.min_score) : null;

    return `
      <article class="gaokao-result-card">
        <div class="gaokao-result-main">
          <div>
            <p class="gaokao-result-school">${university}</p>
            <h3>${major}</h3>
          </div>
          <div class="gaokao-score-box">
            <span>${minScore}</span>
            <strong>${minRank}</strong>
          </div>
        </div>
        <div class="gaokao-result-badges">
          ${badge(text(row.batch ?? plan.batch, '批次暂无'))}
          ${badge(text(row.category ?? plan.category, '类别暂无'))}
          ${badge(text(row.subject_req ?? plan.subject_req, '选科不限'))}
          ${nature ? badge(nature, 'is-nature') : ''}
          ${String(row.is_985 ?? '') === '1' ? badge('985', 'is-elite') : ''}
          ${String(row.is_211 ?? '') === '1' ? badge('211', 'is-elite') : ''}
        </div>
        <dl class="gaokao-result-facts">
          <div><dt>专业组</dt><dd>${text(row.major_group ?? plan.major_group)}</dd></div>
          <div><dt>招生计划</dt><dd>${planCount}</dd></div>
          <div><dt>学费</dt><dd>${tuition}</dd></div>
          <div><dt>院校所在地</dt><dd>${text(row.school_province)}</dd></div>
          <div><dt>分差参考</dt><dd>${scoreDiff || (delta === null ? '暂无' : `${delta >= 0 ? '+' : ''}${delta} 分`)}</dd></div>
          <div><dt>专业代码</dt><dd>${text(row.major_code ?? plan.major_code)}</dd></div>
        </dl>
        ${row.major_note || plan.major_note ? `<p class="gaokao-result-note">${text(row.major_note ?? plan.major_note)}</p>` : ''}
      </article>
    `;
  };

  const renderResults = (payload, records, filters) => {
    if (!els.results || !els.title || !els.count) return;

    state.activePanel = null;
    hideOverviewCards();
    if (els.panel) {
      els.panel.hidden = true;
      els.panel.innerHTML = '';
    }

    const rank = payload.score !== undefined ? findRank(records.scoreRange, payload.score, filters.category, filters.batch) : null;
    if (els.rank) {
      els.rank.textContent = rank
        ? `你的 ${payload.score} 分约对应 ${text(rank.rank_range, `累计 ${formatNumber(rank.cumulative_count)} 名`)}`
        : '';
    }

    const titleByType = {
      empty: '当前筛选下的高分录取参考',
      score: `${payload.score} 分上下 10 分的学校和专业`,
      school: `与“${filters.query}”相关的学校录取信息`,
      major: `与“${filters.query}”相关的专业录取信息`
    };
    els.title.textContent = titleByType[payload.queryType] ?? '查询结果';
    els.count.textContent = `${payload.rows.length} 条结果`;
    els.results.innerHTML = payload.rows.map((item) => renderResultCard(item, filters)).join('');
    els.empty.hidden = payload.rows.length > 0;
  };

  const runQuery = async () => {
    const province = state.activeProvince;
    if (!province) return;
    try {
      els.query.disabled = true;
      hideOverviewCards();
      const filters = currentFilters();
      const records = await loadProvince(province);
      state.records = records;
      const payload = buildResults(records, filters);
      renderResults(payload, records, filters);
      setStatus(`${province.name} 数据已加载：专业录取 ${formatNumber(records.majorAdmission.length, '0')} 条，学校投档 ${formatNumber(records.schoolAdmission.length, '0')} 条，招生计划 ${formatNumber(records.enrollmentPlan.length, '0')} 条。`);
    } catch (error) {
      setStatus(`查询失败：${error.message}。请确认已运行 npm run dev 或 npm run build 同步数据。`);
    } finally {
      els.query.disabled = false;
    }
  };

  const updateProvince = () => {
    const slug = els.province?.value;
    const province = state.index?.provinces.find((item) => item.slug === slug) ?? state.index?.provinces[0];
    if (!province) return;
    state.activeProvince = province;
    populateSelect(els.category, province.categories ?? [], els.category?.value, true);
    populateSelect(els.batch, province.batches ?? [], els.batch?.value, true);
    renderInsights(province);
    state.activePanel = null;
    if (els.panel) {
      els.panel.hidden = true;
      els.panel.innerHTML = '';
    }
    showOverviewCards();
    if (els.rank) els.rank.textContent = '';
    if (els.title) els.title.textContent = `${province.name} 2025 高考录取数据`;
    if (els.count) els.count.textContent = '输入关键词开始查询';
    if (els.results) els.results.innerHTML = '';
    if (els.empty) els.empty.hidden = true;
    setStatus(`${province.name} 已就绪。选择类别和批次后，可输入学校、专业或分数查询。`);
  };

  const init = async () => {
    try {
      const response = await fetch('/assets/gaokao2025/index.json');
      if (!response.ok) throw new Error('无法加载高考数据索引，请先运行 npm run build 同步数据。');
      state.index = await response.json();
      populateSelect(els.province, state.index.provinces.map((province) => province.slug), '', false);
      Array.from(els.province.options).forEach((item) => {
        const province = state.index.provinces.find((entry) => entry.slug === item.value);
        item.textContent = province?.name ?? item.value;
      });
      const defaultProvince = state.index.provinces.find((province) => province.slug === 'anhui') ?? state.index.provinces[0];
      if (defaultProvince) els.province.value = defaultProvince.slug;
      updateProvince();
    } catch (error) {
      setStatus(error.message);
    }
  };

  els.province?.addEventListener('change', updateProvince);
  els.category?.addEventListener('change', runQuery);
  els.batch?.addEventListener('change', runQuery);
  els.query?.addEventListener('click', runQuery);
  els.search?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') runQuery();
  });

  init();
})();
