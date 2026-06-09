---
title: "FIFA World Cup Games"
description: "A full-match FIFA World Cup video metadata dataset with 40 YouTube matches linked to structured match statistics, lineups, event timelines, formations, venues, and prediction polls."
pubDate: 2026-06-09
platform: "Hugging Face"
tags: ["Dataset", "FIFA World Cup", "Football", "Sports", "Long-Video Understanding", "Multimodal"]
image: /assets/collections/fwc_games/poster.jpeg
githubUrl: "https://github.com/choucisan/fwc_games"
huggingfaceUrl: "https://huggingface.co/datasets/choucsan/FIFA_World_Cup_Games"
---

# FIFA World Cup Games: A Full-Match Football Video Dataset

**FIFA World Cup Games** is an open-source dataset for long-form football video understanding. It provides **40 full-match YouTube references** from classic FIFA World Cup games and links each match to structured football annotations, including match metadata, team statistics, lineups, formations, text event timelines, venue information, referees, attendance, and pre-match prediction polls.

Instead of redistributing video files, the dataset stores YouTube video IDs and URLs so users can independently retrieve videos when their use case, copyright constraints, YouTube's Terms of Service, and local research policies allow it. This makes the dataset a structured bridge between full-match football broadcasts, match-level statistics, event narratives, and tournament context.

## Why FIFA World Cup Games Exists

Full-match football broadcasts are long, tactical, and highly contextual. A single World Cup match can include more than 90 minutes of continuous play, substitutions, cards, goals, tactical shape changes, injury time, extra time, penalty shootouts, and shifting momentum.

FIFA World Cup Games narrows this challenge into a compact but structured dataset where each retained match is linked to match-level evidence. This setting is useful because football broadcasts naturally contain rich multimodal signals:

- long-form video with continuous tactical and temporal context;
- team statistics such as shots, possession, fouls, corners, passes, and cards;
- starting lineups, substitutes, and formations;
- source-derived text event timelines for goals, cards, substitutions, attacks, and match flow;
- venue, attendance, referees, weather, and tournament-stage metadata;
- pre-match prediction polls that can be compared with final match outcomes;
- YouTube metadata that helps locate and retrieve original full-match broadcasts.

By connecting full-match videos with structured football annotations, FIFA World Cup Games supports research in long-video reasoning, sports analytics, multimodal retrieval, temporal prediction, match question answering, and football agent systems.

## Dataset Overview

FIFA World Cup Games includes a top-level `meta.jsonl` file and one folder for each structured match. Each match folder contains metadata, statistics, event timelines, lineups, and prediction polls.

### Key Statistics

| Statistic | Value |
| --- | --- |
| Indexed YouTube video records | 40 |
| Structured match folders | 40 |
| World Cup editions covered | 7 editions, from 1998 France to 2022 Qatar |
| Unique national teams | 25 |
| Total event timeline rows | 3,543 |
| Event rows per match | 4 to 465, average 88.6 |
| Stages covered | Group stage, 8th finals, quarter-finals, semi-finals, final |
| Statistics fields observed | 22 team-level metric names |
| Video distribution | Video files are not included; YouTube IDs and URLs are provided |

### Edition Coverage

| Edition | Indexed videos | Structured matches |
| --- | ---: | ---: |
| 2022 Qatar | 8 | 8 |
| 2018 Russia | 10 | 10 |
| 2014 Brazil | 8 | 8 |
| 2010 South Africa | 3 | 3 |
| 2006 Germany | 5 | 5 |
| 2002 Korea/Japan | 4 | 4 |
| 1998 France | 2 | 2 |

### Stage Coverage

| Stage | Structured matches |
| --- | ---: |
| Group stage | 20 |
| 8th finals | 8 |
| Quarter-finals | 5 |
| Semi-finals | 2 |
| Final | 5 |

## `meta.jsonl`

`meta.jsonl` is the top-level video and source-link index. Each line describes one retained YouTube match.

| Field | Type | Description |
| --- | --- | --- |
| `video_id` | string | YouTube video ID |
| `url` | string | YouTube watch URL |
| `title` | string | Original or lightly cleaned YouTube video title |
| `teams` | list[string] | Parsed teams in the match |
| `world_cup` | string | World Cup edition, such as `2022 Qatar` |
| `match_info_url` | string | Linked Soccer365 match page |

A representative metadata entry looks like this:

```json
{
  "video_id": "HxBqMbI5kqQ",
  "url": "https://www.youtube.com/watch?v=HxBqMbI5kqQ",
  "title": "FULL MATCH: Brazil v Croatia | Quarter-Finals | FIFA WORLD CUP QATAR 2022",
  "teams": ["Brazil", "Croatia"],
  "world_cup": "2022 Qatar",
  "match_info_url": "https://soccer365.net/games/15292867/"
}
```

## Dataset Structure

Each structured match is organized under `games/`. Folder names use a stable human-readable convention based on edition year, tournament stage, and teams.

```text
FIFA_World_Cup_Games/
├── meta.jsonl
├── images/
│   └── poster.jpeg
├── games/
│   ├── 2022-final-Argentina-vs-France/
│   │   ├── metadata.json
│   │   ├── stats.json
│   │   ├── events.json
│   │   ├── lineups.json
│   │   └── prediction.json
│   ├── 2018-group-stage-Germany-vs-Mexico/
│   │   ├── metadata.json
│   │   ├── stats.json
│   │   ├── events.json
│   │   ├── lineups.json
│   │   └── prediction.json
│   └── ...
└── poster_assets/
    └── thumbnails/
```

The folder naming convention is:

```text
YYYY-stage-TeamA-vs-TeamB
```

For example:

```text
2022-final-Argentina-vs-France
2014-semi-finals-Brazil-vs-Germany
2018-group-stage-Germany-vs-Mexico
```

The repository does not include downloaded video files. Users can use the `video_id` or `url` field to retrieve videos independently when permitted.

## Match Metadata

Each `metadata.json` file links the source YouTube video to normalized match context.

| Field | Type | Description |
| --- | --- | --- |
| `source_video.id` | string | YouTube video ID |
| `source_video.url` | string | YouTube watch URL |
| `source_video.title` | string | Cleaned match title |
| `source_video.date` | string | Match date in `YYYY-MM-DD` format when available |
| `match_info.home_team` | string | Home/listed first team from the match source |
| `match_info.away_team` | string | Away/listed second team from the match source |
| `match_info.stage` | string | Tournament stage |
| `match_info.datetime` | string | Source datetime string |
| `match_info.stadium` | string | Stadium name |
| `match_info.location` | string | Stadium city and country |
| `match_info.temperature` | string | Source temperature string when available |
| `match_info.weather` | string | Weather text when available |
| `match_info.viewers` | string | Attendance |
| `match_info.referees` | list[string] | Referee crew when available |
| `soccer365_url` | string | Source match page |

A representative metadata file looks like this:

```json
{
  "source_video": {
    "id": "ORzHdV_NVnQ",
    "url": "https://www.youtube.com/watch?v=ORzHdV_NVnQ",
    "title": "Argentina vs France -- 2022 FIFA World Cup Final",
    "date": "2022-12-18"
  },
  "match_info": {
    "home_team": "Argentina",
    "away_team": "France",
    "stage": "final",
    "datetime": "18.12.2022 23:59",
    "stadium": "Lusail",
    "location": "Lusail, Qatar",
    "temperature": "+35C",
    "viewers": "88,966",
    "referees": []
  },
  "soccer365_url": "https://soccer365.net/games/15292874/"
}
```

## Match Statistics

Each `stats.json` file stores team-level match statistics. The exact statistic set varies by match because older source pages expose fewer fields than recent matches.

Common statistics include:

| Statistic | Description |
| --- | --- |
| `Expected Goals (xG)` | Expected goals when available, mainly for recent matches |
| `Shots` | Total shots |
| `Shots on Target` | Shots on target |
| `Saves` | Goalkeeper saves |
| `Possession %` | Team possession percentage |
| `Corners` | Corner kicks |
| `Fouls` | Fouls committed |
| `Offsides` | Offside calls |
| `Yellow Cards` | Yellow cards |
| `Red cards` | Red cards |
| `Attacks` | Attacking sequences from the source page |
| `Dangerous Attacks` | Dangerous attacks from the source page |
| `Passes` | Total passes |
| `Pass Accuracy %` | Pass accuracy percentage |
| `Free Kicks` | Free kicks |
| `Throw-ins` | Throw-ins |
| `Crosses` | Crosses |
| `Tackles` | Tackles |

A representative statistics file looks like this:

```json
{
  "Expected Goals (xG)": {
    "Argentina": "3.3",
    "France": "2.2"
  },
  "Shots": {
    "Argentina": "21",
    "France": "10"
  },
  "Shots on Target": {
    "Argentina": "9",
    "France": "5"
  }
}
```

## Event Timelines

Each `events.json` file stores a source-derived text timeline. Rows are ordered chronologically when the source exposes a detailed report. Older games may only include a compact list of major match events.

| Field | Type | Description |
| --- | --- | --- |
| `minute` | string | Match minute or source marker |
| `type` | string | Source event type code, such as `whistle`, `goal`, `subst`, `yc`, or `rc` |
| `description` | string | Human-readable event text |

A representative event sequence looks like this:

```json
[
  {
    "minute": "-",
    "type": "whistle",
    "description": "The referee starts the match"
  },
  {
    "minute": "1",
    "type": "",
    "description": "Mexico kick-off, and the game is underway."
  },
  {
    "minute": "7",
    "type": "",
    "description": "Good effort by Mats Hummels as he directs a shot on target, but the keeper saves it"
  }
]
```

This field should be treated as a text event timeline rather than a frame-accurate official tracking feed.

## Lineups and Prediction Polls

Each `lineups.json` file stores starting players, substitutes, and formations.

| Field | Type | Description |
| --- | --- | --- |
| `<team>.starting` | list[object] | Starting XI players |
| `<team>.substitutes` | list[object] | Substitute bench players |
| `number` | string | Shirt number |
| `name` | string | Player name |
| `formation.<team>` | string | Formation, such as `4-3-3` |

Each `prediction.json` file stores the source page's pre-match user prediction poll, including vote percentages and vote counts for each team win and draw.

```json
{
  "Argentina win": {
    "percentage": "36",
    "votes": "569"
  },
  "draw": {
    "percentage": "34",
    "votes": "525"
  },
  "France win": {
    "percentage": "30",
    "votes": "472"
  }
}
```

## Construction Pipeline

The dataset is built through a multi-stage crawling and cleaning pipeline that emphasizes source traceability and match-level correctness.

### 1. Playlist Extraction

The pipeline starts from the YouTube FIFA World Cup full-match playlist `PLCGIzmTE4d0jq6wHT2TvSspZ_HLiIx4_y`. Video IDs, URLs, titles, and team/year signals are extracted from the playlist.

### 2. Match Normalization

Team names and World Cup editions are parsed from YouTube titles. Aliases such as `Korea Republic` are normalized to `South Korea`, and editions such as `2022 Qatar`, `2018 Russia`, and `2002 Korea/Japan` are mapped into consistent labels.

### 3. External Match Linking

Each video record is linked to a Soccer365 match page when a confident match page can be identified.

### 4. Structured Data Crawling

For linked matches, structured match metadata, stadium information, attendance, referees, lineups, formations, team statistics, text event timelines, and prediction poll results are crawled.

### 5. Folder-Level Packaging

Structured data is stored in one folder per match using stable, human-readable folder names.

### 6. Final Validation

Each structured match is checked for file coverage. Every retained match folder includes `metadata.json`, `stats.json`, `events.json`, `lineups.json`, and `prediction.json`.

## Quick Start

Install the basic dependencies:

```bash
pip install datasets huggingface_hub pandas yt-dlp
```

Load the top-level metadata from Hugging Face:

```python
from datasets import load_dataset

repo_id = "choucsan/FIFA_World_Cup_Games"
dataset = load_dataset(repo_id, data_files="meta.jsonl")
records = dataset["train"]

print(records[0])
```

Read one structured match locally:

```python
import json
from pathlib import Path

game_dir = Path("games/2022-final-Argentina-vs-France")

metadata = json.load(open(game_dir / "metadata.json", encoding="utf-8"))
stats = json.load(open(game_dir / "stats.json", encoding="utf-8"))
events = json.load(open(game_dir / "events.json", encoding="utf-8"))
lineups = json.load(open(game_dir / "lineups.json", encoding="utf-8"))
prediction = json.load(open(game_dir / "prediction.json", encoding="utf-8"))

print(metadata["source_video"]["url"])
print(stats["Shots"])
print(events[:3])
print(lineups["formation"])
print(prediction)
```

Download a YouTube video independently when permitted:

```bash
yt-dlp -f "bv*+ba/b" \
  -o "games/2022-final-Argentina-vs-France/video/%(id)s.%(ext)s" \
  "https://www.youtube.com/watch?v=ORzHdV_NVnQ"
```

Please ensure that downloading and using videos complies with YouTube's Terms of Service, copyright rules, and your local research policies.

## Applications

FIFA World Cup Games can be used in several research and development settings.

| Application | How FIFA World Cup Games Helps |
| --- | --- |
| Long video understanding | Supports reasoning over 90+ minute football broadcasts, extra time, and penalty shootouts |
| Event localization | Links textual event timelines to goals, substitutions, cards, saves, attacks, and match phases |
| Visual retrieval | Enables retrieval of goals, corners, fouls, substitutions, and tactical sequences from text queries |
| Temporal prediction | Supports next-event prediction, momentum modeling, score progression, and pre-match expectation analysis |
| Multimodal QA | Combines video evidence, statistics, lineups, formations, event text, venues, and tournament context |
| Football agents | Provides long-match context for agents that can search matches, answer tactical questions, summarize event flows, and generate scouting-style reports |
| AI referee research | Enables experiments on foul/card understanding, incident verification, referee-support workflows, and rule-grounded decision assistance |
| Automated highlights | Supports detection of goals, red cards, late winners, penalty shootouts, comebacks, and iconic World Cup moments |
| Sports analytics | Supports formation analysis, team-level statistical comparison, edition-level trends, and historical match comparison |

## Links

- **Hugging Face:** [huggingface.co/datasets/choucsan/FIFA_World_Cup_Games](https://huggingface.co/datasets/choucsan/FIFA_World_Cup_Games)
- **YouTube Playlist:** [PLCGIzmTE4d0jq6wHT2TvSspZ_HLiIx4_y](https://www.youtube.com/playlist?list=PLCGIzmTE4d0jq6wHT2TvSspZ_HLiIx4_y)

## Citation and Contact

If FIFA World Cup Games helps your work, please consider linking back to the dataset page. For questions, corrections, or collaboration, contact [choucisan@gmail.com](mailto:choucisan@gmail.com).
