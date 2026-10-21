#!/usr/bin/env python3
"""Pipeline Fase 5A — parse edisi quran-tajweed (AlQuran Cloud) menjadi
JSON segmen per surah untuk mode Baca.

Sumber mentah: data-src/quran-tajweed.json (GET /v1/quran/quran-tajweed).
Format anotasi sumber: [kode[:id][teks] dengan kemungkinan bertumpuk —
huruf mengambil kode anotasi terdalam. Tanda waqf (karakter U+06D6 dst.)
di-override menjadi kode waqf sendiri karena mereka tanda, bukan huruf.

Keluaran: public/data/tajweed/<nomor-surah>.json
  {"surah": n, "ayahs": [{"n": ayah_no, "seg": [[teks, kode|null], ...]}]}

Audit yang dijalankan (gagal = exit 1):
- tidak ada kurung anotasi bocor ke teks keluaran
- setiap kode sumber punya padanan di legenda TS (daftar di bawah)
- kode 'saktah' hanya muncul di ayat kanoniknya
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data-src' / 'quran-tajweed.json'
OUT_DIR = ROOT / 'public' / 'data' / 'tajweed'

ANNOTATION_RE = re.compile(r'\[([a-z])(?::[0-9]+)?\[')

# Semua kode sumber yang teridentifikasi (lihat fase-5-baca-quran.md /
# catatan verifikasi statistik di riwayat build). Kode tak dikenal = error.
KNOWN_CODES = set('hslqgfa uicwd bnomp'.replace(' ', ''))

# Tanda waqf & tanda mushaf lain -> kode render.
WAQF_CODES = {
    '\u06d8': 'waqf-lazim',     # meem kecil: wajib berhenti
    '\u06da': 'waqf-jaiz',      # jeem: boleh berhenti / lanjut
    '\u06d6': 'waqf-aula',      # shalla: melanjutkan lebih utama
    '\u06d7': 'waqf-qala',      # qalla: berhenti lebih utama
    '\u06db': 'waqf-muanaqah',  # tiga titik: berhenti di salah satu
    '\u06e9': 'sajdah',         # tanda sujud tilawah
    '\u06de': 'hizb',           # rubu' hizb (penanda struktur)
    '\u06df': 'sifr',           # sifr mustadir: huruf tak dibaca saat washal
    '\u06e0': 'sifr',
}
# Saktah kanonik Hafs (18:1, 36:52, 75:27, 83:14) + 69:28 (disebut saktah
# dalam sebagian riwayat). U+06DC di luar daftar ini (2:245, 7:69) adalah
# tanda seen (shad dibaca seen), BUKAN saktah.
SAKTAH_VERSES = {(18, 1), (36, 52), (75, 27), (83, 14), (69, 28)}
SEEN_MARK = '\u06dc'


def parse_ayah(text: str, surah_no: int, ayah_no: int):
    """-> list[[teks, kode|null]] segmen gabungan."""
    chars: list[tuple[str, str | None]] = []
    stack: list[str] = []
    i = 0
    while i < len(text):
        m = ANNOTATION_RE.match(text, i)
        if m:
            code = m.group(1)
            if code not in KNOWN_CODES:
                raise ValueError(f'kode tak dikenal {code!r} di {surah_no}:{ayah_no}')
            stack.append(code)
            i = m.end()
            continue
        if text[i] == '[':
            # Sisa markup dataset: kurung liar tanpa kode (mis. [ٮٰ] di 32:3).
            # Buang kurungnya, huruf di dalamnya diperlakukan sebagai teks
            # biasa dengan kode tumpukan saat ini — jangan karang anotasi.
            close = text.find(']', i + 1, i + 9)
            if close != -1 and '[' not in text[i + 1:close]:
                for inner in text[i + 1:close]:
                    code = stack[-1] if stack else None
                    if inner in WAQF_CODES:
                        code = WAQF_CODES[inner]
                    chars.append((inner, code))
                i = close + 1
                continue
            raise ValueError(f'kurung tak dikenal di {surah_no}:{ayah_no} pos {i}')
        ch = text[i]
        if ch == ']' and stack:
            stack.pop()
            i += 1
            continue
        code = stack[-1] if stack else None
        if ch in WAQF_CODES:
            code = WAQF_CODES[ch]
        elif ch == SEEN_MARK:
            code = 'saktah' if (surah_no, ayah_no) in SAKTAH_VERSES else 'seen'
        chars.append((ch, code))
        i += 1
    if stack:
        raise ValueError(f'anotasi tak seimbang di {surah_no}:{ayah_no}')
    # gabung huruf berkode sama
    segments: list[list] = []
    for ch, code in chars:
        if segments and segments[-1][1] == code:
            segments[-1][0] += ch
        else:
            segments.append([ch, code])
    return segments


def main() -> int:
    data = json.loads(SRC.read_text(encoding='utf-8'))
    surahs = data['data']['surahs']
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    code_counter: Counter = Counter()
    total_ayahs = 0
    problems: list[str] = []
    for s in surahs:
        s_no = s['number']
        ayahs_out = []
        for a in s['ayahs']:
            a_no = a['numberInSurah']
            segs = parse_ayah(a['text'], s_no, a_no)
            total_ayahs += 1
            for txt, code in segs:
                if '[' in txt or ']' in txt:
                    problems.append(f'kurung bocor di {s_no}:{a_no}')
                if code:
                    code_counter[code] += len(txt)
                if code == 'saktah' and (s_no, a_no) not in SAKTAH_VERSES:
                    problems.append(f'saktah di luar daftar: {s_no}:{a_no}')
            ayahs_out.append({'n': a_no, 'seg': segs})
        out = {'surah': s_no, 'ayahs': ayahs_out}
        (OUT_DIR / f'{s_no}.json').write_text(
            json.dumps(out, ensure_ascii=False, separators=(',', ':')),
            encoding='utf-8',
        )
    print(f'ayat diproses: {total_ayahs}')
    print('cakupan kode (jumlah huruf):')
    for code, n in code_counter.most_common():
        print(f'  {code:16} {n}')
    if problems:
        print('MASALAH AUDIT:')
        for p in problems[:20]:
            print(' -', p)
        return 1
    print('audit bersih: tidak ada kurung bocor, saktah hanya di ayat kanonik')
    return 0


if __name__ == '__main__':
    sys.exit(main())
