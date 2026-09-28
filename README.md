# 番茄书籍页拆书助手（油猴脚本）

在番茄书籍详情页（`fanqienovel.com/page/*`）右上加浮动面板，当场拆解这本书的
简介文案：钩子类型、题材梗、数字实感、高位/信息差、AI高频词、对话/视角。

拆书规则与 Obsidian 插件 daoyu-studio / 女频导语评审 skill 同源。

## 功能

- **实时体检**：✅/⚠️ 逐项标注简介的爆文要素，还给出该书踩了哪些 AI 高频词
  （爆款书也会踩——可参考但别学）
- **复制素材卡**：一键导出与 fanqie-rank-scanner / Obsidian scan-card-box
  同格式的素材卡（frontmatter 带钩子类型与题材梗分析结果）
- 桌面版/移动版页面均兼容；SPA 路由切换自动重渲染

## 安装

Tampermonkey → 新建脚本 → 粘贴 `fanqie-book-analyzer.user.js` → 保存 →
打开任意书籍详情页（如 https://fanqienovel.com/page/7231424472606051384）。

## 链路位置

番茄榜单（fanqie-rank-scanner 批量扫）→ 点开感兴趣的书 → 本脚本单本深拆 →
素材卡进 Obsidian 卡盒 → scan-card-box 抽卡立项。
