export function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let fieldStart = 0;
  let quoted = false;
  let fieldQuoted = false;
  let afterQuote = false;

  const finishField = (end) => {
    const raw = input.slice(fieldStart, end);
    row.push(fieldQuoted ? raw.slice(1, -1).replaceAll('""', '"') : raw);
    fieldQuoted = false;
    afterQuote = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"') {
        if (input[index + 1] === '"') index += 1;
        else {
          quoted = false;
          afterQuote = true;
        }
      }
    } else if (character === ',' || character === '\r' || character === '\n') {
      finishField(index);
      if (character !== ',') {
        rows.push(row);
        row = [];
        if (character === '\r' && input[index + 1] === '\n') index += 1;
      }
      fieldStart = index + 1;
    } else if (character === '"' && index === fieldStart && !afterQuote) {
      quoted = true;
      fieldQuoted = true;
    } else if (character === '"' || afterQuote) {
      throw new Error('Invalid CSV quoting.');
    }
  }

  if (quoted) throw new Error('Unclosed CSV field.');
  if (fieldStart < input.length || row.length) {
    finishField(input.length);
    rows.push(row);
  }
  return rows;
}

export function encodePapersCsv(papers) {
  if (!Array.isArray(papers) || !papers.length
    || papers.some((paper) => !paper || typeof paper !== 'object' || Array.isArray(paper))) {
    throw new Error('Expected a non-empty array of paper records.');
  }
  const columns = [...new Set(papers.flatMap((paper) => Object.keys(paper)))];
  const quote = (value) => `"${value.replaceAll('"', '""')}"`;
  const rows = [columns.map(quote).join(',')];
  for (const paper of papers) {
    rows.push(columns.map((column) => Object.hasOwn(paper, column) ? quote(JSON.stringify(paper[column])) : '').join(','));
  }
  return `${rows.join('\r\n')}\r\n`;
}

export function parsePapersCsv(text) {
  const [columns, ...rows] = parseCsv(text);
  if (!columns?.length || columns.some((column) => !column)
    || new Set(columns).size !== columns.length
    || !['title', 'authors', 'abstract'].every((column) => columns.includes(column))) {
    throw new Error('Invalid paper CSV columns.');
  }
  return rows.map((row, rowIndex) => {
    if (row.length !== columns.length) throw new Error(`Invalid CSV row ${rowIndex + 2}.`);
    return Object.fromEntries(columns.flatMap((column, columnIndex) => {
      if (row[columnIndex] === '') return [];
      try {
        return [[column, JSON.parse(row[columnIndex])]];
      } catch {
        throw new Error(`Invalid JSON value in CSV row ${rowIndex + 2}, column ${column}.`);
      }
    }));
  });
}
