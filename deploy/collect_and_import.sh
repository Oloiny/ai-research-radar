#!/bin/bash
# 信号采集 + 导入脚本（由 cron 每12小时调用）
# 纯爬虫，不需要 LLM

set -e

echo "$(date) — Starting signal collection..."

cd /app

# 1. 运行信号采集（纯 RSS/爬虫）
python collect_signals.py
echo "$(date) — Signal collection done."

# 2. 导入信号到数据库
PYTHONPATH=/app/backend python -m backend.scripts.import_signals_to_db
echo "$(date) — Signal import done."

echo "$(date) — Collection cycle complete."
