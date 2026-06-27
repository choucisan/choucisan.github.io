<template>
  <div class="visitor-vue-map-controls">
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

    <ol v-if="isDetailsOpen && allLocations.length" class="about-visitor-map-list" aria-label="Visitor cities">
      <li v-for="item in allLocations" :key="item.key">
        <span>{{ item.place }}</span>
        <strong>{{ formatNumber(item.visitors) }}</strong>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import {
  ensureVisitorMapLoaded,
  formatNumber,
  isDetailsOpen,
  normalizedLocations,
  summary
} from './visitorMapStore';

const allLocations = computed(() => normalizedLocations.value);

onMounted(() => {
  ensureVisitorMapLoaded();
});
</script>
