import { computed, ref } from 'vue';

const SUPABASE_URL = 'https://owdsphmfgxptpinffufn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZHNwaG1mZ3hwdHBpbmZmdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjI5NjYsImV4cCI6MjA5NDI5ODk2Nn0.TXYVtvjdYrMYluKOiWJTbY9j0KhecOGiTfzfed8kx6A';
const endpoint = `${SUPABASE_URL}/rest/v1/rpc`;
const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
};

export const locations = ref([]);
export const summary = ref('Visitor map is loading.');
export const isDetailsOpen = ref(false);
export const activeLocationKey = ref('');

let loadPromise;

export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

const toTitleCase = (value) => String(value ?? '')
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeCountryName = (countryCode, countryName) => {
  const code = String(countryCode ?? '').trim().toUpperCase();
  const country = String(countryName ?? '').trim();
  if (code === 'CN') return 'China';
  if (code === 'SG') return 'Singapore';
  if (code === 'US') return 'United States';
  if (code === 'JP') return 'Japan';
  return country || '';
};

const normalizeChineseCity = (region, city) => {
  const regionKey = String(region ?? '').trim().toLowerCase();
  const cityKey = String(city ?? '').trim().toLowerCase();
  const combined = `${regionKey} ${cityKey}`;

  const municipalityMap = [
    ['Beijing', ['beijing', 'xicheng', 'chaowai', 'dongcheng', 'chaoyang', 'haidian', 'fengtai', 'shijingshan', 'tongzhou']],
    ['Shanghai', ['shanghai', 'pudong', 'huangpu', 'xuhui', 'changning', 'jingan', 'minhang', 'baoshan']],
    ['Tianjin', ['tianjin', 'heping', 'nankai', 'hexi', 'binhai']],
    ['Chongqing', ['chongqing', 'yuzhong', 'jiangbei', 'yubei', 'shapingba']]
  ];

  for (const [name, aliases] of municipalityMap) {
    if (aliases.some((alias) => combined.includes(alias))) return name;
  }

  const directMap = [
    ['Shenzhen', ['shenzhen', 'shenzhen shi']],
    ['Guangzhou', ['guangzhou', 'guangzhou shi']],
    ['Hangzhou', ['hangzhou', 'hangzhou shi']],
    ['Nanjing', ['nanjing', 'nanjing shi']],
    ['Suzhou', ['suzhou', 'suzhou shi']],
    ['Chengdu', ['chengdu', 'chengdu shi']],
    ['Wuhan', ['wuhan', 'wuhan shi']],
    ['Xi’an', ["xi'an", 'xian', 'xian shi']],
    ['Changsha', ['changsha', 'changsha shi']],
    ['Zhengzhou', ['zhengzhou', 'zhengzhou shi']],
    ['Qingdao', ['qingdao', 'qingdao shi']],
    ['Xiamen', ['xiamen', 'xiamen shi']]
  ];

  for (const [name, aliases] of directMap) {
    if (aliases.some((alias) => combined.includes(alias))) return name;
  }

  return toTitleCase(String(city || region || '').replace(/\s+shi$/i, ''));
};

const normalizeLocation = (item) => {
  const countryCode = String(item.country_code ?? '').trim().toUpperCase();
  const countryName = normalizeCountryName(countryCode, item.country_name);
  const city = countryCode === 'CN'
    ? normalizeChineseCity(item.region, item.city)
    : toTitleCase(String(item.city || item.region || '').replace(/\s+shi$/i, ''));
  const region = countryCode === 'CN' ? city : toTitleCase(item.region || city);

  return {
    ...item,
    country_code: countryCode,
    country_name: countryName,
    region,
    city
  };
};

const rpc = async (name, body) => {
  if (window.OneThreeSupabase?.callRpc) {
    return window.OneThreeSupabase.callRpc(name, body);
  }

  const response = await fetch(`${endpoint}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {})
  });
  if (!response.ok) {
    throw new Error(`${name} failed: ${response.status} ${await response.text()}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const refreshSummary = () => {
  const totalVisitors = locations.value.reduce((sum, item) => sum + Number(item.visitors || 0), 0);
  summary.value = locations.value.length
    ? `${formatNumber(totalVisitors)} visitors · ${formatNumber(locations.value.length)} cities`
    : 'Collecting city-level visitor signals.';
};

export const normalizedLocations = computed(() => {
  const valid = locations.value
    .filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)));

  return valid.map((rawItem, index) => {
    const item = normalizeLocation(rawItem);
    const place = [item.city, item.country_name].filter(Boolean).join(', ') || 'Unknown location';
    return {
      ...item,
      key: `${item.country_code ?? 'xx'}-${item.city ?? index}`,
      label: [item.city, item.region, item.country_name].filter(Boolean).join(', ') || 'Unknown location',
      place,
      visitors: Number(item.visitors || 0),
      lat: Number(item.latitude),
      lng: Number(item.longitude),
      radius: 3.2
    };
  });
});

export const setActiveLocation = (key) => {
  activeLocationKey.value = key ?? '';
};

export const ensureVisitorMapLoaded = async () => {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      await window.OneThreeSupabase?.recordVisitorLocation?.();
    } catch (error) {
      console.warn('[OneThree] Visitor location recording failed:', error);
    }

    try {
      const data = await rpc('get_visitor_locations', { p_limit: 500 });
      locations.value = Array.isArray(data) ? data : [];
      refreshSummary();
    } catch (error) {
      console.warn('[OneThree] Visitor map failed:', error);
      summary.value = 'Visitor map is unavailable.';
    }
  })();

  return loadPromise;
};
