# 华东户外线路库（可部署版）

这个目录是对外发布用的静态站版本。

## 目录结构

- `index.html`
  首页，对外展示本周线路、四大件、集合信息、底部 Tab
- `routes.html`
  历史线路沉淀页，对外展示每条线路的功课、风险和复盘
- `data/site.json`
  整个站点唯一内容源
- `assets/site.js`
  读取 JSON 并渲染页面的公共脚本

## 当前适合怎么用

### 你自己编辑
继续用本地编辑版：

- `test_huadong_admin.html`
- `test_huadong_outdoor_home.html`
- `test_huadong_routes.html`

编辑页里的内容现在保存在浏览器本地。

### 对外发布
发布 `huadong-site/` 这个目录。

## 上线建议

最推荐：

- Cloudflare Pages
- Vercel

这两个都适合纯静态页。

## 最简单发布方式

### Cloudflare Pages
1. 把这个仓库推到 GitHub
2. 在 Cloudflare Pages 新建项目
3. 选择这个仓库
4. Root Directory 填：`huadong-site`
5. Build Command 留空
6. Output Directory 留空或 `/`

### Vercel
1. 导入 GitHub 仓库
2. Root Directory 选：`huadong-site`
3. 不需要构建命令

## 内容更新方式

当前 deployable 版不依赖浏览器 `localStorage`，所以对外内容来自：

- `huadong-site/data/site.json`

也就是说，外部看到的内容要改，最终要改的是这份 JSON。

## 推荐更新流程

1. 先用本地编辑版整理内容
2. 把内容整理好后，同步到 `huadong-site/data/site.json`
3. 提交代码
4. 自动重新部署

## 当前限制

- `huadong-site/` 是纯静态对外展示版
- 不包含在线后台编辑功能
- 如果以后要“在线改内容，外部立刻生效”，需要再加后台或接 Notion / CMS
