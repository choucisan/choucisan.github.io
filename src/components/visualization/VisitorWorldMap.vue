<template>
  <div class="visitor-vue-map" data-visitor-map>
    <button
      class="about-visitor-map-summary"
      type="button"
      :aria-expanded="isDetailsOpen ? 'true' : 'false'"
      @click="isDetailsOpen = !isDetailsOpen"
    >
      <span>{{ summary }}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 6l4 4 4-4" />
      </svg>
    </button>
    <WorldMap
      :dots="mapDots"
      :points="mapPoints"
      map-color="rgba(96, 132, 112, 0.22)"
      map-bg-color="transparent"
    />

    <ol v-if="isDetailsOpen && topLocations.length" class="about-visitor-map-list" aria-label="Top visitor cities">
      <li v-for="item in topLocations" :key="item.key">
        <span>{{ item.place }}</span>
        <strong>{{ formatNumber(item.visitors) }}</strong>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import WorldMap from './WorldMap.vue';

const SUPABASE_URL = 'https://owdsphmfgxptpinffufn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZHNwaG1mZ3hwdHBpbmZmdWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjI5NjYsImV4cCI6MjA5NDI5ODk2Nn0.TXYVtvjdYrMYluKOiWJTbY9j0KhecOGiTfzfed8kx6A';
const endpoint = `${SUPABASE_URL}/rest/v1/rpc`;
const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`
};

const locations = ref([]);
const summary = ref('Visitor map is loading.');
const isDetailsOpen = ref(false);

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value || 0);

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

const loadLocations = async () => {
  const data = await rpc('get_visitor_locations', { p_limit: 250 });
  locations.value = Array.isArray(data) ? data : [];
  const totalVisitors = locations.value.reduce((sum, item) => sum + Number(item.visitors || 0), 0);
  summary.value = locations.value.length
    ? `${formatNumber(totalVisitors)} visitors · ${formatNumber(locations.value.length)} cities`
    : 'Collecting city-level visitor signals.';
};

const normalizedLocations = computed(() => {
  const valid = locations.value
    .filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
    .slice(0, 120);

  return valid.map((item, index) => {
    const place = [item.city, item.country_name].filter(Boolean).join(', ') || 'Unknown location';
    return {
      ...item,
      key: `${item.country_code ?? 'xx'}-${item.city ?? index}`,
      label: [item.city, item.region, item.country_name].filter(Boolean).join(', ') || 'Unknown location',
      place,
      visitors: Number(item.visitors || 0),
      lat: Number(item.latitude),
      lng: Number(item.longitude),
      radius: 4.2
    };
  });
});

const mapPoints = computed(() => normalizedLocations.value.slice(0, 120));

const mapDots = computed(() => {
  const points = normalizedLocations.value;
  const hub = points[0];
  if (!hub || points.length < 2) return [];

  return points.slice(1, 11).map((point) => ({
    start: hub,
    end: point
  }));
});

const topLocations = computed(() => normalizedLocations.value.slice(0, 5));

onMounted(async () => {
  try {
    await window.OneThreeSupabase?.recordVisitorLocation?.();
  } catch (error) {
    console.warn('[OneThree] Visitor location recording failed:', error);
  }

  try {
    await loadLocations();
  } catch (error) {
    console.warn('[OneThree] Visitor map failed:', error);
    summary.value = 'Visitor map is unavailable.';
  }
});
</script>
