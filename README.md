# WeiKnight Notes

个人学习笔记与算法模板。

在线阅读：https://weiknight0.github.io/notes/

## 本地运行

需要 Node.js 22.12 或更高版本。

```bash
npm ci
npm run dev
```

打开 http://127.0.0.1:4321/notes/ 。修改后重新运行以更新预览。

## 检查

```bash
npm test
npm run build
npm run verify
```

构建产物位于 `dist/`，推送到 `main` 后由 GitHub Actions 部署。
