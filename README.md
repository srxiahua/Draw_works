# DrawWorks 🐰

二次元创作者的个人手帐站：上传作品、AI 风格诊断、成长轨迹与公开画廊。粉紫糖果风 UI，适合记录每一张画的进步。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![SQLite](https://img.shields.io/badge/SQLite-libsql-green)

## 功能一览

| 板块 | 说明 |
|------|------|
| **欢迎首页** | 兔子 mascot + 作品数 / 创作天数 / 等级 |
| **作品上传** | 拖拽上传、动画进度条；支持图片 / 链接 / 文字三种投递 |
| **我的画廊** | 12 张瀑布流展示，顶部分类筛选，点击查看详情 |
| **AI 风格诊断** | 创作类型饼图、能力雷达、标签云、成长趋势线 |
| **成长建议** | 人体动态 / 场景透视 / 色彩搭配三条学习路径，可一键复制 |
| **创作 DNA** | 完整报告页 `/dashboard/dna` |
| **公开画廊** | `/gallery` 对外展示已公开作品 |

> 单人本地站，**无需登录**。首次访问自动创建唯一用户。

## 技术栈

- **框架**：Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- **数据库**：SQLite（本地 `libsql`）/ 生产推荐 [Turso](https://turso.tech)
- **存储**：本地 `public/uploads` / Vercel 生产用 Blob
- **AI**：小米 Mimo / 通义 / 智谱 / 豆包（`AI_PROVIDER=auto` 失败时本地图像分析兜底）
- **图表**：Recharts

## 快速开始（本地）

### 1. 克隆与安装

```bash
git clone https://github.com/<你的用户名>/Draw_works.git
cd Draw_works
npm install
```

### 2. 环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`（**切勿提交到 Git**）：

| 变量 | 说明 | 本地示例 |
|------|------|----------|
| `DATABASE_URL` | 数据库 | `file:./data/drawworks.db` |
| `NEXT_PUBLIC_APP_URL` | 站点 URL | `http://localhost:3000` |
| `AI_PROVIDER` | AI 引擎 | `auto` / `local` / `mimo` … |
| `MIMO_API_KEY` | 小米 Mimo Key（可选） | 在 `.env.local` 填写 |
| `STORAGE_DRIVER` | 存储驱动 | `local` |

### 3. 初始化并启动

```bash
npm run setup    # 建表 + 种子分类
npm run dev      # http://localhost:3000
```

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 欢迎首页（统计 / 上传 / 画廊 / AI 诊断 / 学习路径） |
| `/dashboard` | 投递区 + 全部作品管理 |
| `/dashboard/archive` | 创作档案（时间线 + 分类矩阵） |
| `/dashboard/dna` | 创作 DNA 完整报告 |
| `/dashboard/works/[id]` | 作品详情 |
| `/gallery` | 公开作品集 |
| `/work/[id]` | 公开作品页 |

## AI 提供商

在 `.env.local` 设置 `AI_PROVIDER`：

| 值 | 说明 |
|----|------|
| `auto` | 优先云端，失败走本地分析（推荐） |
| `local` | 仅本地图像分析，无需 API Key |
| `mimo` | 小米 Mimo |
| `qwen` | 通义千问 VL |
| `zhipu` | 智谱 GLM-4V |
| `doubao` | 豆包视觉 |

云端识图需能访问作品缩略图公网 URL，生产环境请设置正确的 `NEXT_PUBLIC_APP_URL`。

## 部署

### 方式 A：Vercel（推荐，公网链接）

1. Fork / Push 本仓库到 GitHub  
2. 在 [Vercel](https://vercel.com) 导入项目  
3. 创建 [Turso](https://turso.tech) 免费数据库，获取 `libsql://…` 连接串  
4. 在 Vercel 项目 **Settings → Environment Variables** 配置：

```env
DATABASE_URL=libsql://your-db.turso.io?authToken=xxx
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
AI_PROVIDER=local
STORAGE_DRIVER=vercel-blob
```

5. 在 Vercel 项目 **Storage → Blob** 创建 Blob Store（自动注入 `BLOB_READ_WRITE_TOKEN`）  
6. 可选：在 Vercel 添加 `MIMO_API_KEY` 等 AI Key（**只在 Vercel 控制台填写，不要写进代码**）  
7. 重新 Deploy

或使用 CLI：

```bash
npx vercel link
npx vercel env add DATABASE_URL production
npx vercel env add NEXT_PUBLIC_APP_URL production
npx vercel env add AI_PROVIDER production   # 填 local
npx vercel env add STORAGE_DRIVER production  # 填 vercel-blob
npx vercel --prod
```

### 方式 B：Docker（数据与图片持久化）

适合自有服务器 / Railway / Render 等支持 Volume 的平台：

```bash
docker build -t drawworks .
docker run -d -p 3000:3000 \
  -v drawworks-data:/app/data \
  -v drawworks-uploads:/app/public/uploads \
  -e NEXT_PUBLIC_APP_URL=https://你的域名 \
  -e AI_PROVIDER=local \
  drawworks
```

首次启动前可在容器内执行 `npm run setup` 初始化分类数据。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 生产启动 |
| `npm run setup` | `db:push` + `db:seed` |
| `npm run db:push` | 同步数据库 Schema |
| `npm run db:seed` | 写入默认分类 |

## 安全说明

- `.env.local`、`.env` 等已在 `.gitignore` 中忽略，**API Key 不会进入仓库**
- 仅提交 `.env.example` 作为配置模板（值为空）
- 生产密钥请只在 Vercel / 服务器环境变量中配置

## 项目结构

```
app/              # Next.js App Router 页面与 API
components/       # UI 组件（首页、上传、图表等）
lib/
  ai/             # AI 分析与洞察
  db/             # Drizzle Schema 与查询
  storage/        # 本地 / Blob / OSS 存储
public/uploads/   # 本地上传目录（git 忽略实际文件）
scripts/          # 种子数据、批量重分析
data/             # SQLite 文件（git 忽略）
```

## 说明

AI 分析结果仅供参考，不构成专业艺术评价。作品版权归上传者所有。

## License

MIT
