(() => {
  const config = {
    supabaseUrl: 'https://owdsphmfgxptpinffufn.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZHNwaG1mZ3hwdHBpbmZmdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjI5NjYsImV4cCI6MjA5NDI5ODk2Nn0.TXYVtvjdYrMYluKOiWJTbY9j0KhecOGiTfzfed8kx6A',
    ignoreLocal: false,
    sitePath: '__site__',
    rpcName: 'increment_page_counter'
  };

  const pageTargets = Array.from(document.querySelectorAll('[data-page-views]'));
  const siteTargets = Array.from(document.querySelectorAll('[data-site-views]'));
  const hasDisplay = pageTargets.length > 0 || siteTargets.length > 0;
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  if (config.ignoreLocal && isLocalHost) return;

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);
  const normalizePath = () => window.location.pathname || '/';

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

  const updatePageDisplay = (counter) => {
    pageTargets.forEach((target) => {
      target.textContent = `views ${formatNumber(counter?.pv ?? 0)}`;
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
    const url = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${config.rpcName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`
      },
      body: JSON.stringify({
        p_path: path,
        p_title: title,
        p_visitor_id: getVisitorId()
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase counter failed: ${response.status} ${message}`);
    }
    const data = await response.json();
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
    } catch (error) {
      console.warn('[OneThree] Supabase counter failed:', error);
    }
  };

  run();
})();
