import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const sourceRoot = path.join(process.cwd(), 'src', 'data', 'gaokao2025');
const outputRoot = path.join(process.cwd(), 'public', 'assets', 'gaokao2025');

const provinceNames = {
  anhui: '安徽',
  beijing: '北京',
  chongqing: '重庆',
  fujian: '福建',
  gansu: '甘肃',
  guangdong: '广东',
  guangxi: '广西',
  guizhou: '贵州',
  hainan: '海南',
  hebei: '河北',
  heilongjiang: '黑龙江',
  henan: '河南',
  hubei: '湖北',
  hunan: '湖南',
  jiangsu: '江苏',
  jiangxi: '江西',
  jilin: '吉林',
  liaoning: '辽宁',
  neimenggu: '内蒙古',
  ningxia: '宁夏',
  qinghai: '青海',
  shaanxi: '陕西',
  shandong: '山东',
  shanghai: '上海',
  shanxi: '山西',
  sichuan: '四川',
  tianjin: '天津',
  xinjiang: '新疆',
  xizang: '西藏',
  yunnan: '云南',
  zhejiang: '浙江'
};

const dataFiles = [
  'score-range.csv.gz',
  'enrollment-plan.csv.gz',
  'school-admission.csv.gz',
  'major-admission.csv.gz'
];

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));
const gunzip = promisify(zlib.gunzip);

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const numberValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCsv = (csvText) => {
  const cleaned = csvText.charCodeAt(0) === 0xfeff ? csvText.slice(1) : csvText;
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((item) => item !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((item) => item !== '')) rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.replace(/^\ufeff/, '').trim());
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
};

const readGzipCsv = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return parseCsv((await gunzip(buffer)).toString('utf8'));
};

const buildEnrollmentComputed = async (sourceDir) => {
  const filePath = path.join(sourceDir, 'enrollment-plan.csv.gz');
  try {
    const rows = await readGzipCsv(filePath);
    const projectKeys = new Set();
    const schoolMap = new Map();
    let knownPlanCountRows = 0;
    let knownPlanPeople = 0;

    rows.forEach((row) => {
      const projectKey = [
        row.university_code,
        row.university_name,
        row.major_group,
        row.major_code,
        row.major_name,
        row.subject_req,
        row.batch,
        row.category
      ].join('|');
      projectKeys.add(projectKey);

      const schoolKey = `${row.university_code}|${row.university_name}`;
      if (!schoolMap.has(schoolKey)) {
        schoolMap.set(schoolKey, {
          university_code: row.university_code,
          name: row.university_name,
          detail_rows: 0,
          project_keys: new Set(),
          known_plan_people: 0,
          known_plan_count_rows: 0
        });
      }
      const school = schoolMap.get(schoolKey);
      school.detail_rows += 1;
      school.project_keys.add(projectKey);

      const planCount = numberValue(row.plan_count);
      if (planCount !== null && planCount > 0) {
        knownPlanCountRows += 1;
        knownPlanPeople += planCount;
        school.known_plan_count_rows += 1;
        school.known_plan_people += planCount;
      }
    });

    const topUniversities = Array.from(schoolMap.values())
      .map((school) => ({
        name: school.name,
        university_code: school.university_code,
        detail_rows: school.detail_rows,
        project_count: school.project_keys.size,
        known_plan_people: school.known_plan_people,
        known_plan_count_rows: school.known_plan_count_rows
      }))
      .sort((a, b) => b.project_count - a.project_count || b.detail_rows - a.detail_rows)
      .slice(0, 20);

    return {
      detailRows: rows.length,
      projectCount: projectKeys.size,
      knownPlanCountRows,
      knownPlanPeople,
      topUniversities
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        detailRows: 0,
        projectCount: 0,
        knownPlanCountRows: 0,
        knownPlanPeople: null,
        topUniversities: []
      };
    }
    throw error;
  }
};

const run = async () => {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const provinceDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => (provinceNames[a] ?? a).localeCompare(provinceNames[b] ?? b, 'zh-Hans-CN'));

  await fs.mkdir(outputRoot, { recursive: true });

  const provinces = [];

  for (const slug of provinceDirs) {
    const sourceDir = path.join(sourceRoot, slug);
    const outputDir = path.join(outputRoot, slug);
    const metaPath = path.join(sourceDir, 'meta.json');
    const meta = await readJson(metaPath);
    const files = {};

    await fs.mkdir(outputDir, { recursive: true });
    await fs.copyFile(metaPath, path.join(outputDir, 'meta.json'));

    for (const filename of dataFiles) {
      const sourceFile = path.join(sourceDir, filename);
      try {
        const stat = await fs.stat(sourceFile);
        if (!stat.isFile()) continue;
        await fs.copyFile(sourceFile, path.join(outputDir, filename));
        files[filename.replace('.csv.gz', '')] = {
          url: `/assets/gaokao2025/${slug}/${filename}`,
          bytes: stat.size
        };
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }

    const categories = unique([
      ...(meta.exam_overview?.categories ?? []).map((item) => item.name),
      ...Object.keys(meta.enrollment_stats?.by_category ?? {})
    ]);
    const batches = unique([
      ...Object.keys(meta.enrollment_stats?.by_batch ?? {}),
      ...(meta.exam_overview?.categories ?? []).flatMap((category) => (category.batch_lines ?? []).map((line) => line.batch))
    ]);
    const enrollmentComputed = await buildEnrollmentComputed(sourceDir);

    provinces.push({
      slug,
      name: provinceNames[slug] ?? slug,
      year: 2025,
      categories,
      batches,
      totalCandidates: meta.exam_overview?.total_candidates ?? null,
      universityStats: meta.university_stats ?? null,
      enrollmentStats: meta.enrollment_stats ?? null,
      enrollmentComputed,
      examOverview: meta.exam_overview ?? null,
      topMajors: meta.top_majors ?? [],
      admissionBands: meta.admission_bands ?? [],
      scoreDistribution: meta.score_distribution ?? [],
      files
    });
  }

  const index = {
    year: 2025,
    updatedAt: new Date().toISOString(),
    provinceCount: provinces.length,
    provinces
  };

  await fs.writeFile(path.join(outputRoot, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`[gaokao2025] Synced ${provinces.length} provinces to public assets.`);
};

run().catch((error) => {
  console.error(`[gaokao2025] Sync failed: ${error.message}`);
  process.exitCode = 1;
});
