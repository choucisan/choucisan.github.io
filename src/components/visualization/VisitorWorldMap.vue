<template>
  <div class="visitor-vue-map" data-visitor-map>
    <div class="visitor-vue-map-stage">
      <WorldMap
        :dots="mapDots"
        :points="mapPoints"
        map-color="rgba(96, 132, 112, 0.22)"
        map-bg-color="transparent"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import WorldMap from './WorldMap.vue';
import { ensureVisitorMapLoaded, normalizedLocations } from './visitorMapStore';

const mapPoints = computed(() => normalizedLocations.value);

const mapDots = computed(() => {
  const points = normalizedLocations.value;
  const hub = points[0];
  if (!hub || points.length < 2) return [];

  return points.slice(1).map((point) => ({
    start: hub,
    end: point
  }));
});

onMounted(() => {
  ensureVisitorMapLoaded();
});
</script>
