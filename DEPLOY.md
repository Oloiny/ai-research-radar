# AI Research Radar — 服务器部署指令
# 交给服务器上的 CodeBuddy 执行

## 背景
这是一个 AI 深度研究网站，技术栈：PostgreSQL + FastAPI + Next.js + Nginx，用 Docker Compose 一键部署。

## 部署步骤

### 1. 拉取代码
```bash
cd ~ && git clone https://github.com/Oloiny/topic-radar.git && cd topic-radar
```

### 2. 创建环境变量文件
```bash
cp .env.production.example .env
```
然后编辑 `.env`，设置：
- `POSTGRES_PASSWORD` — 生成一个强随机密码（比如用 `openssl rand -base64 24`）
- `CORS_ORIGINS` — 填服务器公网 IP 或域名，格式 `http://你的IP`
- 其他保持默认即可

### 3. 启动所有服务
```bash
docker compose up -d --build
```
这会自动：
- 启动 PostgreSQL 并执行两个 migration SQL（建表）
- 构建并启动 FastAPI 后端
- 构建并启动 Next.js 前端
- 启动 Nginx 反向代理（80 端口）
- 启动定时信号采集器（每 12 小时自动爬取）

### 4. 等待构建完成后，检查服务状态
```bash
docker compose ps
docker compose logs backend --tail 20
docker compose logs frontend --tail 20
```
确认所有容器都是 running 状态。

### 5. 初始化种子数据
```bash
# 初始化领域分类（11 个 AI 领域）
docker compose exec backend python scripts/seed_domains.py

# 导入现有的研究专题（如果 workspace/topics.json 存在）
docker compose exec backend python scripts/import_topics_json.py

# 导入趋势记忆
docker compose exec backend python scripts/import_trend_memory.py

# 导入信号
docker compose exec backend python scripts/import_signals_to_db.py
```

### 6. 验证
- 访问 `http://服务器IP` — 应该看到首页
- 访问 `http://服务器IP/api/v1/research` — 应该返回 JSON 数据
- 访问 `http://服务器IP/health` — 应该返回 `{"status":"ok"}`

## 可能遇到的问题

### Next.js 构建失败（standalone 模式需要配置）
如果前端构建报错，检查 `frontend/next.config.js` 是否有 `output: "standalone"`，
以及 `frontend/package.json` 是否有 `build` 脚本。

### 数据库连接失败
检查 `docker compose logs db` 看 PostgreSQL 是否正常启动。
确认 `.env` 里的 `POSTGRES_PASSWORD` 没有特殊字符导致解析问题。

### 端口冲突
如果 80 端口被占用，修改 `docker-compose.yml` 中 nginx 的端口映射，比如改为 `"8080:80"`。

### 导入脚本路径问题
如果 `import_topics_json.py` 报找不到 workspace/topics.json，
需要先把本地的 `workspace/topics.json` 和 `trend_memory.json` 复制到服务器的项目目录下。

## 后续维护
- 更新代码：`git pull && docker compose up -d --build`
- 查看日志：`docker compose logs -f backend`
- 重启服务：`docker compose restart`
- 手动触发采集：`docker compose exec collector /app/collect_and_import.sh`
