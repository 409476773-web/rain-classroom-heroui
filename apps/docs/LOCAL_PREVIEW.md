# 本地文档预览

本地模式保留官方组件、样式、文档和示例，关闭订阅、分析及 Pro 搜索/价格的服务调用。不需要 Loops、Featurebase、PostHog 或 Pro 私钥。

完成根目录依赖安装后，在仓库根目录执行：

```sh
cp apps/docs/local-preview.env.example apps/docs/.env.local
pnpm --filter @heroui/docs dev --hostname 127.0.0.1
```

打开 `http://127.0.0.1:3000/docs/react`。中文文档入口为 `/cn/docs/react`。可以给启动命令增加 `--port 端口号`。`.env.local` 不进入版本管理；已有该文件时应合并所需配置，避免覆盖其他设置。

`NEXT_PUBLIC_LOCAL_PREVIEW=true` 的范围：

- 不渲染 Vercel Analytics，不初始化 PostHog。
- Newsletter 与 Changelog 接口直接返回 HTTP 503 和本地预览提示，不向订阅服务发送邮箱；不会模拟订阅成功。
- 不调用 Pro 搜索和价格接口；官方开源文档搜索继续使用本地接口。

开关默认关闭。删除该变量或设为 `false` 后，原有官方行为保持不变。此变量也进入浏览器构建，修改后必须重启开发服务，生产构建则需要重新构建；复用 Turbo 构建缓存时应确保环境配置纳入缓存输入，或强制重新构建。

## 仍然需要网络的内容

这不是完整的离线官网：原有 Google Fonts、CDN 图片/视频、GitHub 星标/贡献者、外部链接、主题页的 Pro 模板 iframe，以及部分异步示例的公开 API 仍可能联网。`NEXT_PUBLIC_CDN_URL` 指向官方公开素材地址，不需要密钥。组件实现和文档源码在本地，以上外部内容应与源码本地化分开验收。

## 请求隔离验证

```sh
pnpm --filter @heroui/docs exec vitest run tests/local-preview.test.ts
```

测试覆盖本地模式下订阅请求和 PostHog 不外发，以及关闭开关后保持原有服务行为。页面加载、客户端分析脚本与 Pro 搜索仍需浏览器网络面板验证。
