"""Import trend_memory.json → trends + trend_snapshots tables."""
import sys
import os
import json
from datetime import date, datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.domain import Domain
from models.trend import Trend, TrendSnapshot


# Tag → domain slug mapping (same rules as topics import)
DOMAIN_RULES = [
    ({"Agent生态", "Agentic AI", "基础设施", "微信", "Stripe", "智能体"}, "agent-ecosystem"),
    ({"AI视频生成", "Sora", "可灵", "视频生成"}, "ai-video"),
    ({"AI编程", "Cursor", "Kimi", "代码生成", "编码Agent"}, "ai-coding"),
    ({"AI安全", "供应链安全", "LiteLLM", "Agent安全"}, "ai-security"),
    ({"NVIDIA", "算力", "TurboQuant", "AI压缩", "AI基础设施"}, "ai-infrastructure"),
    ({"世界模型", "游戏引擎", "3D生成"}, "world-models"),
    ({"具身智能", "机器人", "Sim-to-Real"}, "embodied-ai"),
    ({"AI x 游戏", "AIGC", "AI NPC", "游戏AI", "游戏开发"}, "ai-gaming"),
    ({"AI商业模式", "SaaS颠覆", "Token经济", "商业范式"}, "ai-business"),
    ({"NeurIPS", "学术制裁", "科技脱钩"}, "ai-geopolitics"),
    ({"模型架构", "训练优化", "LLM研究"}, "ai-research-frontier"),
]


def classify_trend_domain(related_tags: list[str], domain_map: dict[str, str]) -> str | None:
    tag_set = set(related_tags)
    for keywords, slug in DOMAIN_RULES:
        if tag_set & keywords:
            return domain_map.get(slug)
    return None


def compute_status(last_seen: date, occurrence_count: int, today: date = None) -> str:
    """Compute trend status from recency and frequency."""
    if today is None:
        today = date.today()
    days_ago = (today - last_seen).days

    if days_ago <= 7:
        if occurrence_count >= 4:
            return "rising"
        elif occurrence_count >= 2:
            return "emerging"
        else:
            return "emerging"
    elif days_ago <= 30:
        if occurrence_count >= 4:
            return "stable"
        else:
            return "stable"
    elif days_ago <= 60:
        return "cooling"
    else:
        return "dormant"


def compute_heat_score(occurrence_count: int, days_since_last: int) -> float:
    """Simple heuristic: higher count + more recent = higher heat."""
    recency_factor = max(0, 1.0 - days_since_last / 60.0)
    return round(min(occurrence_count * 15 * recency_factor, 100.0), 1)


def import_trends(trend_memory_path: str = None):
    if trend_memory_path is None:
        trend_memory_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "trend_memory.json"
        )

    with open(trend_memory_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        # Load domain map
        domains = db.query(Domain).all()
        domain_map = {d.slug: d.id for d in domains}

        today = date.today()
        trends_data = data.get("trends", [])
        imported = 0

        for t in trends_data:
            key = t["key"]
            # Skip if already exists
            exists = db.query(Trend).filter(Trend.key == key).first()
            if exists:
                print(f"  ~ Skipped (exists): {t['label']}")
                continue

            first_seen = date.fromisoformat(t["first_seen"])
            last_seen = date.fromisoformat(t["last_seen"])
            occurrence_count = t.get("occurrence_count", 1)
            related_tags = t.get("related_tags", [])
            recent_titles = t.get("recent_titles", [])

            status = compute_status(last_seen, occurrence_count, today)
            domain_id = classify_trend_domain(related_tags, domain_map)

            trend = Trend(
                key=key,
                label=t["label"],
                status=status,
                first_seen=first_seen,
                last_seen=last_seen,
                occurrence_count=occurrence_count,
                related_tags=related_tags,
                recent_titles=recent_titles[:5],
                domain_id=domain_id,
            )
            db.add(trend)
            db.flush()

            # Create snapshots for first_seen and last_seen
            days_since = (today - last_seen).days
            heat = compute_heat_score(occurrence_count, days_since)

            # First seen snapshot
            snap_first = TrendSnapshot(
                trend_id=trend.id,
                snapshot_date=first_seen,
                signal_count=1,
                topic_count=1,
                heat_score=round(heat * 0.3, 1),  # lower heat at first
            )
            db.add(snap_first)

            # Last seen snapshot (if different from first)
            if last_seen != first_seen:
                snap_last = TrendSnapshot(
                    trend_id=trend.id,
                    snapshot_date=last_seen,
                    signal_count=occurrence_count,
                    topic_count=min(occurrence_count, len(recent_titles)),
                    heat_score=heat,
                )
                db.add(snap_last)

            imported += 1
            print(f"  + [{status}] {t['label']} (count={occurrence_count}, heat={heat})")

        db.commit()
        print(f"\nImported {imported} trends.")
    finally:
        db.close()


if __name__ == "__main__":
    import_trends()
