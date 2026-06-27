<template>
  <div class="visitor-vue-map" data-visitor-map>
    <div class="visitor-vue-map-stage">
      <WorldMap
        :dots="mapDots"
        :points="mapPoints"
        :active-key="activeLocationKey"
        map-color="rgba(96, 132, 112, 0.22)"
        map-bg-color="transparent"
        @activate-point="setActiveLocation"
        @clear-active-point="setActiveLocation('')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import WorldMap from './WorldMap.vue';
import {
  activeLocationKey,
  ensureVisitorMapLoaded,
  normalizedLocations,
  setActiveLocation
} from './visitorMapStore';

const mapPoints = computed(() => normalizedLocations.value);
const ambientIndex = ref(0);
let ambientTimer;

const mapHub = {
  key: 'onethree-hub',
  label: 'OneThree, China',
  place: 'OneThree',
  visitors: 0,
  lat: 31.2304,
  lng: 121.4737,
  radius: 2.4,
  isHub: true
};

const mapDots = computed(() => {
  const points = normalizedLocations.value;
  if (!points.length) return [];

  const activePoint = points.find((point) => point.key === activeLocationKey.value);
  if (activePoint) {
    return [{
      start: mapHub,
      end: activePoint,
      mode: 'active'
    }];
  }

  const index = ambientIndex.value % points.length;
  return [points[index]].filter(Boolean).map((point) => ({
    start: mapHub,
    end: point,
    mode: 'ambient'
  }));
});

onMounted(() => {
  ensureVisitorMapLoaded();
  ambientTimer = window.setInterval(() => {
    ambientIndex.value += 1;
  }, 4200);
});

onUnmounted(() => {
  if (ambientTimer) {
    window.clearInterval(ambientTimer);
  }
});
</script>
