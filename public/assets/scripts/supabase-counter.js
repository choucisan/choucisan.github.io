(() => {
  if (window.__onethreeCounterStarted) return;
  window.__onethreeCounterStarted = true;

  const config = {
    supabaseUrl: 'https://owdsphmfgxptpinffufn.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZHNwaG1mZ3hwdHBpbmZmdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjI5NjYsImV4cCI6MjA5NDI5ODk2Nn0.TXYVtvjdYrMYluKOiWJTbY9j0KhecOGiTfzfed8kx6A',
    ignoreLocal: false,
    sitePath: '__site__',
    rpcName: 'increment_page_counter',
    locationRpcName: 'record_visitor_location'
  };

  const pageTargets = Array.from(document.querySelectorAll('[data-page-views]'));
  const siteTargets = Array.from(document.querySelectorAll('[data-site-views]'));
  const hasDisplay = pageTargets.length > 0 || siteTargets.length > 0;
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  if (config.ignoreLocal && isLocalHost) return;

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);
  const normalizePath = () => {
    const explicitPath = pageTargets.find((target) => target.dataset.pageViewsPath)?.dataset.pageViewsPath;
    return explicitPath || window.location.pathname || '/';
  };

  const getVisitorId = () => {
    const key = 'onethree_visitor_id';
    try {
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(key, id);
      return id;
    } catch {
      return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  };

  const isConfigured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const rpcUrl = (name) => `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`;
  const rpcHeaders = {
    'Content-Type': 'application/json',
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`
  };

  const callRpc = async (name, body) => {
    const response = await fetch(rpcUrl(name), {
      method: 'POST',
      headers: rpcHeaders,
      body: JSON.stringify(body ?? {})
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`${name} failed: ${response.status} ${message}`);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };

  const getCachedGeo = () => {
    try {
      const raw = window.localStorage.getItem('onethree_geo_v1');
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (Date.now() - cached.savedAt > 24 * 60 * 60 * 1000) return null;
      return cached.geo;
    } catch {
      return null;
    }
  };

  const setCachedGeo = (geo) => {
    try {
      window.localStorage.setItem('onethree_geo_v1', JSON.stringify({ savedAt: Date.now(), geo }));
    } catch {
      // Location lookup is opportunistic.
    }
  };

  const normalizeGeo = (data, source) => {
    if (!data) return null;

    if (source === 'ipwho.is') {
      if (!data.success) return null;
      return {
        countryCode: data.country_code ?? null,
        countryName: data.country ?? null,
        region: data.region ?? null,
        city: data.city ?? null,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude)
      };
    }

    if (source === 'ipapi.co') {
      return {
        countryCode: data.country_code ?? null,
        countryName: data.country_name ?? null,
        region: data.region ?? null,
        city: data.city ?? null,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude)
      };
    }

    return {
      countryCode: data.country_code ?? null,
      countryName: data.country ?? data.country_name ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude)
    };
  };

  const isValidGeo = (geo) => (
    geo
    && Number.isFinite(geo.latitude)
    && Number.isFinite(geo.longitude)
    && geo.latitude >= -90
    && geo.latitude <= 90
    && geo.longitude >= -180
    && geo.longitude <= 180
  );

  const fetchJson = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Geo lookup failed: ${response.status}`);
    return response.json();
  };

  const fetchGeo = async () => {
    const cached = getCachedGeo();
    if (cached) return cached;

    const providers = [
      {
        source: 'ipwho.is',
        url: 'https://ipwho.is/?fields=success,country,country_code,region,city,latitude,longitude'
      },
      {
        source: 'ipapi.co',
        url: 'https://ipapi.co/json/'
      },
      {
        source: 'geojs.io',
        url: 'https://get.geojs.io/v1/ip/geo.json'
      }
    ];

    for (const provider of providers) {
      try {
        const geo = normalizeGeo(await fetchJson(provider.url), provider.source);
        if (isValidGeo(geo)) {
          setCachedGeo(geo);
          return geo;
        }
      } catch {
        // Try the next provider.
      }
    }

    return null;
  };

  const recordVisitorLocation = async () => {
    const visitorId = getVisitorId();
    const geo = await fetchGeo();
    if (!visitorId || !geo) return null;

    return callRpc(config.locationRpcName, {
      p_visitor_id: visitorId,
      p_country_code: geo.countryCode,
      p_country_name: geo.countryName,
      p_region: geo.region,
      p_city: geo.city,
      p_latitude: geo.latitude,
      p_longitude: geo.longitude
    });
  };

  window.OneThreeSupabase = {
    config,
    getVisitorId,
    formatNumber,
    callRpc,
    fetchGeo,
    recordVisitorLocation
  };

  const updatePageDisplay = (counter) => {
    pageTargets.forEach((target) => {
      const label = target.dataset.pageViewsLabel;
      target.textContent = label
        ? `${label} ${formatNumber(counter?.pv ?? 0)}`
        : `views ${formatNumber(counter?.pv ?? 0)}`;
      target.hidden = false;
    });
  };

  const updateSiteDisplay = (counter) => {
    siteTargets.forEach((target) => {
      target.textContent = `Site views ${formatNumber(counter?.pv ?? 0)} · Visitors ${formatNumber(counter?.uv ?? 0)}`;
      target.hidden = false;
    });
  };

  const callCounterRpc = async (path, title) => {
    const data = await callRpc(config.rpcName, {
      p_path: path,
      p_title: title,
      p_visitor_id: getVisitorId()
    });
    return Array.isArray(data) ? data[0] : data;
  };

  const track = async (path, title, display) => {
    const counter = await callCounterRpc(path, title);
    display?.(counter);
    return counter;
  };

  const run = async () => {
    if (!isConfigured()) {
      console.info('[OneThree] Supabase counter is not configured yet.');
      return;
    }

    try {
      const path = normalizePath();
      const title = document.title || path;
      await Promise.all([
        track(path, title, hasDisplay ? updatePageDisplay : undefined),
        track(config.sitePath, 'OneThree', siteTargets.length > 0 ? updateSiteDisplay : undefined)
      ]);

      recordVisitorLocation().catch((error) => {
        console.warn('[OneThree] Visitor location recording failed:', error);
      });
    } catch (error) {
      console.warn('[OneThree] Supabase counter failed:', error);
    }
  };

  run();
})();
