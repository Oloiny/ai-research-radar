"""Slug generator: Chinese title → URL-friendly slug using pypinyin."""
import re
import unicodedata
from pypinyin import lazy_pinyin, Style
from slugify import slugify


def title_to_slug(title: str, max_length: int = 80) -> str:
    """Convert a Chinese/English title to a URL-friendly slug.

    Examples:
        "Agent生态进入「基建抢滩」阶段" → "agent-sheng-tai-jin-ru-ji-jian-qiang-tan-jie-duan"
        "AI视频C端路线坍塌，API接棒?" → "ai-shi-pin-c-duan-lu-xian-tan-ta-api-jie-bang"
    """
    # Remove special punctuation
    cleaned = re.sub(r'[「」『』【】《》""''，。！？、；：\s]+', ' ', title)
    cleaned = cleaned.strip()

    # Check if text contains Chinese characters
    has_chinese = any('\u4e00' <= ch <= '\u9fff' for ch in cleaned)

    if has_chinese:
        # Convert Chinese chars to pinyin, keep ASCII as-is
        parts = []
        for ch in cleaned:
            if '\u4e00' <= ch <= '\u9fff':
                py = lazy_pinyin(ch, style=Style.NORMAL)
                parts.extend(py)
            elif ch.isascii() and (ch.isalnum() or ch in (' ', '-')):
                parts.append(ch.lower())
            elif ch == ' ':
                parts.append(' ')
        raw = ' '.join(''.join(parts).split())
        slug = slugify(raw, max_length=max_length)
    else:
        slug = slugify(cleaned, max_length=max_length)

    return slug or "untitled"


def ensure_unique_slug(slug: str, existing_slugs: set) -> str:
    """Append a counter if slug already exists."""
    if slug not in existing_slugs:
        return slug
    counter = 2
    while f"{slug}-{counter}" in existing_slugs:
        counter += 1
    return f"{slug}-{counter}"
