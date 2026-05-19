---
title: "NBA Games"
description: "A full-game NBA video metadata dataset with 189 verified YouTube games linked to official NBA.com box scores and play-by-play annotations for long-video and multimodal sports research."
pubDate: 2026-05-19
platform: "Hugging Face"
tags: ["Dataset", "NBA", "Sports Video", "Long-Video Understanding", "Multimodal"]
image: /assets/collections/nba_games/nba.jpeg
githubUrl: "https://github.com/choucisan/nab_games"
huggingfaceUrl: "https://huggingface.co/datasets/choucsan/NBA_Games"
---

# NBA Games: A Full-Game Basketball Video Dataset

**NBA Games** is an open-source dataset for long-form basketball video understanding. It contains **189 verified full-length NBA games** from YouTube, linked with official NBA.com box scores and, when available, official play-by-play event annotations.

Instead of redistributing video files, the dataset provides YouTube video IDs and URLs so users can independently download videos when their use case, copyright constraints, YouTube's Terms of Service, and local research policies allow it. This makes the dataset useful as a structured bridge between long sports broadcasts, official statistics, and event-level game annotations.

## Why NBA Games Exists

Full-game sports videos are challenging research objects: they are long, event-dense, temporally structured, and strongly tied to external statistics. A single NBA game can last more than two hours and include hundreds of shots, fouls, rebounds, turnovers, substitutions, score changes, and tactical shifts.

NBA Games narrows this challenge into a verified dataset where each retained video is connected to structured official game data. This setting is useful because basketball broadcasts naturally contain rich multimodal signals:

- long-form video with continuous temporal context;
- official play-by-play descriptions for event sequences;
- box-score statistics for players and teams;
- score progression, overtime, momentum swings, and clutch moments;
- team and player identities linked to official NBA.com metadata;
- YouTube metadata that helps locate and retrieve the original broadcast.

By connecting full-game videos with official structured annotations, NBA Games supports research in long-video reasoning, sports analytics, multimodal retrieval, temporal prediction, and video question answering.

## Dataset Overview

NBA Games includes a top-level `nba_games.jsonl` file and one folder for each verified game. Each game folder contains official statistics, play-by-play annotations, linkage metadata, and an empty `video/` directory where users may place independently downloaded video files.

### Key Statistics

| Statistic | Value |
| --- | --- |
| Verified games | 189 |
| Total dataset duration | ~347 hours / 1,249,758 seconds |
| Raw playlist entries | 595 |
| Valid full-game candidates before NBA.com verification | 217 |
| Games with non-empty play-by-play | 166 |
| Older games with empty play-by-play files | 23 |
| Total box-score rows | 5,194 |
| Total play-by-play rows | 81,355 |
| Video distribution | Video files are not included; YouTube IDs and URLs are provided |

### `nba_games.jsonl`

Each line in `nba_games.jsonl` describes one retained YouTube game.

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | YouTube video ID |
| `url` | string | YouTube watch URL |
| `title` | string | Cleaned matchup in `Team A vs. Team B` format |
| `date` | string | Verified game date in `YYYY-MM-DD` format |
| `duration` | integer | YouTube video duration in seconds |
| `description` | string | YouTube description, or title fallback when description is unavailable |

A representative metadata entry looks like this:

```json
{
  "id": "I33o9UnUe1A",
  "url": "https://www.youtube.com/watch?v=I33o9UnUe1A",
  "title": "Golden State Warriors vs. Oklahoma City Thunder",
  "date": "2016-02-27",
  "duration": 7357,
  "description": "Steph Curry knocks down 12 threes, including the deep game-winner..."
}
```

## Dataset Structure

Each verified game is organized under `games/`. Folder names use the official NBA.com home/away order after matching.

```text
NBA_Games/
├── nba_games.jsonl
├── games/
│   ├── 2016-02-27-gsw-vs-okc/
│   │   ├── video/
│   │   ├── box-score.jsonl
│   │   ├── play-by-play.jsonl
│   │   └── metadata.json
│   ├── 2011-04-26-noh-vs-lal/
│   │   ├── video/
│   │   ├── box-score.jsonl
│   │   ├── play-by-play.jsonl
│   │   └── metadata.json
│   └── ...
```

The folder naming convention is:

```text
YYYY-MM-DD-away-vs-home
```

For example:

```text
2016-02-27-gsw-vs-okc
```

The `video/` directory is intentionally empty. Users can place locally downloaded game videos there if their use case permits video download and storage.

## Box Score Annotations

Each `box-score.jsonl` file contains official NBA.com box-score information for one game. The file uses JSON Lines so rows can be streamed without loading the full file into memory.

Rows have two major types:

| Row Type | Description |
| --- | --- |
| `team` | Team-level final score, period scores, and aggregate statistics |
| `player` | Player-level identity, team linkage, status/comment fields, and statistics |

Common fields include official game linkage, YouTube linkage, game date, NBA game ID, team identity, final score, periods, and a `statistics` object. Player rows additionally include fields such as `person_id`, `first_name`, `family_name`, `player_slug`, `position`, `jersey_num`, and `comment` when available.

A representative team row looks like this:

```json
{
  "source": "nba.com",
  "nba_game_url": "https://www.nba.com/game/gsw-vs-okc-0021500874",
  "youtube_id": "I33o9UnUe1A",
  "game_date": "2016-02-27",
  "row_type": "team",
  "game_id": "0021500874",
  "side": "away",
  "team_tricode": "GSW",
  "score": 121,
  "periods": [
    {"period": 1, "periodType": "REGULAR", "score": 20},
    {"period": 5, "periodType": "OVERTIME", "score": 18}
  ],
  "statistics": {
    "fieldGoalsMade": 45,
    "threePointersMade": 14,
    "reboundsTotal": 32,
    "assists": 25,
    "points": 121
  }
}
```

## Play-by-Play Annotations

Each `play-by-play.jsonl` file contains official NBA.com action-level event annotations for one game. Each line represents one event ordered by game time.

Common fields include:

| Field | Type | Description |
| --- | --- | --- |
| `game_id` | string | Official NBA game ID |
| `nba_game_url` | string | Official NBA.com game URL |
| `youtube_id` | string | Linked YouTube video ID |
| `game_date` | string | Game date |
| `actionNumber` | integer | NBA.com action sequence number |
| `period` | integer | Quarter or overtime period number |
| `clock` | string | Game clock, such as `PT11M50.00S` |
| `teamTricode` | string | Team abbreviation associated with the action |
| `personId` | integer | Player ID associated with the action |
| `playerName` | string | Player display name |
| `description` | string | Human-readable play description |
| `actionType` | string | Event type, such as `Foul`, `Jump Ball`, or `Made Shot` |
| `scoreHome` | string | Home score after the action |
| `scoreAway` | string | Away score after the action |

A representative play-by-play row looks like this:

```json
{
  "source": "nba.com",
  "game_id": "0021500874",
  "nba_game_url": "https://www.nba.com/game/gsw-vs-okc-0021500874",
  "youtube_id": "I33o9UnUe1A",
  "game_date": "2016-02-27",
  "actionNumber": 2,
  "clock": "PT11M50.00S",
  "period": 1,
  "teamTricode": "GSW",
  "personId": 201939,
  "playerName": "Curry",
  "description": "Curry P.FOUL (P1.T1) (S.Foster)",
  "actionType": "Foul",
  "subType": "Personal",
  "scoreHome": "0",
  "scoreAway": "0"
}
```

## Construction Pipeline

The dataset is constructed through a multi-stage cleaning and verification process that emphasizes source traceability and game-level correctness.

### 1. Playlist Extraction

The pipeline starts from the YouTube NBA full-game playlist `PLNbBj4TorBWerlzB1A5iM3XjwigqFG8sY`, a widely referenced collection of historic and classic NBA games. Video IDs, URLs, titles, descriptions, durations, upload dates, and channel metadata are extracted from the playlist.

### 2. Valid-Video Filtering

The raw crawl contains 595 playlist entries, including placeholder rows without usable metadata. Entries with real titles and durations are retained, producing 217 valid full-game candidates.

### 3. Metadata Normalization

Each title is cleaned into a canonical matchup format, such as `Golden State Warriors vs. Oklahoma City Thunder`. Dates are parsed from titles and descriptions, while missing or ambiguous fields are completed through LLM-assisted inference and manual verification.

### 4. Official Game Localization

For each candidate, the pipeline queries NBA.com date pages and matches the cleaned matchup against the official game list for that date. This step links YouTube videos to official NBA game identifiers.

### 5. Historical-Team Handling

Historical abbreviations and franchise names are normalized, including `PHL/PHI`, `SAN/SAS`, `NJN/BKN`, `NOH/NOP/CHA`, `SEA/OKC`, and All-Star abbreviations such as `EST/WST` and `LBN/GNS`.

### 6. Official Data Crawling

For matched games, structured data embedded in NBA.com game pages is downloaded, including official box-score data and play-by-play actions when available.

### 7. Final Filtering

Candidates whose date and matchup cannot be confidently matched to NBA.com are removed. The final release contains 189 verified games.

## Highlights

- **Verified linkage:** YouTube full-game references are matched against official NBA.com game pages.
- **Long-video scale:** The dataset covers roughly 347 hours of basketball video metadata.
- **Structured statistics:** Each retained game includes official box-score rows for teams and players.
- **Event-level annotations:** 166 games include non-empty play-by-play event sequences.
- **Copyright-aware design:** Video files are not redistributed; only IDs and URLs are provided.
- **Research-ready format:** JSONL files make the dataset easy to stream, filter, and join with video files.

## Quick Start

Install the basic dependencies:

```bash
pip install datasets huggingface_hub pandas yt-dlp
```

Load the top-level metadata directly from Hugging Face:

```python
from datasets import load_dataset

repo_id = "choucsan/NBA_Games"
dataset = load_dataset(repo_id, data_files="nba_games.jsonl")
games = dataset["train"]

print(games[0])
```

You can also download the metadata file with `huggingface_hub`:

```python
from huggingface_hub import hf_hub_download
import json

repo_id = "choucsan/NBA_Games"
path = hf_hub_download(
    repo_id=repo_id,
    filename="nba_games.jsonl",
    repo_type="dataset",
)

with open(path, "r", encoding="utf-8") as f:
    games = [json.loads(line) for line in f]

print(f"Loaded {len(games)} games")
```

Read the box-score and play-by-play files for a specific game:

```python
from huggingface_hub import hf_hub_download
import json

repo_id = "choucsan/NBA_Games"
game_dir = "games/2016-02-27-gsw-vs-okc"

box_path = hf_hub_download(repo_id, f"{game_dir}/box-score.jsonl", repo_type="dataset")
pbp_path = hf_hub_download(repo_id, f"{game_dir}/play-by-play.jsonl", repo_type="dataset")

with open(box_path, "r", encoding="utf-8") as f:
    box_score = [json.loads(line) for line in f]

with open(pbp_path, "r", encoding="utf-8") as f:
    play_by_play = [json.loads(line) for line in f]

print(len(box_score), len(play_by_play))
```

Download a YouTube video independently when permitted:

```bash
yt-dlp -f "bv*+ba/b" \
  -o "games/2016-02-27-gsw-vs-okc/video/%(id)s.%(ext)s" \
  "https://www.youtube.com/watch?v=I33o9UnUe1A"
```

Please ensure that downloading and using videos complies with YouTube's Terms of Service, copyright rules, and your local research policies.

## Applications

NBA Games can be used in several research and development settings.

| Application | How NBA Games Helps |
| --- | --- |
| Long video understanding | Supports temporal reasoning over 1.5-2.5 hour basketball broadcasts |
| Event localization | Links sparse textual queries to play-by-play events and video timelines |
| Visual retrieval | Enables retrieval of plays, players, teams, and game situations |
| Temporal prediction | Supports score progression, next-action, momentum, and win-probability modeling |
| Action understanding | Provides event types for made shots, fouls, rebounds, turnovers, substitutions, and more |
| Multimodal QA | Combines video evidence, play descriptions, and box-score statistics for question answering |
| Basketball agents | Provides long-game context for agents that can search games, answer tactical questions, summarize possessions, and generate coaching-style reports |
| AI referee research | Enables experiments on foul understanding, whistle timing, event verification, and rule-grounded decision support with video and play-by-play signals |
| Automated highlights | Supports detection of clutch shots, scoring runs, overtime moments, star-player sequences, and game-changing possessions |
| Sports analytics | Supports player/team performance analysis across full-game contexts |

## Links

- **GitHub:** [github.com/choucisan/nba_games](https://github.com/choucisan/nba_games)
- **Hugging Face:** [huggingface.co/datasets/choucsan/NBA_Games](https://huggingface.co/datasets/choucsan/NBA_Games)
- **YouTube Playlist:** [PLNbBj4TorBWerlzB1A5iM3XjwigqFG8sY](https://www.youtube.com/playlist?list=PLNbBj4TorBWerlzB1A5iM3XjwigqFG8sY)

## Citation and Contact

If NBA Games helps your work, please consider linking back to the repository or dataset page. For questions, corrections, or collaboration, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
