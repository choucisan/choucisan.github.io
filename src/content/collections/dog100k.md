---
title: "Dog100K"
description: "A large-scale, high-quality dog image-text alignment dataset with 103,508 image-text pairs for multimodal learning, retrieval, captioning, and conditional generation."
pubDate: 2026-05-10
platform: "Hugging Face"
tags: ["Dataset", "Multimodal", "Vision-Language", "Text-to-Image", "Image-Text Retrieval"]
image: /assets/collections/dog100k/dog100k.jpeg
githubUrl: "https://github.com/choucisan/Dog100K"
huggingfaceUrl: "https://huggingface.co/datasets/choucsan/Dog100K"
---

# Dog100K: A Large-Scale Dog Image-Text Alignment Dataset

**Dog100K** is an open-source image-text alignment dataset focused on dogs. It contains **103,508 image-text pairs** and is designed for image-text retrieval, multimodal representation learning, image captioning, and conditional image generation.

The dataset was created to provide a focused, high-volume, and semantically rich resource for studying how vision-language models understand dogs across breeds, poses, scenes, lighting conditions, viewpoints, and human interaction contexts.



## Why Dog100K Exists

General-purpose image-text datasets are powerful, but they often make it difficult to study a single visual domain in depth. Dog100K narrows the scope to one highly recognizable and visually diverse category: dogs.

This domain-specific setting is useful because dog images naturally contain rich variations:

- different breeds, colors, sizes, and coat textures;
- indoor and outdoor scenes;
- single-dog and multi-dog cases;
- images with or without humans;
- close-up portraits, action shots, and environmental views;
- natural language descriptions with fine-grained semantic details.

By concentrating on one category, Dog100K can support more controlled experiments in multimodal alignment, retrieval, caption quality, and conditional generation.

## Dataset Overview

Dog100K includes image files and JSONL annotations. Each line in the annotation file corresponds to one image and its structured metadata.

| Field | Type | Description |
| --- | --- | --- |
| `filename` | string | Image filename, such as `00000001.jpg` |
| `has_human` | boolean | Whether a human appears in the image |
| `multiple_dogs` | boolean | Whether multiple dogs appear in the image |
| `scene` | string | A short scene description |
| `description` | string | A detailed natural language description |

A representative annotation looks like this:

```json
{
  "filename": "00000001.jpg",
  "has_human": false,
  "multiple_dogs": false,
  "scene": "bed with colorful blanket",
  "description": "A small dog with light-colored fur is sitting on a colorful blanket, wearing a light blue shirt. The dog has its mouth open and ears perked up, appearing alert and happy."
}
```

## Construction Pipeline

The dataset is constructed through a multi-stage process that emphasizes scale, quality, and semantic consistency.

![Dog100K construction pipeline](/assets/collections/dog100k/dog100k-pipeline.png)

### 1. Data Collection

Dog images are gathered from diverse sources to improve coverage across breeds, scenes, poses, image styles, and environmental conditions. The goal is to avoid a narrow visual distribution and make the dataset useful for robust model training and evaluation.

### 2. Quality Filtering

Images are filtered for relevance, resolution, visual quality, and diversity. Low-quality or irrelevant samples are removed so that the dataset remains suitable for vision-language modeling and generative learning.

### 3. Fine-Grained Annotation

Each image is paired with natural language information, including breed-related visual cues when available, action, scene, number of dogs, and whether humans are present. This creates a richer supervision signal than a single class label.

### 4. Validation

Annotations are reviewed and validated for consistency. This step is important because image-text alignment datasets are sensitive to noisy captions and mismatched descriptions.

## Highlights

- **Large scale:** 103,508 image-text pairs.
- **Domain focus:** A concentrated dataset for dog-centered multimodal research.
- **Fine-grained descriptions:** Natural language annotations include scene, action, appearance, and contextual information.
- **Broad diversity:** The dataset covers different lighting, backgrounds, viewpoints, and visual compositions.
- **Open access:** The dataset is released for research and community use through GitHub and Hugging Face.

## Quick Start

Load the dataset directly from Hugging Face:

```python
from huggingface_hub import hf_hub_download
import zipfile

# Download zip file
zip_path = hf_hub_download(
    repo_id="choucsan/Dog100K",
    filename="Dog100K_data.zip",
    repo_type="dataset",
)

# Extract
with zipfile.ZipFile(zip_path, 'r') as z:
    z.extractall("Dog100K")
```

You can also load the JSONL annotation file:

```python
import json
from PIL import Image

# Load annotations
with open("Dog100K/Dog100K.jsonl", "r") as f:
    samples = [json.loads(line) for line in f]

# Load an image
sample = samples[0]
img = Image.open(f"Dog100K/data/{sample['filename']}")
print(sample["description"])
img.show()
```

## Applications

Dog100K can be used in several research and development settings.

| Application | How Dog100K Helps |
| --- | --- |
| Image-text retrieval | Supports cross-modal search between dog images and text descriptions |
| Image captioning | Provides fine-grained descriptions for training or evaluating captioning systems |
| Conditional image generation | Supplies paired text prompts and dog images for text-to-image models |
| Multimodal contrastive learning | Enables focused experiments with CLIP-style vision-language alignment |
| Dataset analysis | Makes it possible to study breed, scene, human presence, and multi-dog distributions |

## Links

- **GitHub:** [github.com/choucisan/Dog100K](https://github.com/choucisan/Dog100K)
- **Hugging Face:** [huggingface.co/datasets/choucsan/Dog100K](https://huggingface.co/datasets/choucsan/Dog100K)
- **Quark Netdisk:** [Download Link](https://pan.quark.cn/s/847c986bb883)

## Citation and Contact

If Dog100K helps your work, please consider linking back to the repository or dataset page. For questions, suggestions, or collaboration, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
