"""Import workspace/topics.json → research_topics + topic_evidence tables.

Handles:
- Score decomposition (single score → 6 dimensions)
- Evidence extraction from credibility_note
- Domain classification by tag matching
- Slug generation from Chinese titles
- Research direction extraction from body text
"""
import sys
import os
import json
import re
from datetime import datetime, date

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.domain import Domain
from models.research_topic import ResearchTopic
from models.topic_evidence import TopicEvidence
from analyzer.slug_generator import title_to_slug, ensure_unique_slug


# Tag → domain slug mapping rules (first match wins)
DOMAIN_RULES = [
    ({"Agent生态", "Agentic AI", "基础设施", "微信", "Stripe", "OpenClaw"}, "agent-ecosystem"),
    ({"AI视频生成", "Sora", "可灵", "Sand.ai", "视频生成"}, "ai-video"),
    ({"AI编程", "Cursor", "Kimi", "多智能体", "代码生成", "微调"}, "ai-coding"),
    ({"AI安全", "供应链安全", "LiteLLM", "Agent安全"}, "ai-security"),
    ({"TurboQuant", "AI压缩", "算力优化", "量化", "内存", "NVIDIA", "算力"}, "ai-infrastructure"),
    ({"世界模型", "游戏引擎", "3D架构", "InSpatio-World"}, "world-models"),
    ({"具身智能", "机器人", "Sim-to-Real", "宇树"}, "embodied-ai"),
    ({"AI x 游戏", "AIGC", "游戏", "AI NPC", "Pearl Abyss", "CCG", "DLSS"}, "ai-gaming"),
    ({"AI商业模式", "SaaS颠覆", "商业化", "Token经济"}, "ai-business"),
    ({"NeurIPS", "学术制裁", "科技脱钩", "AI地缘政治", "CCF"}, "ai-geopolitics"),
    ({"模型架构", "训练优化", "推理效率", "LLM研究"}, "ai-research-frontier"),
]


def classify_domain(tags: list[str], domain_map: dict[str, str]) -> str | None:
    """Match topic tags to a domain slug."""
    tag_set = set(tags)
    for keywords, slug in DOMAIN_RULES:
        if tag_set & keywords:
            return domain_map.get(slug)
    return None


def decompose_score(total: float) -> dict:
    """Reverse-engineer 6 dimensions from a single total score.

    For legacy data only — new pipeline will produce real scores.
    Uses proportional allocation based on surplus above base (6.0).
    """
    surplus = max(0, total - 6.0)  # 0.0 to 3.5
    ratio = min(surplus / 3.5, 1.0)

    return {
        "score_timeliness": round(min(ratio * 1.1, 1.0), 1),
        "score_implementability": round(min(ratio * 0.9, 1.0), 1),
        "score_impact": round(min(ratio * 1.0, 1.0), 1),
        "score_material_richness": round(min(ratio * 0.35, 0.3), 1),
        "score_actionability": round(min(ratio * 0.3, 0.3), 1),
        "score_innovation": round(min(ratio * 0.3, 0.3), 1),
        "score_trend_bonus": round(min(ratio * 0.25, 0.3), 1),
    }


def extract_evidence(credibility_note: str) -> list[dict]:
    """Parse credibility_note string into evidence records.

    Input format: "Stripe六层架构(原文已读)、微信WorkBuddy(原文已读)、OpenClaw(标题推断)"
    """
    if not credibility_note:
        return []

    evidence = []
    # Match: text(credibility_label)
    pattern = r'([^、，,]+?)\(([^)]+)\)'
    matches = re.findall(pattern, credibility_note)

    for i, (title, cred) in enumerate(matches):
        title = title.strip()
        # Normalize credibility label
        if '原文已读' in cred and '多源' in cred:
            credibility = '原文已读·多源'
        elif '原文已读' in cred:
            credibility = '原文已读'
        elif '标题推断' in cred:
            credibility = '标题推断'
        else:
            credibility = '标题推断'

        evidence.append({
            "signal_title": title,
            "credibility": credibility,
            "sort_order": i,
        })

    return evidence


def extract_research_direction(body: str) -> str | None:
    """Extract the last paragraph as research direction if it starts with actionable cue."""
    if not body:
        return None
    paragraphs = [p.strip() for p in body.split('\n') if p.strip()]
    if not paragraphs:
        return None
    last = paragraphs[-1]
    # Check for actionable cue words
    cues = ['如果你', '这个方向', '关注点', '当下最', '现在最', '这是一个']
    if any(last.startswith(cue) for cue in cues):
        return last
    return None


def import_topics(topics_path: str = None):
    if topics_path is None:
        topics_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "workspace", "topics.json"
        )

    with open(topics_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    db = SessionLocal()
    try:
        # Load domain map: slug → id
        domains = db.query(Domain).all()
        domain_map = {d.slug: d.id for d in domains}

        batch_date_str = data.get("date", "2026-03-27")
        batch_date = date.fromisoformat(batch_date_str)
        core_insight = data.get("core_insight", "")
        signal_window = data.get("signal_window", "")

        existing_slugs = set(
            r[0] for r in db.query(ResearchTopic.slug).all()
        )

        topics = data.get("topics", [])
        imported = 0

        for topic in topics:
            title = topic["title"]
            slug = title_to_slug(title)
            slug = ensure_unique_slug(slug, existing_slugs)
            existing_slugs.add(slug)

            score_total = topic["score"]
            scores = decompose_score(score_total)

            body = topic.get("body", "")
            research_direction = extract_research_direction(body)

            domain_id = classify_domain(topic.get("tags", []), domain_map)

            rt = ResearchTopic(
                slug=slug,
                title=title,
                body=body,
                score_total=score_total,
                **scores,
                credibility_note=topic.get("credibility_note"),
                research_direction=research_direction,
                core_insight=core_insight,
                signal_window=signal_window,
                tags=topic.get("tags", []),
                domain_id=domain_id,
                batch_date=batch_date,
                rank_in_batch=topic.get("id"),
                status="published",
                published_at=datetime.utcnow(),
            )
            db.add(rt)
            db.flush()  # get the id

            # Create evidence records
            evidence_items = extract_evidence(topic.get("credibility_note", ""))
            for ev in evidence_items:
                te = TopicEvidence(
                    topic_id=rt.id,
                    signal_title=ev["signal_title"],
                    credibility=ev["credibility"],
                    sort_order=ev["sort_order"],
                )
                db.add(te)

            imported += 1
            print(f"  + [{score_total}] {title} → {slug} ({len(evidence_items)} evidence)")

        db.commit()
        print(f"\nImported {imported} research topics.")
    finally:
        db.close()


if __name__ == "__main__":
    import_topics()
