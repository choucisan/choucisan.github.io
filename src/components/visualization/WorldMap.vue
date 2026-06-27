<template>
  <svg class="visitor-vue-map-svg" viewBox="-36 -22 1072 544" role="img" aria-label="City-level visitor world map">
    <defs>
      <clipPath v-if="activeTooltip" id="visitorVueTooltipClip">
        <rect
          :x="activeTooltip.clipX"
          :y="activeTooltip.clipY"
          :width="activeTooltip.clipWidth"
          height="36"
          rx="8"
          ry="8"
        />
      </clipPath>
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
        :class="['visitor-vue-map-arc', `is-${arc.mode}`]"
        :d="arc.path"
        :initial="{ pathLength: 1, opacity: arc.opacity, pathOffset: 0 }"
        :animate="{ pathLength: 1, opacity: arc.opacity, pathOffset: -1 }"
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
        <circle
          :class="['visitor-vue-map-dot', { 'is-active': activeKey === dot.key }]"
          :cx="dot.x"
          :cy="dot.y"
          :r="dot.radius"
          @mouseenter="$emit('activatePoint', dot.key)"
          @click="$emit('activatePoint', dot.key)"
        >
          <title>{{ dot.label }}</title>
        </circle>
      </template>
    </g>

    <g v-if="activeTooltip" class="visitor-vue-map-tooltip" :transform="activeTooltip.transform">
      <rect :width="activeTooltip.width" height="54" rx="14" ry="14" />
      <g clip-path="url(#visitorVueTooltipClip)">
        <text x="12" y="19">{{ activeTooltip.city }}</text>
        <text x="12" y="35" class="visitor-vue-map-tooltip-country">{{ activeTooltip.country }}</text>
      </g>
      <text :x="activeTooltip.countX" y="35" class="visitor-vue-map-tooltip-count">{{ activeTooltip.count }}</text>
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
  },
  activeKey: {
    type: String,
    default: ''
  }
});

defineEmits(['activatePoint', 'clearActivePoint']);

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
      mode: dot.mode ?? 'ambient',
      opacity: dot.mode === 'active' ? 0.92 : 0.34,
      path: `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${controlX.toFixed(2)} ${controlY.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`
    };
  }));

const pointDots = computed(() => {
  const seen = new Map();

  props.points.forEach((point) => {
    const coordinateKey = `${point.lat}-${point.lng}`;
    if (!seen.has(coordinateKey)) {
      const [x, y] = project(point);
      seen.set(coordinateKey, {
        ...point,
        key: point.key ?? coordinateKey,
        renderKey: coordinateKey,
        x,
        y,
        radius: point.radius ?? 4.2,
        label: point.label ?? 'Visitor location'
      });
    }
  });

  props.dots.forEach((dot) => {
    [dot.start, dot.end].forEach((point) => {
      if (point.isHub) return;
      const coordinateKey = `${point.lat}-${point.lng}`;
      if (!seen.has(coordinateKey)) {
        const [x, y] = project(point);
        seen.set(coordinateKey, {
          ...point,
          key: point.key ?? coordinateKey,
          renderKey: coordinateKey,
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

const activeTooltip = computed(() => {
  if (!props.activeKey) return null;
  const point = pointDots.value.find((item) => item.key === props.activeKey);
  if (!point) return null;

  const city = point.city || point.place || 'Unknown location';
  const country = point.country_name || point.country || '';
  const count = `${point.visitors} ${point.visitors === 1 ? 'visitor' : 'visitors'}`;
  const countWidth = count.length * 6.2 + 18;
  const textWidth = Math.max(city.length, country.length) * 6.8;
  const width = Math.min(330, Math.max(190, textWidth + countWidth + 30));
  const x = Math.min(1036 - width, Math.max(-24, point.x + 12));
  const y = Math.min(430, Math.max(-18, point.y - 66));

  return {
    width,
    clipX: 10,
    clipY: 9,
    clipWidth: Math.max(96, width - countWidth - 24),
    countX: width - countWidth + 4,
    transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
    city,
    country,
    count
  };
});
</script>
