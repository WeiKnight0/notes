# WeiKnight Notes

独立的静态学习笔记站点，包含 Markdown 阅读器和算法模板工具。笔记、Markdown 原文与图片作为公开文件发布，不需要后端或数据库。

## 本地开发

需要 Node.js 22.12 或更高版本。在本仓库根目录运行：

```bash
npm ci
npm run check
npm run build
npm run verify
npm run preview
```

默认预览地址为 `http://127.0.0.1:4321/notes/`；若端口已被占用，可在启动预览时设置 `PORT`。修改笔记或模板后重新构建。`npm run check` 测试链接重写和站点路径，`npm run verify` 校验生成的页面、笔记内容和站内资源。

## 内容与产物

- `notes/content/`：笔记 Markdown 和配图。`index.md` 是笔记首页，其他 Markdown 文件以同名目录发布，例如 `CSAPP/index.md` 对应 `/notes/CSAPP/`。
- `notes/reader/`：阅读器，支持目录、公式、代码高亮和打印；更多说明见 `notes/reader/README.md`。
- `notes/algorithm-templates/content/`：算法模板内容；编辑规范见 `notes/algorithm-templates/README.md`。
- `scripts/`：构建、预览及静态校验脚本。

构建产物位于 `dist/`：首页是 `dist/index.html`，笔记页面、原始 Markdown、图片和算法模板分别位于其对应目录。`/notes/` 是 GitHub Pages 为仓库提供的部署前缀，**不是** `dist/` 中再嵌套的目录。因此发布地址是 `https://weiknight0.github.io/notes/`，不会变成 `/notes/notes/`。

## GitHub Pages

将本仓库作为名为 `notes` 的 GitHub 项目仓库，并在 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。`.github/workflows/pages.yml` 仅在推送到 `main` 或 `dev` 时检查、构建和验证；只有 `main` 上传产物并部署。其他分支和 Pull Request 不触发该工作流。工作流从 Pages 设置读取域名与部署路径。

`SITE_URL` 指定 Pages 域名，`SITE_BASE_PATH` 指定仓库部署前缀（本地默认 `/notes/`），`MAIN_SITE_URL` 指定返回个人主页的地址（本地与工作流默认 `https://weiknight0.github.io/`）。如果主站迁移到其他域名或路径，需要同步更新工作流中的 `MAIN_SITE_URL`；如需本地测试其他配置，可以通过环境变量传入。

发布前请确认所有笔记及其 Markdown 原文和图片适合公开访问。
