import fs from 'node:fs/promises';
import path from 'node:path';

const outputPath = path.join(process.cwd(), 'src', 'data', 'about-stats.json');
const envLocalPath = path.join(process.cwd(), '.env.local');

const config = {
  githubUser: 'choucisan',
  huggingFaceUser: 'choucsan',
  xiaohongshuProfiles: [
    {
      profile: 'https://www.xiaohongshu.com/user/profile/624aab39000000001000d3bc',
      userId: '624aab39000000001000d3bc'
    }
  ]
};

const readExisting = async () => {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return {};
  }
};

const loadLocalEnv = async () => {
  try {
    const content = await fs.readFile(envLocalPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // Optional local secrets file.
  }
};

const timeoutSignal = (ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
};

const fetchText = async (url, { timeout = 15000, headers = {} } = {}) => {
  const timer = timeoutSignal(timeout);
  try {
    const response = await fetch(url, {
      signal: timer.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
        ...headers
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    timer.clear();
  }
};

const fetchJson = async (url, options) => JSON.parse(await fetchText(url, options));

const mapWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current], current);
    }
  });
  await Promise.all(runners);
  return results;
};

const formatMaybeNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const raw = String(value).trim().replace(/,/g, '');
  const number = Number.parseFloat(raw.replace(/[万千kK+]/g, ''));
  if (!Number.isFinite(number)) return null;
  if (raw.includes('万')) return Math.round(number * 10000);
  if (raw.includes('千')) return Math.round(number * 1000);
  if (/[kK]/.test(raw)) return Math.round(number * 1000);
  return Math.round(number);
};

const compactNumber = (value) => {
  if (typeof value !== 'number') return null;
  return new Intl.NumberFormat('en-US').format(value);
};

const envNumber = (name) => {
  const raw = process.env[name];
  if (!raw) return null;
  const value = formatMaybeNumber(raw);
  if (value === null) {
    console.warn(`[about-stats] Ignored invalid ${name}: ${raw}`);
  }
  return value;
};

const fetchGitHubStats = async () => {
  let page = 1;
  let stars = 0;
  let repos = 0;

  while (page < 100) {
    const url = `https://api.github.com/users/${config.githubUser}/repos?per_page=100&type=owner&page=${page}`;
    const data = await fetchJson(url, {
      timeout: 15000,
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!Array.isArray(data) || data.length === 0) break;
    repos += data.length;
    stars += data.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    if (data.length < 100) break;
    page += 1;
  }

  return {
    stars,
    repos,
    source: `https://github.com/${config.githubUser}?tab=repositories`
  };
};

const extractHuggingFaceTotalDownloads = (html) => {
  const patterns = [
    /"totalDownloads"\s*:\s*(\d+)/i,
    /"total_downloads"\s*:\s*(\d+)/i,
    /"allTimeDownloads"\s*:\s*(\d+)/i,
    /"downloadsAllTime"\s*:\s*(\d+)/i,
    /Total\s+downloads[\s\S]{0,600}?([0-9][0-9,.\s]*[kKmM万千]?)/i,
    /All[-\s]time\s+downloads[\s\S]{0,600}?([0-9][0-9,.\s]*[kKmM万千]?)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = match ? formatMaybeNumber(match[1]) : null;
    if (value !== null) return value;
  }

  return null;
};

const fetchHuggingFaceSettingsDownloads = async (repoId, kind) => {
  if (!process.env.HF_TOKEN) return null;
  const prefix = kind === 'datasets' ? 'datasets/' : '';
  const html = await fetchText(`https://huggingface.co/${prefix}${repoId}/settings`, {
    timeout: 25000,
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`
    }
  });
  return extractHuggingFaceTotalDownloads(html);
};

const fetchHuggingFaceCollection = async (kind) => {
  const endpoint = kind === 'models' ? 'models' : 'datasets';
  const urls = [
    `https://huggingface.co/api/${endpoint}?author=${config.huggingFaceUser}&limit=1000&full=true`,
    `https://hf-mirror.com/api/${endpoint}?author=${config.huggingFaceUser}&limit=1000&full=true`
  ];

  let data;
  let lastError;
  for (const url of urls) {
    try {
      data = await fetchJson(url, { timeout: 25000 });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!data) throw lastError ?? new Error(`Unable to fetch Hugging Face ${endpoint}.`);
  if (!Array.isArray(data)) return { monthlyDownloads: 0, totalDownloads: null, projects: 0 };

  let totalDownloads = null;
  if (process.env.HF_TOKEN) {
    const repoIds = data.map((item) => item.id ?? item.modelId ?? item.datasetId).filter(Boolean);
    const settingsDownloads = await mapWithConcurrency(repoIds, 3, async (repoId) => {
      try {
        return await fetchHuggingFaceSettingsDownloads(repoId, endpoint);
      } catch (error) {
        console.warn(`[about-stats] Hugging Face settings fetch failed for ${repoId}: ${error.message}`);
        return null;
      }
    });
    const knownDownloads = settingsDownloads.filter((value) => typeof value === 'number');
    if (knownDownloads.length > 0) {
      totalDownloads = knownDownloads.reduce((sum, value) => sum + value, 0);
    }
  }

  return {
    monthlyDownloads: data.reduce((sum, item) => sum + (item.downloads || 0), 0),
    totalDownloads,
    projects: data.length
  };
};

const fetchHuggingFaceStats = async () => {
  const [models, datasets] = await Promise.all([
    fetchHuggingFaceCollection('models'),
    fetchHuggingFaceCollection('datasets')
  ]);
  const monthlyDownloads = models.monthlyDownloads + datasets.monthlyDownloads;
  const totalDownloads = envNumber('HF_TOTAL_DOWNLOADS') ?? (
    typeof models.totalDownloads === 'number' || typeof datasets.totalDownloads === 'number'
      ? (models.totalDownloads ?? 0) + (datasets.totalDownloads ?? 0)
      : null
  );

  return {
    downloads: totalDownloads,
    totalDownloads,
    monthlyDownloads,
    projects: models.projects + datasets.projects,
    source: `https://huggingface.co/${config.huggingFaceUser}`,
    monthlySource: `https://huggingface.co/api/datasets?author=${config.huggingFaceUser}&limit=1000&full=true`
  };
};

const decodeEscaped = (value) => String(value)
  .replace(/\\u002F/g, '/')
  .replace(/\\u0026/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .trim();

const extractInitialState = (html) => {
  const match = html.match(/window\.__INITIAL_STATE__=([\s\S]*?)<\/script>/);
  if (!match) return null;
  const normalized = match[1]
    .replace(/:undefined/g, ':null')
    .replace(/\bundefined\b/g, 'null');
  try {
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

const collectNoteCards = (value, cards = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectNoteCards(item, cards));
  } else if (value && typeof value === 'object') {
    if (value.noteCard && typeof value.noteCard === 'object') cards.push(value.noteCard);
    if (value.interactInfo && (value.noteId || value.id || value.displayTitle || value.title)) cards.push(value);
    Object.values(value).forEach((item) => collectNoteCards(item, cards));
  }
  return cards;
};

const normalizeNoteCard = (card) => {
  if (!card || typeof card !== 'object') return null;
  const interactInfo = card.interactInfo ?? card.interact_info ?? {};
  const noteId = card.noteId ?? card.note_id ?? card.id ?? card.noteCard?.noteId ?? null;
  const xsecToken = card.xsecToken ?? card.xsec_token ?? card.noteCard?.xsecToken ?? null;
  const title = decodeEscaped(card.displayTitle ?? card.title ?? card.desc ?? 'untitled');
  const liked = formatMaybeNumber(card.liked ?? interactInfo.likedCount ?? interactInfo.liked_count ?? interactInfo.likes);
  const collected = formatMaybeNumber(
    card.collected ??
    card.collectedCount ??
    card.collectCount ??
    card.collect_count ??
    interactInfo.collectedCount ??
    interactInfo.collectCount ??
    interactInfo.collected_count ??
    interactInfo.collect_count ??
    interactInfo.collects
  );

  if (!noteId && liked === null && collected === null) return null;

  return {
    noteId,
    xsecToken,
    title,
    liked,
    collected,
    url: noteId
      ? `https://www.xiaohongshu.com/explore/${noteId}${xsecToken ? `?xsec_token=${encodeURIComponent(xsecToken)}&xsec_source=pc_user` : ''}`
      : null
  };
};

const uniqueNotes = (cards) => {
  const seen = new Set();
  return cards
    .map(normalizeNoteCard)
    .filter(Boolean)
    .filter((note) => {
      const token = note.noteId ?? note.xsecToken ?? note.url ?? note.title;
      if (!token || seen.has(token)) return false;
      seen.add(token);
      return true;
    });
};

const summarizeNotes = (notes) => {
  const seen = new Set();
  let likes = 0;
  let collects = 0;
  let postsWithLikes = 0;
  let postsWithCollects = 0;

  for (const note of notes) {
    const token = note.noteId ?? note.xsecToken ?? note.url ?? note.title;
    if (seen.has(token)) continue;
    seen.add(token);
    if (note.liked !== null) {
      likes += note.liked;
      postsWithLikes += 1;
    }
    if (note.collected !== null) {
      collects += note.collected;
      postsWithCollects += 1;
    }
  }

  const countedPosts = Math.max(postsWithLikes, postsWithCollects);
  if (countedPosts > 0) {
    return {
      likes,
      collects: postsWithCollects > 0 ? collects : null,
      likesAndCollects: likes + (postsWithCollects > 0 ? collects : 0),
      visiblePosts: seen.size,
      countedPosts,
      hasCompleteCollects: postsWithCollects >= postsWithLikes
    };
  }

  return null;
};

const notesFromHtml = (html) => {
  const state = extractInitialState(html);
  const cards = state ? collectNoteCards(state.user?.notes ?? state) : [];
  const notes = uniqueNotes(cards);
  if (notes.length > 0) return notes;

  const values = Array.from(html.matchAll(/"likedCount":"([^"<>]+)"/g), (match) => formatMaybeNumber(match[1]))
    .filter((value) => value !== null);
  if (values.length > 0) {
    return values.map((liked, index) => ({
      noteId: null,
      xsecToken: null,
      title: `post-${index + 1}`,
      liked,
      collected: null,
      url: null
    }));
  }

  return [];
};

const fetchXiaohongshuPostedApi = async ({ userId }) => {
  const notes = [];
  let cursor = '';
  let hasMore = true;
  let page = 0;

  while (hasMore && page < 20) {
    const params = new URLSearchParams({
      num: '30',
      cursor,
      user_id: userId,
      image_formats: 'jpg,webp,avif',
      xsec_source: 'pc_user'
    });
    const data = await fetchJson(`https://edith.xiaohongshu.com/api/sns/web/v1/user_posted?${params}`, {
      timeout: 16000,
      headers: {
        Referer: `https://www.xiaohongshu.com/user/profile/${userId}`,
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });

    if (data?.success === false || data?.code === -1) throw new Error(data?.msg ?? 'Xiaohongshu posted API rejected request.');
    const pageNotes = data?.data?.notes ?? data?.data?.note_list ?? [];
    notes.push(...uniqueNotes(pageNotes));
    hasMore = Boolean(data?.data?.has_more ?? data?.data?.hasMore);
    cursor = data?.data?.cursor ?? data?.data?.lastCursor ?? '';
    if (!pageNotes.length || !cursor) break;
    page += 1;
  }

  return notes;
};

const fetchNoteDetail = async (note) => {
  if (!note.url && !note.noteId) return note;
  const urls = [
    note.url,
    note.noteId ? `https://www.xiaohongshu.com/discovery/item/${note.noteId}` : null
  ].filter(Boolean);

  for (const url of urls) {
    try {
      const html = await fetchText(url, {
        timeout: 12000,
        headers: {
          Referer: 'https://www.xiaohongshu.com/',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      });
      const detailNotes = notesFromHtml(html);
      const matched = detailNotes.find((item) => note.noteId && item.noteId === note.noteId) ?? detailNotes[0];
      if (matched && (matched.liked !== null || matched.collected !== null)) {
        return { ...note, ...matched, url: note.url ?? matched.url };
      }
    } catch {
      // Detail pages are best-effort; profile cards still provide a stable fallback.
    }
  }

  return note;
};

const fetchXiaohongshuStats = async () => {
  const allNotes = [];

  for (const profile of config.xiaohongshuProfiles) {
    let profileNotes = [];

    try {
      profileNotes = await fetchXiaohongshuPostedApi(profile);
    } catch {
      profileNotes = [];
    }

    if (profileNotes.length === 0) {
      const html = await fetchText(profile.profile, {
        timeout: 22000,
        headers: {
          Referer: 'https://www.xiaohongshu.com/',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      });
      profileNotes = notesFromHtml(html);
    }

    const detailNotes = await mapWithConcurrency(profileNotes, 4, fetchNoteDetail);
    allNotes.push(...detailNotes);
  }

  const summed = summarizeNotes(uniqueNotes(allNotes));
  if (!summed) throw new Error('Unable to parse Xiaohongshu post interactions.');

  return {
    ...summed,
    display: '',
    source: config.xiaohongshuProfiles[0].profile,
    strategy: 'post-sum'
  };
};

const keepOrDefault = (value, fallback) => value ?? fallback;

const keepManualDisplay = (nextValue, existingValue) => {
  const merged = keepOrDefault(nextValue, existingValue);
  if (!merged || typeof merged !== 'object') return merged;
  return {
    ...merged,
    display: existingValue?.display ?? merged.display ?? ''
  };
};

const keepManualHuggingFaceTotal = (nextValue, existingValue) => {
  const merged = keepOrDefault(nextValue, existingValue);
  if (!merged || typeof merged !== 'object') return merged;

  const existingTotal = existingValue?.totalDownloads ?? existingValue?.downloads ?? null;
  const totalDownloads = merged.totalDownloads ?? existingTotal;

  return {
    ...merged,
    downloads: totalDownloads,
    totalDownloads
  };
};

const run = async () => {
  await loadLocalEnv();
  const existing = await readExisting();
  const [githubResult, huggingFaceResult, xiaohongshuResult] = await Promise.allSettled([
    fetchGitHubStats(),
    fetchHuggingFaceStats(),
    fetchXiaohongshuStats()
  ]);

  const next = {
    updatedAt: new Date().toISOString(),
    github: keepOrDefault(
      githubResult.status === 'fulfilled' ? githubResult.value : undefined,
      existing.github ?? { stars: null, repos: null, source: `https://github.com/${config.githubUser}?tab=repositories` }
    ),
    huggingface: keepManualHuggingFaceTotal(
      huggingFaceResult.status === 'fulfilled' ? huggingFaceResult.value : undefined,
      existing.huggingface ?? { downloads: null, projects: null, source: `https://huggingface.co/${config.huggingFaceUser}` }
    ),
    xiaohongshu: keepManualDisplay(
      xiaohongshuResult.status === 'fulfilled' ? xiaohongshuResult.value : undefined,
      existing.xiaohongshu ?? { likesAndCollects: null, visiblePosts: null, display: null, source: config.xiaohongshuProfiles[0].profile }
    )
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(next, null, 2)}\n`);

  for (const [name, result] of [
    ['GitHub', githubResult],
    ['Hugging Face', huggingFaceResult],
    ['Xiaohongshu', xiaohongshuResult]
  ]) {
    if (result.status === 'rejected') {
      console.warn(`[about-stats] ${name} update failed; kept cached value. ${result.reason?.message ?? result.reason}`);
    }
  }

  console.log('[about-stats] Updated cache:', JSON.stringify(next));
};

run().catch((error) => {
  console.warn(`[about-stats] Unexpected failure; build will continue. ${error.message}`);
});
