---
title: "ICCV Papers"
description: "A comprehensive ICCV paper dataset from 2013 to present, including metadata, abstracts, BibTeX records, download links, and full-paper PDFs for computer vision research."
pubDate: 2026-05-17
platform: "Hugging Face"
tags: ["Dataset", "Computer Vision", "Research Papers", "ICCV", "OCR"]
image: /assets/collections/iccv_paper/iccv.jpeg
githubUrl: "https://github.com/choucisan/CVpaper"
huggingfaceUrl: "https://huggingface.co/datasets/choucsan/ICCV_Papers"
---

# ICCV Papers: A Comprehensive Dataset for Computer Vision Literature

**ICCV Papers** is an open-source dataset that collects papers from the IEEE/CVF International Conference on Computer Vision from **ICCV 2013 to present**. It includes paper metadata, abstracts, BibTeX entries, original PDF download links, and organized full-paper PDF files.

ICCV is one of the most prestigious conferences in computer vision. Together with CVPR and ECCV, it forms a core venue for tracking progress in object detection, image segmentation, 3D reconstruction, video understanding, visual recognition, multimodal learning, and generative vision systems.

## Why ICCV Papers Exists

Computer vision literature grows rapidly, and ICCV has accumulated many influential papers across more than a decade of modern deep learning research. Working with this literature at scale often requires repeated scraping, metadata cleaning, citation parsing, and PDF organization.

ICCV Papers provides a structured resource for researchers, students, and developers who need to work with ICCV literature programmatically. It is useful for:

- building literature review and paper search tools;
- analyzing topic trends across ICCV years;
- constructing citation, author, and institution networks;
- extracting text, figures, tables, or equations from PDFs;
- training retrieval, summarization, and question-answering systems;
- comparing research directions across CVPR, ICCV, and ECCV.

## Dataset Overview

The dataset contains **9,145 papers** from **ICCV 2013 to present** and is continuously updated as new ICCV proceedings become available. The data is organized by year, with each year containing metadata and PDF files.

| Field | Type | Description |
| --- | --- | --- |
| `title` | string | Paper title |
| `authors` | string | Comma-separated list of authors |
| `abstract` | string | Paper abstract |
| `pdf_path` | string | Relative path to the downloaded PDF file |
| `download_url` | string | Direct CVF Open Access PDF URL |
| `bibtex` | string | BibTeX citation string |

A representative metadata entry looks like this:

```json
{
  "title": "3D Scene Understanding by Voxel-CRF",
  "authors": "Byung-Soo Kim, Pushmeet Kohli, Silvio Savarese",
  "abstract": "Scene understanding is an important yet very challenging problem in computer vision...",
  "pdf_path": "2013/pdf/Kim_3D_Scene_Understanding_2013_ICCV_paper.pdf",
  "download_url": "https://openaccess.thecvf.com/content_iccv_2013/papers/Kim_3D_Scene_Understanding_2013_ICCV_paper.pdf",
  "bibtex": "@InProceedings{Kim_2013_ICCV,author = {Kim, Byung-Soo and Kohli, Pushmeet and Savarese, Silvio},title = {3D Scene Understanding by Voxel-CRF},booktitle = {Proceedings of the IEEE International Conference on Computer Vision (ICCV)},month = {December},year = {2013}}"
}
```

## Dataset Structure

Each ICCV year is stored as an independent folder. Metadata is provided as JSONL, and PDFs are stored under the corresponding year.

```text
ICCV_Papers/
├── 2013/
│   ├── pdf/
│   │   ├── paper1.pdf
│   │   ├── paper2.pdf
│   │   └── ...
│   └── meta.jsonl
├── 2015/
│   ├── pdf/
│   └── meta.jsonl
├── 2017/
│   ├── pdf/
│   └── meta.jsonl
└── ...
```

## Construction Pipeline

The dataset is built through a systematic pipeline that converts CVF Open Access proceedings into structured metadata and downloadable paper files.

### 1. Web Scraping

Paper listings are collected from the [CVF Open Access](https://openaccess.thecvf.com) repository. This step identifies the paper detail pages and original PDF links for each ICCV year.

### 2. Metadata Extraction

The pipeline parses paper pages to extract titles, author lists, PDF links, and BibTeX citation records. The extracted information is normalized into year-level JSONL files.

### 3. Abstract Retrieval

Abstracts are fetched from individual paper detail pages and attached to the corresponding metadata entries. This makes the dataset useful for semantic search, summarization, and topic analysis without requiring full PDF parsing first.

### 4. URL Generation and PDF Access

Direct PDF download URLs are generated from the original CVF Open Access pages. Each metadata record keeps both the local `pdf_path` and the original `download_url`, making it easy to retrieve or verify the source PDF.

### 5. Data Validation

The final step checks data integrity, field consistency, and file organization so that each ICCV year follows the same structure and can be loaded programmatically.

## Quick Start

Install the basic dependencies:

```bash
pip install huggingface_hub requests
```

Download metadata for a specific ICCV year from Hugging Face:

```python
from huggingface_hub import hf_hub_download
import json

year = "2013"
meta_path = hf_hub_download(
    repo_id="choucsan/ICCV_Papers",
    filename=f"{year}/meta.jsonl",
    repo_type="dataset",
)

papers = []
with open(meta_path, "r", encoding="utf-8") as f:
    for line in f:
        papers.append(json.loads(line))

print(f"Loaded {len(papers)} ICCV {year} papers")
```

Download a paper PDF using the original CVF Open Access URL:

```python
import os
import requests

os.makedirs(f"iccv_{year}_pdfs", exist_ok=True)

paper = papers[0]
response = requests.get(paper["download_url"])
response.raise_for_status()

filename = os.path.basename(paper["pdf_path"])
with open(f"iccv_{year}_pdfs/{filename}", "wb") as f:
    f.write(response.content)

print(f"Downloaded: {filename}")
```

## Applications

ICCV Papers can support both academic research workflows and applied machine learning systems.

| Application | How ICCV Papers Helps |
| --- | --- |
| Literature review | Enables large-scale discovery and filtering across ICCV papers |
| Trend analysis | Supports year-by-year analysis of computer vision topics and methods |
| Text retrieval | Provides titles, abstracts, and PDFs for semantic search systems |
| Summarization | Supplies paper abstracts and full PDFs for summarization pipelines |
| Citation analysis | Includes BibTeX records for citation graph construction |
| Knowledge graphs | Helps connect papers, authors, topics, venues, and methods |
| PDF processing | Supports full-text extraction, OCR, figure extraction, and layout analysis |
| Recommendation systems | Enables paper recommendation based on title, abstract, or PDF content |

## Data Source

The dataset is derived from the official [CVF Open Access](https://openaccess.thecvf.com) proceedings. CVF Open Access provides the original paper pages, abstracts, PDF links, and citation information used to organize this collection.

## Links

- **GitHub:** [github.com/choucisan/CVpaper](https://github.com/choucisan/CVpaper)
- **Hugging Face:** [huggingface.co/datasets/choucsan/ICCV_Papers](https://huggingface.co/datasets/choucsan/ICCV_Papers)
- **CVF Open Access:** [openaccess.thecvf.com](https://openaccess.thecvf.com)

## Citation and Contact

If ICCV Papers helps your work, please consider linking back to the repository or dataset page. For questions, suggestions, or collaboration, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
