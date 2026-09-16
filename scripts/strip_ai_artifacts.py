#!/usr/bin/env python3
"""Mechanical cleaner for AI punctuation artifacts in portfolio docs.

Processes HTML (and markdown) under docs/:
  - Replaces em dashes (— / &mdash; / &#8212;) used as AI punctuation
  - Replaces spaced en dashes used as AI punctuation
  - Skips script / style / code / pre / svg so charts and formulas stay safe
  - Leaves S/4HANA, URLs, and protected technical spans alone

Prefer · , commas, periods, or "and" over em/en dashes in body copy.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

# Tags whose inner content must not be rewritten.
PROTECTED_TAGS = ("script", "style", "code", "pre", "svg", "kbd", "samp")
PROTECTED_RE = re.compile(
    r"<(?P<tag>" + "|".join(PROTECTED_TAGS) + r")\b[^>]*>.*?</(?P=tag)\s*>",
    re.IGNORECASE | re.DOTALL,
)

# HTML comments (e.g. chart config) — leave alone.
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)

# Attribute values that are URLs or paths should not be rewritten mid-URL.
# We only rewrite text nodes / attribute text via the unprotected stream.

EM_CHARS = ("\u2014",)  # —
EN_CHARS = ("\u2013",)  # –

EM_ENTITIES = ("&mdash;", "&#8212;", "&#x2014;", "&#X2014;")
EN_ENTITIES = ("&ndash;", "&#8211;", "&#x2013;", "&#X2013;")


def _replace_dashes_in_text(text: str) -> str:
    """Replace AI-style dashes in a non-protected text segment."""
    # Normalize entities to unicode first for uniform handling.
    for ent in EM_ENTITIES:
        text = re.sub(re.escape(ent), "\u2014", text, flags=re.IGNORECASE)
    for ent in EN_ENTITIES:
        text = re.sub(re.escape(ent), "\u2013", text, flags=re.IGNORECASE)

    # Spaced em dash → middle dot (common AI "aside" punctuation).
    # Only horizontal whitespace so HTML indentation / newlines stay intact.
    text = re.sub(r"[ \t]*\u2014[ \t]*", " · ", text)

    # Spaced en dash used as punctuation (not a compact range).
    text = re.sub(r"[ \t]+\u2013[ \t]+", " · ", text)

    # Digit–digit ranges (years, versions): keep a plain hyphen.
    text = re.sub(r"(?<=\d)\u2013(?=\d)", "-", text)

    # Letter–letter compounds (Buffalo–Detroit, train–serve): hyphenate.
    # Do not touch S/4HANA-style slashes; this only targets en dashes.
    text = re.sub(r"(?<=\w)\u2013(?=\w)", "-", text)

    # Any remaining bare em/en dashes → middle dot / hyphen.
    text = text.replace("\u2014", " · ")
    text = text.replace("\u2013", "-")

    # Tidy only around inserted middle dots — do not touch HTML indentation.
    text = re.sub(r"[ \t]*·[ \t]*", " · ", text)
    text = re.sub(r" · (,|\.|;)", r"\1", text)
    return text


def _split_protected(html: str) -> list[tuple[str, bool]]:
    """Return (segment, is_protected) pieces covering the whole string."""
    markers: list[tuple[int, int]] = []
    for rx in (PROTECTED_RE, COMMENT_RE):
        for m in rx.finditer(html):
            markers.append((m.start(), m.end()))
    markers.sort()
    # Merge overlaps.
    merged: list[tuple[int, int]] = []
    for start, end in markers:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))

    parts: list[tuple[str, bool]] = []
    cursor = 0
    for start, end in merged:
        if cursor < start:
            parts.append((html[cursor:start], False))
        parts.append((html[start:end], True))
        cursor = end
    if cursor < len(html):
        parts.append((html[cursor:], False))
    return parts


def clean_markup(content: str) -> str:
    parts = _split_protected(content)
    out: list[str] = []
    for segment, protected in parts:
        if protected:
            out.append(segment)
        else:
            out.append(_replace_dashes_in_text(segment))
    return "".join(out)


def clean_markdown(content: str) -> str:
    """Markdown: protect fenced code and inline `code`."""
    fences: list[str] = []

    def _stash_fence(m: re.Match[str]) -> str:
        fences.append(m.group(0))
        return f"\0FENCE{len(fences) - 1}\0"

    content = re.sub(r"```[\s\S]*?```", _stash_fence, content)

    inlines: list[str] = []

    def _stash_inline(m: re.Match[str]) -> str:
        inlines.append(m.group(0))
        return f"\0INLINE{len(inlines) - 1}\0"

    content = re.sub(r"`[^`\n]+`", _stash_inline, content)
    content = _replace_dashes_in_text(content)
    for i, block in enumerate(inlines):
        content = content.replace(f"\0INLINE{i}\0", block)
    for i, block in enumerate(fences):
        content = content.replace(f"\0FENCE{i}\0", block)
    return content


def iter_targets(docs: Path) -> list[Path]:
    files: list[Path] = []
    for pattern in ("**/*.html", "**/*.md", "**/*.markdown"):
        files.extend(sorted(docs.glob(pattern)))
    # De-dupe while preserving order.
    seen: set[Path] = set()
    unique: list[Path] = []
    for f in files:
        if f not in seen and f.is_file():
            seen.add(f)
            unique.append(f)
    return unique


def process_file(path: Path, dry_run: bool = False) -> bool:
    original = path.read_text(encoding="utf-8")
    if path.suffix.lower() in {".md", ".markdown"}:
        updated = clean_markdown(original)
    else:
        updated = clean_markup(original)
    if updated == original:
        return False
    if not dry_run:
        path.write_text(updated, encoding="utf-8")
    return True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--docs",
        type=Path,
        default=DOCS,
        help="Docs root to process (default: <repo>/docs)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report files that would change without writing",
    )
    args = parser.parse_args(argv)

    docs = args.docs.resolve()
    if not docs.is_dir():
        print(f"error: docs root not found: {docs}", file=sys.stderr)
        return 1

    changed = 0
    for path in iter_targets(docs):
        if process_file(path, dry_run=args.dry_run):
            changed += 1
            rel = path.relative_to(docs.parent) if docs.parent in path.parents else path
            print(f"{'would change' if args.dry_run else 'updated'}: {rel}")

    print(f"{changed} file(s) {'would change' if args.dry_run else 'updated'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
