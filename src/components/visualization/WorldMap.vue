<template>
  <svg class="visitor-vue-map-svg" viewBox="-36 -22 1072 544" role="img" aria-label="City-level visitor world map">
    <defs>
      <radialGradient id="visitorVueGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(111, 159, 134, 0.82)" />
        <stop offset="100%" stop-color="rgba(111, 159, 134, 0)" />
      </radialGradient>
      <linearGradient id="visitorVueArc" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="rgba(111, 159, 134, 0.18)" />
        <stop offset="46%" stop-color="rgba(111, 159, 134, 0.48)" />
        <stop offset="100%" stop-color="rgba(111, 159, 134, 0.86)" />
      </linearGradient>
    </defs>

    <rect x="-36" y="-22" width="1072" height="544" :fill="mapBgColor" opacity="0" />

    <g class="visitor-vue-map-land">
      <path
        v-for="feature in landFeatures"
        :key="feature.id ?? feature.properties?.name"
        :d="pathGenerator(feature) ?? ''"
        :fill="mapColor"
      />
    </g>

    <g class="visitor-vue-map-arcs">
      <Motion
        v-for="arc in renderedDots"
        :key="arc.key"
        as="path"
        :d="arc.path"
        :initial="{ pathLength: 1, opacity: 0.84, pathOffset: 0 }"
        :animate="{ pathLength: 1, opacity: 0.96, pathOffset: -1 }"
        :transition="{ duration: 4.8, repeat: Infinity, ease: 'linear', delay: arc.index * 0.18 }"
      />
    </g>

    <g class="visitor-vue-map-points">
      <template v-for="dot in pointDots" :key="dot.key">
        <Motion
          as="circle"
          class="visitor-vue-map-pulse"
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.radius * 0.7"
          :initial="{ scale: 1, opacity: 0.22 }"
          :animate="{ scale: 1.2, opacity: 0.42 }"
          :transition="{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', delay: dot.index * 0.08 }"
        />
        <Motion
          as="circle"
          class="visitor-vue-map-dot"
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.radius"
          :initial="{ scale: 1, opacity: 1 }"
          :animate="{ scale: 1, opacity: 1 }"
          :transition="{ duration: 0.45, delay: dot.index * 0.08 }"
        >
          <title>{{ dot.label }}</title>
        </Motion>
      </template>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
import { Motion } from 'motion-v';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'world-atlas/countries-110m.json';

const props = defineProps({
  dots: {
    type: Array,
    default: () => []
  },
  points: {
    type: Array,
    default: () => []
  },
  mapColor: {
    type: String,
    default: 'rgba(96, 132, 112, 0.22)'
  },
  mapBgColor: {
    type: String,
    default: 'transparent'
  }
});

const world = feature(countries, countries.objects.countries);
const landFeatures = world.features;
const projection = geoNaturalEarth1()
  .scale(174)
  .translate([500, 247]);
const pathGenerator = geoPath(projection);

const project = ({ lat, lng }) => projection([Number(lng), Number(lat)]) ?? [0, 0];

const renderedDots = computed(() => props.dots
  .map((dot, index) => {
    const [sx, sy] = project(dot.start);
    const [ex, ey] = project(dot.end);
    const lift = Math.max(34, Math.min(130, Math.abs(ex - sx) * 0.22));
    const controlX = (sx + ex) / 2;
    const controlY = Math.min(sy, ey) - lift;
    return {
      ...dot,
      index,
      key: `${dot.start.lat}-${dot.start.lng}-${dot.end.lat}-${dot.end.lng}-${index}`,
      path: `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`
    };
  }));

const pointDots = computed(() => {
  const seen = new Map();

  props.points.forEach((point) => {
    const key = `${point.lat}-${point.lng}`;
    if (!seen.has(key)) {
      const [x, y] = project(point);
      seen.set(key, {
        ...point,
        key,
        x,
        y,
        radius: point.radius ?? 4.2,
        label: point.label ?? 'Visitor location'
      });
    }
  });

  props.dots.forEach((dot) => {
    [dot.start, dot.end].forEach((point) => {
      const key = `${point.lat}-${point.lng}`;
      if (!seen.has(key)) {
        const [x, y] = project(point);
        seen.set(key, {
          ...point,
          key,
          x,
          y,
          radius: point.radius ?? 4.2,
          label: point.label ?? 'Visitor location'
        });
      }
    });
  });

  return Array.from(seen.values()).map((point, index) => ({ ...point, index }));
});
</script>
