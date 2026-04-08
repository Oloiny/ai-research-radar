"""Seed the domains table with initial AI research domains."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.domain import Domain

DOMAINS = [
    {
        "slug": "agent-ecosystem",
        "name": "Agent生态",
        "name_en": "Agent Ecosystem",
        "description": "AI Agent 基础设施、工具链、编排框架、商业模式",
        "color": "#4F6EF7",
        "icon": "🤖",
        "sort_order": 1,
    },
    {
        "slug": "ai-video",
        "name": "AI视频生成",
        "name_en": "AI Video Generation",
        "description": "视频生成模型、商业化路径、C端与API模式",
        "color": "#8B5CF6",
        "icon": "🎬",
        "sort_order": 2,
    },
    {
        "slug": "ai-coding",
        "name": "AI编程",
        "name_en": "AI Coding",
        "description": "代码生成、编程Agent、开源微调、开发工具",
        "color": "#10B981",
        "icon": "💻",
        "sort_order": 3,
    },
    {
        "slug": "ai-security",
        "name": "AI安全",
        "name_en": "AI Security",
        "description": "供应链安全、提示注入、Agent安全、治理框架",
        "color": "#EF4444",
        "icon": "🛡️",
        "sort_order": 4,
    },
    {
        "slug": "ai-infrastructure",
        "name": "AI基础设施",
        "name_en": "AI Infrastructure",
        "description": "算力优化、模型压缩、训练效率、芯片与硬件",
        "color": "#F59E0B",
        "icon": "⚡",
        "sort_order": 5,
    },
    {
        "slug": "world-models",
        "name": "世界模型",
        "name_en": "World Models",
        "description": "世界模型、物理模拟、3D生成、游戏引擎替代",
        "color": "#06B6D4",
        "icon": "🌍",
        "sort_order": 6,
    },
    {
        "slug": "embodied-ai",
        "name": "具身智能",
        "name_en": "Embodied AI",
        "description": "机器人、Sim-to-Real、灵巧操作、量产工程化",
        "color": "#EC4899",
        "icon": "🦾",
        "sort_order": 7,
    },
    {
        "slug": "ai-gaming",
        "name": "AI×游戏",
        "name_en": "AI × Gaming",
        "description": "游戏AIGC、AI NPC、开发工具、创作经济、透明度",
        "color": "#F97316",
        "icon": "🎮",
        "sort_order": 8,
    },
    {
        "slug": "ai-business",
        "name": "AI商业模式",
        "name_en": "AI Business Models",
        "description": "SaaS颠覆、Token经济、企业AI度量、商业范式",
        "color": "#14B8A6",
        "icon": "💰",
        "sort_order": 9,
    },
    {
        "slug": "ai-geopolitics",
        "name": "AI地缘政治",
        "name_en": "AI Geopolitics",
        "description": "学术制裁、科技脱钩、出口管制、政策变化",
        "color": "#6366F1",
        "icon": "🌐",
        "sort_order": 10,
    },
    {
        "slug": "ai-research-frontier",
        "name": "AI研究前沿",
        "name_en": "AI Research Frontier",
        "description": "模型架构创新、训练范式、推理效率、基准评测",
        "color": "#A855F7",
        "icon": "🔬",
        "sort_order": 11,
    },
]


def seed():
    db = SessionLocal()
    try:
        for d in DOMAINS:
            exists = db.query(Domain).filter(Domain.slug == d["slug"]).first()
            if not exists:
                db.add(Domain(**d))
                print(f"  + Added domain: {d['name']}")
            else:
                print(f"  ~ Skipped (exists): {d['name']}")
        db.commit()
        print("Domain seeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
