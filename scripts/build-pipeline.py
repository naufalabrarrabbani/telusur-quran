#!/usr/bin/env python3
"""Fase 0 data pipeline: load raw Quran JSON, normalize, build indices."""

import json
import re
import os
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR / "raw"
OUT_DIR = SCRIPT_DIR.parent / "src" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# --- Load datasets ---
def load_raw(name):
    with open(RAW_DIR / name, encoding="utf-8") as f:
        data = json.load(f)
    assert data["code"] == 200, f"Bad response in {name}"
    return data["data"]["surahs"]

print("Loading datasets...")
surahs_simple = load_raw("quran-simple.json")
surahs_uthmani = load_raw("quran-uthmani.json")
surahs_indo = load_raw("id-indonesian.json")

# --- Normalization ---
# Strip harakat U+064B-U+0652, superscript alef U+0670, tatweel U+0640, BOM U+FEFF
STRIP_RE = re.compile("[\u064B-\u0652\u0670\u0640\uFEFF]")

def normalize(text: str) -> str:
    return STRIP_RE.sub("", text)

# --- Build unified verses ---
print("Building unified verses...")
verses = []
surah_meta = []

# Index ayahs from all 3 sources by (surah, ayah) for quick lookup
simple_map = {}
uthmani_map = {}
indo_map = {}

for s in surahs_simple:
    for a in s["ayahs"]:
        simple_map[(s["number"], a["numberInSurah"])] = a

for s in surahs_uthmani:
    for a in s["ayahs"]:
        uthmani_map[(s["number"], a["numberInSurah"])] = a

for s in surahs_indo:
    for a in s["ayahs"]:
        indo_map[(s["number"], a["numberInSurah"])] = a

# Build surah metadata
for s in surahs_simple:
    surah_meta.append({
        "number": s["number"],
        "name_arabic": s["name"],
        "name_latin": s["englishName"],
        "english_name_translation": s["englishNameTranslation"],
        "ayah_count": len(s["ayahs"]),
        "revelation_type": s["revelationType"],
    })

# Build verses
for s in surahs_simple:
    sno = s["number"]
    for a in s["ayahs"]:
        ano = a["numberInSurah"]
        key = (sno, ano)
        
        text_simple = simple_map[key]["text"]
        text_uthmani = uthmani_map[key]["text"]
        translation_id = indo_map[key]["text"]
        
        text_normalized = normalize(text_simple)
        
        ref_ayah = simple_map[key]
        
        verses.append({
            "surah_no": sno,
            "ayah_no": ano,
            "surah_name_latin": s["englishName"],
            "text_uthmani": text_uthmani,
            "text_simple": text_simple,
            "text_normalized": text_normalized,
            "translation_id": translation_id,
            "juz": ref_ayah.get("juz", 0),
            "page": ref_ayah.get("page", 0),
            "makkiyah": s["revelationType"] == "Meccan",
        })

print(f"  Total verses: {len(verses)}")
assert len(verses) == 6236, f"Expected 6236 verses, got {len(verses)}"

# --- Build word index ---
print("Building word index...")
word_index = {}  # normalized_token -> [{verse_id, position}]

for vid, v in enumerate(verses):
    tokens = v["text_normalized"].split()
    for pos, token in enumerate(tokens):
        if token not in word_index:
            word_index[token] = []
        word_index[token].append({"verse_id": vid, "position": pos})

print(f"  Unique tokens: {len(word_index)}")

# --- Save outputs ---
print("Saving outputs...")

with open(OUT_DIR / "verses.json", "w", encoding="utf-8") as f:
    json.dump(verses, f, ensure_ascii=False)
print(f"  verses.json: {len(verses)} records")

with open(OUT_DIR / "word-index.json", "w", encoding="utf-8") as f:
    json.dump(word_index, f, ensure_ascii=False)
print(f"  word-index.json: {len(word_index)} tokens")

with open(OUT_DIR / "surah-meta.json", "w", encoding="utf-8") as f:
    json.dump(surah_meta, f, ensure_ascii=False)
print(f"  surah-meta.json: {len(surah_meta)} surahs")

print("\nPipeline complete!")
