---
title: "CVPR 2026 Paper Explorer"
description: "A bilingual visualization platform for searching, classifying, and reading structured six-dimensional introductions to CVPR 2026 papers."
pubDate: 2026-06-07
platform: "Visualization"
tags: ["CVPR", "Computer Vision", "Paper Search", "Visualization", "Bilingual"]
image: /assets/collections/cvpr_paper/CVPR_Denver_2026.jpg
---

# CVPR 2026 Paper Explorer

**CVPR 2026 Paper Explorer** is an interactive visualization platform for browsing CVPR 2026 papers. It supports keyword search, primary and secondary category filtering, bilingual reading, abstracts, BibTeX citations, and direct PDF downloads.

The platform organizes each paper with six structured dimensions:

- research motivation;
- problem solved;
- phenomenon analysis;
- main method;
- data and experiments;
- main contributions.

## Features

| Feature | Description |
| --- | --- |
| Search | Find papers by title, author, abstract, category, or structured analysis |
| Category browser | Browse by primary category and secondary category |
| Bilingual reading | Switch between English and Chinese summaries |
| Paper cards | Read title, authors, category tags, and six-dimensional introductions |
| Expandable details | Open the abstract and BibTeX citation inline |
| Download | Jump directly to the CVF Open Access PDF |

## Data Source

The visualizer loads `cvpr2026meta.csv.gz`, a compressed CSV dataset containing all paper metadata and bilingual structured analyses. The browser decompresses the file locally and restores the original records before searching and rendering them.

During development and build, `scripts/sync-cvpr2026-data.mjs` synchronizes `src/data/cvpr2026meta.csv.gz` into the visualization site. If the original `src/data/cvpr2026meta.jsonl` is present, it is converted automatically so future updates are reflected. Compressed-only builds are also supported. Nested objects, arrays, multilingual text, and BibTeX content are preserved without loss.
