export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && !field) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && input[index + 1] === '\n') index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('CSV 中存在未闭合的引号。');
  if (field || row.length) rows.push([...row, field]);
  return rows;
}

export function parseQuestionCsv(text) {
  const [header, ...rows] = parseCsv(text);
  const columns = ['id', 'qtext', 'qtype', 'opts', 'ans', 'source_files', 'qurl'];
  if (!header || columns.some((column, index) => header[index] !== column)) {
    throw new Error('题库列名与预期格式不一致。');
  }

  const ids = new Set();
  return rows.map((row) => {
    if (row.length !== columns.length) throw new Error('题库行格式不正确。');
    const [id, rawText, type, rawOptions, rawAnswers, rawSources] = row;
    const options = JSON.parse(rawOptions);
    const answers = JSON.parse(rawAnswers);
    const sources = JSON.parse(rawSources);
    if (!/^\d+$/.test(id) || ids.has(id) || !rawText || !['单选题', '多选题'].includes(type)
      || !options || typeof options !== 'object' || Array.isArray(options)
      || Object.values(options).some((option) => typeof option !== 'string')
      || !Array.isArray(answers) || !answers.length || answers.some((answer) => !Object.hasOwn(options, answer))
      || !Array.isArray(sources) || sources.some((source) => typeof source !== 'string')) {
      throw new Error(`题目 ${id} 的内容不完整。`);
    }
    ids.add(id);
    const questionText = rawText.replace(/^题干[：:]\s*/, '').trim();
    const entries = Object.entries(options).map(([key, value]) => ({
      key,
      text: value.replace(new RegExp(`^${key}[、.．:：)）]\\s*`), '').trim()
    }));
    return {
      id,
      text: questionText,
      type,
      options: entries,
      answers,
      sources,
      searchText: [id, questionText, ...Object.values(options)].join(' ').toLowerCase()
    };
  });
}
