<template>
  <main class="lab-page" lang="zh-CN">
    <section class="lab-hero container">
      <div class="lab-intro">
        <a class="detail-back" href="/workshops/">← Workshops</a>
        <p class="lab-eyebrow">LAB SAFETY · QUESTION EXPLORER</p>
        <h1>北邮实验室安全<span>考试题库</span></h1>
        <p class="lab-lede">从一个关键词开始，把安全知识查清楚。<br />浏览题干、对照选项，按需展开参考答案。</p>
        <div class="lab-hero-links">
          <span><i aria-hidden="true"></i> 关键词在本地检索</span>
          <a :href="dataUrl" download="lab-safety.csv.gz">下载题库 CSV.GZ <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <aside class="lab-overview" aria-label="题库概览">
        <div class="lab-overview-top"><span>QUESTION BANK</span><span class="lab-format">CSV.GZ</span></div>
        <div class="lab-total"><strong>{{ countLabel(counts.all) }}</strong><span>道题目</span></div>
        <div class="lab-distribution" role="img" :aria-label="`单选题 ${counts.single} 道，多选题 ${counts.multiple} 道`">
          <span :style="{ width: `${singlePercentage}%` }"></span>
        </div>
        <div class="lab-breakdown">
          <div><span class="lab-dot single"></span>单选题 <strong>{{ countLabel(counts.single) }}</strong></div>
          <div><span class="lab-dot multiple"></span>多选题 <strong>{{ countLabel(counts.multiple) }}</strong></div>
        </div>
        <p>14 个源文件 · 单选题与多选题</p>
      </aside>
    </section>

    <section class="lab-workspace container" aria-label="题库搜索与浏览">
      <div class="lab-controls">
        <label class="lab-search" for="lab-safety-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          <span class="lab-sr-only">搜索题干、选项或题号</span>
          <input id="lab-safety-search" v-model="query" type="search" placeholder="搜索题干、选项或题号，如：灭火器、用电、化学品" autocomplete="off" />
          <span class="lab-search-hint" aria-hidden="true">关键词检索</span>
        </label>
        <div class="lab-filter-row">
          <div class="lab-filters" role="group" aria-label="按题型筛选">
            <button v-for="filter in filters" :key="filter.value" type="button" :class="{ active: selectedType === filter.value }" :aria-pressed="selectedType === filter.value" @click="selectedType = filter.value">
              {{ filter.label }} <span>{{ countLabel(counts[filter.count]) }}</span>
            </button>
          </div>
          <label class="lab-answer-switch"><input v-model="showAllAnswers" type="checkbox" />展开所有答案</label>
        </div>
        <p class="lab-search-note">支持多个关键词，用空格分隔；结果需同时包含所有关键词。</p>
      </div>

      <div ref="resultsHeader" class="lab-results-head" tabindex="-1">
        <h2>题目列表 <span v-if="!loading && !error">{{ filteredQuestions.length.toLocaleString('zh-CN') }}</span></h2>
        <p role="status" aria-live="polite" aria-atomic="true">
          <template v-if="loading">正在加载压缩题库…</template>
          <template v-else-if="error">题库暂不可用</template>
          <template v-else-if="filteredQuestions.length">第 {{ startIndex + 1 }}–{{ Math.min(startIndex + pageSize, filteredQuestions.length) }} 题 · 共 {{ totalPages }} 页</template>
          <template v-else>没有匹配的题目</template>
        </p>
      </div>

      <div v-if="loading" class="lab-state" role="status"><span class="lab-spinner" aria-hidden="true"></span><h3>正在打开题库</h3><p>首次加载后，搜索与筛选都在浏览器本地完成。</p></div>
      <div v-else-if="error" class="lab-state" role="alert"><h3>题库加载失败</h3><p>{{ error }}</p><button type="button" @click="loadQuestions">重新加载</button></div>
      <div v-else-if="!filteredQuestions.length" class="lab-state"><span class="lab-empty-icon" aria-hidden="true">⌕</span><h3>没有找到匹配题目</h3><p>试试更短的关键词，或切换到全部题型。</p><button type="button" @click="resetFilters">清除搜索和筛选</button></div>

      <div v-else class="lab-question-list">
        <article v-for="question in visibleQuestions" :key="question.id" class="lab-question">
          <div class="lab-question-meta"><span class="lab-question-number">#{{ question.id.padStart(4, '0') }}</span><span class="lab-type" :class="{ multiple: question.type === '多选题' }">{{ question.type }}</span></div>
          <h3><template v-for="(part, partIndex) in highlightParts(question.text)" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></h3>
          <ul class="lab-options" aria-label="选项">
            <li v-for="option in question.options" :key="option.key" :class="{ correct: isAnswerVisible(question.id) && question.answers.includes(option.key) }">
              <span class="lab-option-key">{{ option.key }}</span>
              <span><template v-for="(part, partIndex) in highlightParts(option.text)" :key="partIndex"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
              <span v-if="isAnswerVisible(question.id) && question.answers.includes(option.key)" class="lab-correct-label">正确选项</span>
            </li>
          </ul>
          <div class="lab-question-footer">
            <span class="lab-source" :title="question.sources.join('、')">原始资料 · {{ question.sources.length }} 个源文件</span>
            <button v-if="!showAllAnswers" type="button" :aria-expanded="isAnswerVisible(question.id)" :aria-controls="`lab-answer-${question.id}`" :aria-label="`${isAnswerVisible(question.id) ? '收起' : '查看'}第 ${question.id} 题答案`" @click="toggleAnswer(question.id)">{{ isAnswerVisible(question.id) ? '收起答案 −' : '查看答案 +' }}</button>
            <span v-else class="lab-expanded-label">答案已展开</span>
          </div>
          <div v-if="isAnswerVisible(question.id)" :id="`lab-answer-${question.id}`" class="lab-answer"><span>参考答案</span><strong>{{ question.answers.join('、') }}</strong><small>答案来自原始题库</small></div>
        </article>
      </div>

      <nav v-if="!loading && !error && totalPages > 1" class="lab-pagination" aria-label="题库分页">
        <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">← 上一页</button>
        <div class="lab-page-numbers">
          <template v-for="(page, pageIndex) in pageNumbers" :key="pageIndex"><span v-if="page === null" aria-hidden="true">…</span><button v-else type="button" :class="{ active: currentPage === page }" :aria-label="`前往第 ${page} 页`" :aria-current="currentPage === page ? 'page' : undefined" @click="changePage(page)">{{ page }}</button></template>
        </div>
        <button type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页 →</button>
      </nav>
      <noscript><p class="lab-state">请启用 JavaScript 使用关键词检索，也可以通过上方链接下载 CSV.GZ 题库。</p></noscript>
      <section class="lab-credits" aria-labelledby="lab-credits-title">
        <h2 id="lab-credits-title">致谢与数据来源</h2>
        <p>感谢 KY-zhang-X 开源分享的 <a href="https://github.com/KY-zhang-X/bupt-lab-safety" target="_blank" rel="noreferrer">KY-zhang-X/bupt-lab-safety</a> 项目。</p>
        <p>本题库数据来源于该项目的 data 目录，共收录 2,796 道题目。本页面为非官方学习工具，仅提供数据整理与可视化检索。</p>
        <p>本页为原始题库整理，仅供学习自测，答案未经专业核验。实际实验操作请遵循学校现行安全规范与专业指导。</p>
        <p>如有问题，欢迎通过邮箱联系：<a href="mailto:choucisan@gmail.com">choucisan@gmail.com</a>。</p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
import { parseQuestionCsv } from '../../lib/lab-safety.js';

const props = defineProps({ dataUrl: { type: String, required: true } });
const questions = shallowRef([]);
const query = ref('');
const selectedType = ref('all');
const currentPage = ref(1);
const showAllAnswers = ref(false);
const openedAnswers = ref(new Set());
const loading = ref(true);
const error = ref('');
const resultsHeader = ref(null);
const pageSize = 20;
let controller;

const filters = [
  { value: 'all', label: '全部题目', count: 'all' },
  { value: '单选题', label: '单选题', count: 'single' },
  { value: '多选题', label: '多选题', count: 'multiple' }
];
const counts = computed(() => ({
  all: questions.value.length,
  single: questions.value.filter((question) => question.type === '单选题').length,
  multiple: questions.value.filter((question) => question.type === '多选题').length
}));
const singlePercentage = computed(() => counts.value.all ? counts.value.single / counts.value.all * 100 : 75);
const terms = computed(() => [...new Set(query.value.trim().toLowerCase().split(/\s+/u).filter(Boolean))]);
const highlightPattern = computed(() => [...terms.value].sort((first, second) => second.length - first.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
const filteredQuestions = computed(() => questions.value.filter((question) =>
  (selectedType.value === 'all' || question.type === selectedType.value)
  && terms.value.every((term) => question.searchText.includes(term))
));
const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / pageSize));
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const visibleQuestions = computed(() => filteredQuestions.value.slice(startIndex.value, startIndex.value + pageSize));
const pageNumbers = computed(() => {
  const candidates = [...new Set([1, totalPages.value, currentPage.value - 1, currentPage.value, currentPage.value + 1])]
    .filter((page) => page >= 1 && page <= totalPages.value).sort((first, second) => first - second);
  const pages = [];
  candidates.forEach((page, index) => {
    if (index && page - candidates[index - 1] > 1) pages.push(null);
    pages.push(page);
  });
  return pages;
});

function countLabel(count) {
  return loading.value || error.value ? '—' : count.toLocaleString('zh-CN');
}

function highlightParts(text) {
  if (!highlightPattern.value) return [{ text, match: false }];
  const parts = [];
  let position = 0;
  for (const match of text.matchAll(new RegExp(highlightPattern.value, 'giu'))) {
    if (match.index > position) parts.push({ text: text.slice(position, match.index), match: false });
    parts.push({ text: match[0], match: true });
    position = match.index + match[0].length;
  }
  if (position < text.length) parts.push({ text: text.slice(position), match: false });
  return parts;
}

function isAnswerVisible(id) {
  return showAllAnswers.value || openedAnswers.value.has(id);
}

function toggleAnswer(id) {
  const next = new Set(openedAnswers.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  openedAnswers.value = next;
}

function resetFilters() {
  query.value = '';
  selectedType.value = 'all';
}

async function changePage(page) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value));
  openedAnswers.value = new Set();
  await nextTick();
  resultsHeader.value?.focus({ preventScroll: true });
  resultsHeader.value?.scrollIntoView({ block: 'start' });
}

async function loadQuestions() {
  loading.value = true;
  error.value = '';
  controller = new AbortController();
  try {
    const response = await fetch(props.dataUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`题库下载失败（HTTP ${response.status}），请稍后重试。`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    let csv;
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持 gzip 解压，请更新浏览器或下载题库后查看。');
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      csv = await new Response(stream).text();
    } else {
      csv = new TextDecoder().decode(bytes);
    }
    const parsed = parseQuestionCsv(csv);
    if (!parsed.length) throw new Error('题库文件中没有题目，请检查数据文件。');
    questions.value = parsed;
  } catch (cause) {
    if (cause.name !== 'AbortError') error.value = cause.message || '网络连接异常，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

watch([query, selectedType], () => {
  currentPage.value = 1;
  openedAnswers.value = new Set();
});
onMounted(loadQuestions);
onUnmounted(() => controller?.abort());
</script>

<style scoped>
.lab-page { padding: 132px 0 44px; }
.lab-hero { display: grid; grid-template-columns: 1.4fr 1fr; align-items: center; gap: 64px; padding-bottom: 44px; }
.lab-intro .detail-back { display: inline-block; margin-bottom: 30px; }
.lab-eyebrow { color: var(--blue); font-size: 11px; font-weight: 700; letter-spacing: 0.17em; margin: 0 0 14px; }
h1 { font-size: clamp(36px, 4.2vw, 52px); letter-spacing: -0.04em; line-height: 1.2; margin: 0; font-weight: 650; }
h1 span { display: block; color: var(--blue); }
.lab-lede { margin: 22px 0; color: var(--muted); font-size: 14px; line-height: 1.9; }
.lab-hero-links { display: flex; flex-wrap: wrap; gap: 12px 22px; font-size: 12px; }
.lab-hero-links > span { color: var(--muted); display: inline-flex; align-items: center; gap: 7px; }
.lab-hero-links i { width: 6px; height: 6px; border-radius: 50%; background: #548777; }
.lab-hero-links a { color: var(--blue); font-weight: 600; }
.lab-overview { border: 1px solid rgba(255, 255, 255, 0.85); border-radius: 24px; padding: 28px; background: rgba(255, 255, 255, 0.48); box-shadow: 0 18px 45px rgba(55, 88, 116, 0.06); }
.lab-overview-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 10px; letter-spacing: 0.12em; color: var(--blue); font-weight: 650; }
.lab-format { background: #e1eaf2; padding: 5px 8px; border-radius: 6px; font-size: 9px; }
.lab-total { display: flex; align-items: baseline; flex-wrap: wrap; gap: 14px; margin: 24px 0 20px; }
.lab-total strong { font-size: 62px; letter-spacing: -0.06em; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.lab-total > span { color: var(--muted); font-size: 12px; }
.lab-distribution { background: #b6cbd9; height: 9px; border-radius: 8px; overflow: hidden; }
.lab-distribution > span { background: var(--blue); display: block; height: 100%; border-right: 3px solid #f1f5f7; }
.lab-breakdown { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 14px; font-size: 12px; }
.lab-breakdown > div { display: flex; align-items: center; gap: 7px; color: var(--muted); }
.lab-breakdown strong { color: var(--ink); margin-left: 4px; font-weight: 600; }
.lab-dot { width: 7px; height: 7px; border-radius: 50%; }
.lab-dot.single { background: var(--blue); }
.lab-dot.multiple { background: #b6cbd9; }
.lab-overview > p { border-top: 1px solid var(--line); padding-top: 18px; margin: 22px 0 0; font-size: 11px; color: var(--muted); }
.lab-controls { padding: 22px; background: rgba(255, 255, 255, 0.72); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 22px; }
.lab-search { display: flex; align-items: center; gap: 12px; min-height: 58px; padding: 0 18px; background: #f8fafb; border: 1px solid #d6e0e7; border-radius: 13px; }
.lab-search:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(56, 97, 150, 0.1); }
.lab-search svg { width: 21px; height: 21px; flex: none; fill: none; stroke: var(--blue); stroke-width: 1.7; stroke-linecap: round; }
.lab-search input { border: 0; outline: 0; min-width: 0; width: 100%; background: transparent; font: inherit; font-size: 14px; color: var(--ink); padding: 16px 0; }
.lab-search input::placeholder { color: #788792; }
.lab-search-hint { white-space: nowrap; color: #8895a0; font-size: 10px; border-left: 1px solid var(--line); padding-left: 14px; }
.lab-filter-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-top: 18px; }
.lab-filters { display: flex; flex-wrap: wrap; gap: 7px; }
button { font: inherit; cursor: pointer; }
.lab-filters button { display: flex; align-items: center; gap: 7px; color: var(--muted); background: transparent; border: 1px solid transparent; border-radius: 9px; font-size: 12px; padding: 9px 12px; }
.lab-filters button span { font-size: 10px; opacity: 0.7; font-variant-numeric: tabular-nums; }
.lab-filters button.active { color: white; background: var(--blue); }
.lab-filters button:not(.active):hover { background: #eaf0f5; }
.lab-answer-switch { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); cursor: pointer; }
.lab-answer-switch input { width: 15px; height: 15px; accent-color: var(--blue); margin: 0; }
.lab-search-note { margin: 14px 0 0; font-size: 11px; color: var(--muted); line-height: 1.7; }
.lab-results-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin: 30px 2px 16px; scroll-margin-top: 105px; }
.lab-results-head h2 { font-size: 16px; font-weight: 600; margin: 0; }
.lab-results-head h2 > span { margin-left: 8px; font-size: 11px; background: #e5edf3; color: var(--blue); padding: 4px 9px; border-radius: 7px; vertical-align: middle; }
.lab-results-head p { font-size: 12px; color: var(--muted); margin: 0; font-variant-numeric: tabular-nums; }
.lab-question-list { display: grid; gap: 16px; }
.lab-question { border: 1px solid rgba(56, 97, 150, 0.12); background: rgba(255, 255, 255, 0.8); border-radius: 18px; padding: 24px 26px 0; overflow: hidden; }
.lab-question-meta { display: flex; align-items: center; gap: 12px; }
.lab-question-number { font-family: ui-monospace, monospace; font-size: 11px; color: #7c8995; }
.lab-type { background: #eaf0f8; color: var(--blue); border-radius: 5px; padding: 4px 7px; font-size: 10px; }
.lab-type.multiple { color: #71618e; background: #efecf6; }
.lab-question h3 { font-size: 16px; font-weight: 600; line-height: 1.85; margin: 14px 0 16px; overflow-wrap: anywhere; }
.lab-options { display: grid; gap: 7px; list-style: none; padding: 0; margin: 0 0 16px; }
.lab-options li { display: flex; align-items: baseline; gap: 10px; padding: 9px 12px; background: #f6f8fa; border: 1px solid transparent; border-radius: 9px; color: #53616c; font-size: 13px; line-height: 1.8; }
.lab-options li > span:nth-child(2) { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.lab-option-key { flex: none; font-size: 11px; font-weight: 650; color: #6d7f91; }
.lab-options li.correct { background: #edf5f0; border-color: #d7e9dd; color: #38604a; }
.lab-options li.correct .lab-option-key { color: #38604a; }
.lab-correct-label { flex: none; font-size: 10px; color: #557d61; }
mark { background: #f7e5a7; color: inherit; border-radius: 2px; padding: 1px 0; }
.lab-question-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid #edf0f2; min-height: 51px; }
.lab-source { font-size: 10px; color: #82909a; }
.lab-question-footer button { padding: 10px 0 10px 14px; color: var(--blue); background: none; border: 0; font-size: 12px; font-weight: 600; }
.lab-expanded-label { font-size: 11px; color: #62806f; }
.lab-answer { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; margin: 0 -26px; padding: 15px 26px; border-top: 1px solid #dcebe0; background: #edf5f0; color: #38604a; }
.lab-answer > span { font-size: 11px; }
.lab-answer strong { font-size: 17px; letter-spacing: 0.08em; }
.lab-answer small { margin-left: auto; font-size: 10px; color: #6c8b77; }
.lab-pagination { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 28px; }
.lab-pagination button { min-width: 36px; min-height: 38px; padding: 8px 12px; border: 1px solid #d9e1e7; border-radius: 9px; font-size: 12px; background: rgba(255, 255, 255, 0.75); color: var(--blue); }
.lab-pagination button.active { background: var(--blue); color: white; border-color: var(--blue); }
.lab-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.lab-page-numbers { display: flex; align-items: center; gap: 5px; }
.lab-page-numbers > span { color: var(--muted); padding: 0 4px; }
.lab-credits { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--line); }
.lab-credits h2 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
.lab-credits p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.9; overflow-wrap: anywhere; }
.lab-credits a { color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }
.lab-state { padding: 65px 20px; text-align: center; background: rgba(255, 255, 255, 0.6); border: 1px dashed #cbd8e1; border-radius: 18px; }
.lab-state h3 { font-size: 18px; margin: 12px 0; font-weight: 600; }
.lab-state p { font-size: 13px; line-height: 1.8; color: var(--muted); }
.lab-state button { border: 1px solid #c7d6e1; border-radius: 9px; background: white; color: var(--blue); font-size: 12px; padding: 10px 16px; margin-top: 10px; }
.lab-empty-icon { display: block; font-size: 40px; color: var(--blue); }
.lab-spinner { display: inline-block; width: 25px; height: 25px; border: 2px solid #d6e1ea; border-top-color: var(--blue); border-radius: 50%; animation: lab-spin 0.9s linear infinite; }
.lab-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
button:focus-visible, a:focus-visible, input[type="checkbox"]:focus-visible { outline: 2px solid var(--blue); outline-offset: 4px; }
@keyframes lab-spin { to { transform: rotate(360deg); } }
@media (max-width: 800px) {
  .lab-page { padding-top: 116px; }
  .lab-hero { gap: 28px; grid-template-columns: 1.15fr 1fr; }
  .lab-overview { padding: 22px; }
  .lab-total strong { font-size: 50px; }
  .lab-search-hint { display: none; }
}
@media (max-width: 600px) {
  .lab-hero { grid-template-columns: 1fr; gap: 26px; padding-bottom: 26px; }
  .lab-intro .detail-back { margin-bottom: 24px; }
  h1 span { display: inline; margin-left: 8px; }
  h1 { font-size: clamp(25px, 7vw, 37px); }
  .lab-lede { margin: 16px 0; }
  .lab-total { margin: 16px 0; }
  .lab-overview > p { margin-top: 16px; padding-top: 14px; }
  .lab-controls { padding: 15px; border-radius: 17px; }
  .lab-search { padding-inline: 12px; gap: 8px; min-height: 52px; }
  .lab-search input { font-size: 13px; }
  .lab-filters { gap: 3px; }
  .lab-filters button { padding: 9px 8px; font-size: 11px; gap: 5px; }
  .lab-filter-row { gap: 16px; }
  .lab-question { padding: 18px 16px 0; }
  .lab-question h3 { font-size: 15px; }
  .lab-options li { padding: 8px 10px; gap: 8px; }
  .lab-correct-label { display: none; }
  .lab-answer { margin-inline: -16px; padding-inline: 16px; gap: 10px; }
  .lab-answer small { display: none; }
  .lab-pagination { justify-content: center; gap: 12px; }
  .lab-page-numbers { order: -1; flex-basis: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) { .lab-spinner { animation: none; } }
</style>
