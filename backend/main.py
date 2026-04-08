"""AI Research Radar — FastAPI 后端入口"""
import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base

# 导入所有模型（确保表在启动时创建）
from models import (
    DataSource, RawSignal, AnalysisRun, TopicCandidate, Vote, PublishedTopic,
    Domain, ResearchTopic, TopicEvidence, Trend, TrendSnapshot, TopicTrend,
)

# 公开研究平台路由
from api.research.router import router as research_router
from api.trends.router import router as trends_router
from api.domains.router import router as domains_router
from api.search.router import router as search_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured")
    yield


app = FastAPI(
    title="AI Research Radar API",
    description="AI 领域深度研究、趋势追踪与领域全景",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(research_router)
app.include_router(trends_router)
app.include_router(domains_router)
app.include_router(search_router)


@app.get("/health")
def health():
    return {"status": "ok"}
