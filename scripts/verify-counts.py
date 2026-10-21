#!/usr/bin/env python3
"""Verify word counts against spec. Acceptance gate for Fase 0."""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

# --- Load data ---
with open(DATA_DIR / "verses.json", encoding="utf-8") as f:
    verses = json.load(f)

with open(DATA_DIR / "word-index.json", encoding="utf-8") as f:
    word_index = json.load(f)

# --- Helpers ---
def count_exact(term: str) -> int:
    """Count total token occurrences matching exactly."""
    if term in word_index:
        return len(word_index[term])
    return 0

def count_contains(substring: str) -> int:
    """Count total token occurrences containing the substring."""
    total = 0
    for token, refs in word_index.items():
        if substring in token:
            total += len(refs)
    return total

def count_contains_tokens(substring: str) -> int:
    """Count total token occurrences containing the substring."""
    total = 0
    for token, refs in word_index.items():
        if substring in token:
            total += len(refs)
    return total

# --- Spec verification ---
print("=" * 70)
print("TELUSUR QUR'AN - FASE 0 VERIFICATION")
print("=" * 70)

# The spec uses token-occurrence counts for CONTAINS, not verse counts.
# Let's check both and see which matches.

tests = []

# آدم (Adam) - EXACT=20 verses, CONTAINS=25 verses
adam = "آدم"
adam_exact = count_exact(adam)
adam_contains = count_contains(adam)
tests.append(("آدم EXACT", adam_exact, 20))
tests.append(("آدم CONTAINS", adam_contains, 25))

# عيسى (Isa) - EXACT=16, CONTAINS=25
isa = "عيسى"
isa_exact = count_exact(isa)
isa_contains = count_contains(isa)
tests.append(("عيسى EXACT", isa_exact, 16))
tests.append(("عيسى CONTAINS", isa_contains, 25))

# شيط (Setan substring) - CONTAINS tokens = 70
shait_contains = count_contains("شيط")
tests.append(("شيط CONTAINS(tokens)", shait_contains, 70))

# شيطان+شياطين (Setan LEMMA) = 88
# شياطين does NOT contain شيط as substring (ش-ي-ا-ط vs ش-ي-ط)
# So lemma = tokens_with_شيط + tokens_with_شياطين
shayateen_count = count_contains("شياطين")
setan_lemma = shait_contains + shayateen_count
tests.append(("شياطين tokens", shayateen_count, 18))
tests.append(("شيطان+شياطين LEMMA", setan_lemma, 88))

# موسى (Musa) - EXACT=129, CONTAINS=136
musa = "موسى"
musa_exact = count_exact(musa)
musa_contains = count_contains(musa)
tests.append(("موسى EXACT", musa_exact, 129))
tests.append(("موسى CONTAINS", musa_contains, 136))

# محمد (Muhammad) - EXACT=4
muhammad = "محمد"
muhammad_exact = count_exact(muhammad)
tests.append(("محمد EXACT", muhammad_exact, 4))

# --- Print results ---
print(f"\n{'Test':<35} {'Got':>6} {'Expected':>10} {'Status':>8}")
print("-" * 70)

all_pass = True
for name, got, expected in tests:
    status = "✅ PASS" if got == expected else "❌ FAIL"
    if got != expected:
        all_pass = False
    print(f"{name:<35} {got:>6} {expected:>10} {status:>8}")

print("-" * 70)

if all_pass:
    print("\n🎉 ALL TESTS PASSED — Fase 0 data pipeline verified!")
else:
    print("\n⚠️  SOME TESTS FAILED — investigate before proceeding!")
    
    # Debug: print some token analysis for failed tests
    print("\n--- Debug info ---")
    for name, got, expected in tests:
        if got != expected:
            print(f"\n{name}: got {got}, expected {expected}")

# Additional diagnostic: show unique tokens matching patterns
print("\n--- Token diagnostics ---")
for pattern_name, pattern in [("شيط", "شيط"), ("شياطين", "شياطين"), ("آدم", "آدم"), ("عيسى", "عيسى"), ("موسى", "موسى"), ("محمد", "محمد")]:
    matching = [(t, len(refs)) for t, refs in word_index.items() if pattern in t]
    matching.sort(key=lambda x: -x[1])
    total = sum(c for _, c in matching)
    print(f"  Tokens containing '{pattern}': {len(matching)} unique, {total} total occurrences")
    for t, c in matching[:10]:
        print(f"    {t}: {c}")
