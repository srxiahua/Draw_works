# 修改日志

本文件记录 DrawWorks 各版本的变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.0.1] - 2026-06-03

### 新增

- 粉紫糖果风欢迎首页：兔子 mascot、作品数 / 创作天数 / 等级统计
- 作品上传：拖拽上传、动画进度条；支持图片 / 链接 / 文字三种投递
- 我的画廊：12 张瀑布流展示，顶部分类筛选，点击查看详情
- AI 风格诊断：创作类型饼图、能力雷达、风格标签云、成长趋势线
- 成长建议：人体动态 / 场景透视 / 色彩搭配三条学习路径，带进度条与一键复制
- 创作 DNA 报告页（`/dashboard/dna`）、创作档案、公开画廊
- 本地 SQLite + libsql，无需登录的单人站点
- AI 多提供商支持（Mimo / 通义 / 智谱 / 豆包），`auto` 模式本地分析兜底
- Vercel Blob 存储适配与 Docker 部署配置

### 文档

- 完整 README：本地启动、Vercel / Docker 部署、环境变量说明
- 在线演示：https://draw-works.vercel.app

### 安全

- `.env.local` 及密钥文件纳入 `.gitignore`，仅提交 `.env.example` 模板

[0.0.1]: https://github.com/srxiahua/Draw_works/releases/tag/v0.0.1
