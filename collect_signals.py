# -*- coding: utf-8 -*-
"""
并行信号采集脚本 - 替代22个Claude Agent，将4-5小时缩短到1-2分钟。

使用 ThreadPoolExecutor 并行抓取所有 RSS / daily-site 信源，
输出 workspace/signals.json。
"""

import json
import os
import sys
import re
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone

# Windows控制台UTF-8输出
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import feedparser
import requests

# ── 配置 ──────────────────────────────────────────────────
WORKSPACE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workspace")
TIMEOUT = 15  # 单个HTTP请求超时（秒）
MAX_WORKERS = 12  # 并行线程数

TODAY = datetime.now(timezone.utc).date()

# ── 通用工具 ──────────────────────────────────────────────

def safe_fetch(url, timeout=TIMEOUT):
    """安全HTTP GET，失败返回None"""
    try:
        resp = requests.get(url, timeout=timeout, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SignalCollector/1.0"
        })
        if resp.status_code == 200:
            return resp.text
    except Exception:
        pass
    return None


def parse_rss(url, max_items=8, days=14, keywords=None):
    """
    抓取RSS，返回条目列表。
    keywords: 若提供，只保留标题含任一关键词的条目（不区分大小写）。
    """
    try:
        feed = feedparser.parse(url)
    except Exception:
        return []

    cutoff = TODAY - timedelta(days=days)
    items = []

    for entry in feed.entries:
        if len(items) >= max_items:
            break

        # 日期过滤
        pub_date = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                pub_date = datetime(*entry.published_parsed[:6]).date()
            except Exception:
                pass
        elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
            try:
                pub_date = datetime(*entry.updated_parsed[:6]).date()
            except Exception:
                pass

        if pub_date and pub_date < cutoff:
            continue

        title = entry.get("title", "").strip()
        summary = entry.get("summary", "").strip()
        link = entry.get("link", "")

        # 关键词过滤
        if keywords:
            title_lower = title.lower()
            if not any(kw.lower() in title_lower for kw in keywords):
                continue

        # 清理HTML标签
        summary = re.sub(r"<[^>]+>", "", summary)[:300]

        items.append({
            "title": title,
            "summary": summary,
            "url": link,
            "date": str(pub_date) if pub_date else str(TODAY),
        })

    return items


def make_signal(source, title, summary, url, date=None, credibility="标题推断"):
    """构建标准signal字典"""
    return {
        "source": source,
        "date": date or str(TODAY),
        "title": title,
        "summary": summary[:200] if summary else "",
        "credibility": credibility,
        "url": url,
    }


def fetch_full_text(url, max_chars=2000):
    """尝试读取原文前N个字符用于摘要，失败返回None"""
    text = safe_fetch(url)
    if not text:
        return None
    # 去HTML标签
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.S)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_chars] if text else None


# ── 各信源采集函数 ────────────────────────────────────────

def collect_daily_site(category, source_name, days=5):
    """采集 daily-site (game 或 ai)"""
    signals = []
    for i in range(days):
        d = TODAY - timedelta(days=i)
        url = f"https://raw.githubusercontent.com/moxxiRan/daily-site/main/{category}/{d.year}/{d.month:02d}/{d.day:02d}.md"
        content = safe_fetch(url)
        if not content:
            continue

        # 拆解为独立条目：按 ## 或 ### 或 - 开头的行分段
        sections = re.split(r"\n(?=#{1,3}\s|[-*]\s\*\*)", content)
        for sec in sections:
            sec = sec.strip()
            if len(sec) < 10:
                continue
            # 提取标题（第一行）
            lines = sec.split("\n")
            title = re.sub(r"^[#\-*\s]+", "", lines[0]).strip()
            if len(title) < 5:
                continue
            body = " ".join(lines[1:]).strip()[:200]
            signals.append(make_signal(
                source_name, title, body, url,
                date=str(d), credibility="原文已读"
            ))

    return signals


def collect_rss_source(source_name, rss_url, max_items=8, days=14,
                       keywords=None, read_full=0):
    """
    通用RSS采集。
    read_full: 最多读几篇原文（0=不读原文，全部标题推断）
    """
    items = parse_rss(rss_url, max_items=max_items, days=days, keywords=keywords)
    signals = []
    full_read_count = 0

    for item in items:
        credibility = "标题推断"
        summary = item["summary"]

        # 尝试读原文
        if read_full > 0 and full_read_count < read_full and item["url"]:
            full_text = fetch_full_text(item["url"])
            if full_text:
                summary = full_text[:300]
                credibility = "原文已读"
                full_read_count += 1

        signals.append(make_signal(
            source_name, item["title"], summary,
            item["url"], date=item["date"], credibility=credibility
        ))

    return signals


# ── 22个信源定义 ──────────────────────────────────────────

SOURCE_CONFIGS = [
    # (函数名, 参数)
    ("daily-site-game", lambda: collect_daily_site("game", "daily-site-game", days=5)),
    ("daily-site-ai", lambda: collect_daily_site("ai", "daily-site-ai", days=5)),

    ("Import AI", lambda: collect_rss_source(
        "Import AI", "https://importai.substack.com/feed",
        max_items=3, days=30, read_full=2)),
    ("The Batch", lambda: collect_rss_source(
        "The Batch", "https://www.deeplearning.ai/the-batch/feed/",
        max_items=6, days=30, read_full=2)),
    ("arXiv cs.AI", lambda: collect_rss_source(
        "arXiv cs.AI", "https://rss.arxiv.org/rss/cs.AI",
        max_items=8, days=30, keywords=["agent", "reasoning", "multimodal", "game", "LLM", "GPT"])),
    ("OpenAI Blog", lambda: collect_rss_source(
        "OpenAI Blog", "https://openai.com/blog/rss.xml",
        max_items=5, days=14, read_full=2)),
    ("Hugging Face Blog", lambda: collect_rss_source(
        "Hugging Face Blog", "https://huggingface.co/blog/feed.xml",
        max_items=5, days=14, read_full=2)),
    ("Google AI Blog", lambda: collect_rss_source(
        "Google AI Blog", "https://blog.google/technology/ai/rss/",
        max_items=5, days=14, read_full=2)),
    ("VentureBeat AI", lambda: collect_rss_source(
        "VentureBeat AI", "https://venturebeat.com/category/ai/feed/",
        max_items=8, days=14)),
    ("MIT Tech Review AI", lambda: collect_rss_source(
        "MIT Technology Review AI", "https://www.technologyreview.com/topic/artificial-intelligence/feed",
        max_items=5, days=14, read_full=2)),
    ("Crunchbase News", lambda: collect_rss_source(
        "Crunchbase News", "https://news.crunchbase.com/feed/",
        max_items=8, days=7,
        keywords=["AI", "game", "gaming", "artificial intelligence", "machine learning"])),
    ("NVIDIA Developer Blog", lambda: collect_rss_source(
        "NVIDIA Developer Blog", "https://developer.nvidia.com/blog/feed/",
        max_items=6, days=14, read_full=2)),
    ("AWS ML Blog", lambda: collect_rss_source(
        "AWS ML Blog", "https://aws.amazon.com/blogs/machine-learning/feed/",
        max_items=5, days=14)),
    ("Sequoia Capital Blog", lambda: collect_rss_source(
        "Sequoia Capital Blog", "https://www.sequoiacap.com/feed/",
        max_items=5, days=30, read_full=2)),
    ("Game Developer", lambda: collect_rss_source(
        "Game Developer", "https://www.gamedeveloper.com/rss.xml",
        max_items=5, days=7,
        keywords=["AI", "ML", "machine learning", "generative"])),
    ("Unity Blog", lambda: collect_rss_source(
        "Unity Blog", "https://unity.com/blog/feed",
        max_items=5, days=14,
        keywords=["AI", "ML", "generative", "Muse", "machine learning"])),
    ("Unreal Engine Blog", lambda: collect_rss_source(
        "Unreal Engine Blog", "https://www.unrealengine.com/en-US/rss",
        max_items=4, days=14,
        keywords=["AI", "ML", "generative", "MetaHuman", "PCG"])),
    ("GameDiscoverCo", lambda: collect_rss_source(
        "GameDiscoverCo", "https://newsletter.gamediscover.co/feed",
        max_items=8, days=30, read_full=2)),
    ("Simon Willison's Blog", lambda: collect_rss_source(
        "Simon Willison's Blog", "https://simonwillison.net/atom/everything/",
        max_items=5, days=14, read_full=2)),
    ("Hacker News", lambda: collect_rss_source(
        "Hacker News", "https://hnrss.org/frontpage",
        max_items=8, days=3,
        keywords=["AI", "LLM", "GPT", "agent", "game", "generative", "Claude", "Gemini"])),
    ("Product Hunt", lambda: collect_rss_source(
        "Product Hunt", "https://www.producthunt.com/feed",
        max_items=6, days=3,
        keywords=["AI", "game", "generative"])),
]


def main():
    os.makedirs(WORKSPACE, exist_ok=True)

    print(f"=== 并行信号采集 ===")
    print(f"日期: {TODAY}")
    print(f"信源数: {len(SOURCE_CONFIGS)}")
    print(f"并行线程: {MAX_WORKERS}")
    print()

    all_signals = []
    source_stats = {}
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_name = {}
        for name, fn in SOURCE_CONFIGS:
            future = executor.submit(fn)
            future_to_name[future] = name

        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                signals = future.result(timeout=60)
                all_signals.extend(signals)
                source_stats[name] = len(signals)
                print(f"  ✓ {name}: {len(signals)} 条")
            except Exception as e:
                source_stats[name] = 0
                print(f"  ✗ {name}: 失败 ({e})")

    elapsed = time.time() - start_time

    # 写入signals.json
    out_path = os.path.join(WORKSPACE, "signals.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_signals, f, ensure_ascii=False, indent=2)

    print()
    print(f"=== 采集完成 ===")
    print(f"总信号数: {len(all_signals)}")
    print(f"耗时: {elapsed:.1f} 秒")
    print(f"各信源: {json.dumps(source_stats, ensure_ascii=False)}")
    print(f"输出: {out_path}")

    # 返回统计供Orchestrator使用
    return {
        "total": len(all_signals),
        "elapsed_seconds": round(elapsed, 1),
        "by_source": source_stats,
    }


if __name__ == "__main__":
    stats = main()
