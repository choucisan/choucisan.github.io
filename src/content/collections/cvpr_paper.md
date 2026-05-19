---
title: "CVPR Papers"
description: "A comprehensive CVPR paper dataset from 2013 to present, including metadata, abstracts, BibTeX records, download links, and full-paper PDFs for computer vision research."
pubDate: 2026-05-06
platform: "Hugging Face"
tags: ["Dataset", "Computer Vision", "Research Papers", "CVPR", "OCR"]
image: /assets/collections/cvpr_paper/cvpr.jpeg
githubUrl: "https://github.com/choucisan/CVpaper"
huggingfaceUrl: "https://huggingface.co/datasets/choucsan/CVPR_Papers"
---

# CVPR Papers: A Comprehensive Dataset for Computer Vision Literature

**CVPR Papers** is an open-source dataset that collects papers from the IEEE/CVF Conference on Computer Vision and Pattern Recognition from **CVPR 2013 to present**. It includes paper metadata, abstracts, BibTeX entries, original PDF download links, and organized full-paper PDF files.

CVPR has documented many of the most important shifts in modern computer vision, from the deep learning era after AlexNet to the rise of large-scale representation learning, vision transformers, multimodal models, and generative systems. This dataset is designed to make that research history easier to search, analyze, and reuse.

## Why CVPR Papers Exists

Computer vision research moves quickly, and CVPR is one of the most important venues for tracking that progress. However, working with thousands of papers across many years often requires repeated scraping, PDF downloading, metadata cleaning, and citation parsing.

CVPR Papers provides a structured resource for researchers, students, and developers who need to work with CVPR literature at scale. It is useful for:

- building literature review and paper search tools;
- analyzing research trends across years;
- constructing citation and author networks;
- extracting text, figures, tables, or equations from PDFs;
- training retrieval, summarization, and question-answering systems;
- studying the evolution of computer vision topics over time.

## Dataset Overview

The dataset contains **18,452 papers** from **CVPR 2013 to present** and is continuously updated as new CVPR proceedings become available. The data is organized by year, with each year containing metadata and PDF files.

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
  "title": "Deformable Spatial Pyramid Matching for Fast Dense Correspondences",
  "authors": "Jaechul Kim, Ce Liu, Fei Sha, Kristen Grauman",
  "abstract": "We introduce a fast deformable spatial pyramid (DSP) matching algorithm for computing dense pixel correspondences...",
  "pdf_path": "2013/pdf/Kim_Deformable_Spatial_Pyramid_2013_CVPR_paper.pdf",
  "download_url": "https://openaccess.thecvf.com/content_cvpr_2013/papers/Kim_Deformable_Spatial_Pyramid_2013_CVPR_paper.pdf",
  "bibtex": "@InProceedings{Kim_2013_CVPR,author = {Kim, Jaechul and Liu, Ce and Sha, Fei and Grauman, Kristen},title = {Deformable Spatial Pyramid Matching for Fast Dense Correspondences},booktitle = {Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},month = {June},year = {2013}}"
}
```

## Dataset Structure

Each CVPR year is stored as an independent folder. Metadata is provided as JSONL, and PDFs are stored under the corresponding year.

```text
CVPR_Papers/
├── 2013/
│   ├── pdf/
│   │   ├── paper1.pdf
│   │   ├── paper2.pdf
│   │   └── ...
│   └── meta.jsonl
├── 2014/
│   ├── pdf/
│   └── meta.jsonl
└── ...
```

## Construction Pipeline

The dataset is built through a systematic pipeline that converts CVF Open Access proceedings into structured metadata and downloadable paper files.

### 1. Web Scraping

Paper listings are collected from the [CVF Open Access](https://openaccess.thecvf.com) repository. This step identifies the paper detail pages and original PDF links for each CVPR year.

### 2. Metadata Extraction

The pipeline parses paper pages to extract titles, author lists, PDF links, and BibTeX citation records. The extracted information is normalized into year-level JSONL files.

### 3. Abstract Retrieval

Abstracts are fetched from individual paper detail pages and attached to the corresponding metadata entries. This makes the dataset useful for semantic search, summarization, and topic analysis without requiring full PDF parsing first.

### 4. PDF Download

Full-paper PDFs are downloaded concurrently from the original CVF Open Access URLs and stored by year. Each metadata record keeps both the local `pdf_path` and the original `download_url`.

### 5. Data Validation

The final step checks data integrity, field consistency, and file organization so that each year follows the same structure and can be loaded programmatically.

## Quick Start

Install the basic dependencies:

```bash
pip install huggingface_hub requests
```

Download metadata for a specific CVPR year from Hugging Face:

```python
from huggingface_hub import hf_hub_download
import json

year = "2013"
meta_path = hf_hub_download(
    repo_id="choucsan/CVPR_Papers",
    filename=f"{year}/meta.jsonl",
    repo_type="dataset",
)

papers = []
with open(meta_path, "r", encoding="utf-8") as f:
    for line in f:
        papers.append(json.loads(line))

print(f"Loaded {len(papers)} CVPR {year} papers")
```

Download a paper PDF using the original CVF Open Access URL:

```python
import os
import requests

os.makedirs(f"cvpr_{year}_pdfs", exist_ok=True)

paper = papers[0]
response = requests.get(paper["download_url"])
response.raise_for_status()

filename = os.path.basename(paper["pdf_path"])
with open(f"cvpr_{year}_pdfs/{filename}", "wb") as f:
    f.write(response.content)

print(f"Downloaded: {filename}")
```

## Applications

CVPR Papers can support both academic research workflows and applied machine learning systems.

| Application | How CVPR Papers Helps |
| --- | --- |
| Literature review | Enables large-scale discovery and filtering across CVPR papers |
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

- **GitHub:** [github.com/paperAbstract/CVPR_Papers](https://github.com/paperAbstract/CVPR_Papers)
- **Hugging Face:** [huggingface.co/datasets/choucsan/CVPR_Papers](https://huggingface.co/datasets/choucsan/CVPR_Papers)
- **CVF Open Access:** [openaccess.thecvf.com](https://openaccess.thecvf.com)

## Citation and Contact

If CVPR Papers helps your work, please consider linking back to the repository or dataset page. For questions, suggestions, or collaboration, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
