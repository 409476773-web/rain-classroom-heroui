# P5 扫描工具准备

2026-10-20：P5-I13 的工具准备已完成定向检查，**尚未执行真实扫描、组件回归或生产构建**。这不是 P5 全库通过记录。

## 已调整的入口

`scripts/rain/story-smoke.mjs` 仍只检查 Rain 下的 story 初始渲染，未增加交互覆盖或原版 Light／Dark 扫描。

- 必须显式提供 `--output` 新目录；已有目录、文件、软链接（包括失效链接）均拒绝使用，没有覆盖选项。父目录须已存在。
- 默认并发为 1，`--concurrency` 只接受 1、2、3；不再固定为 3。
- 输出目录采用独占创建，索引和报告采用独占写入；保留旧 19 日扫描报告。
- 空索引、无效索引、浏览器启动或工作池失败均不能记成 `0/0` 通过；页面和浏览器按实际路径收尾。
- `--help`／`--plan` 不请求索引、不加载 Playwright、不启动浏览器、不创建扫描目录。`--plan` 会读取下列本地来源摘要，并输出 `status: "not_run"`。

## 当前可用的配置预览

在项目根目录执行：

```sh
node scripts/rain/story-smoke.mjs --help
node scripts/rain/story-smoke.mjs --output evidence/runtime/rain-p5-future-run --concurrency 1 --plan
```

第二行的目录只是预览中的候选路径，本轮未创建；未来实际执行时应选独立运行标识。不要删除 `--plan` 后直接运行：全 story 扫描仍在暂缓范围内。旧审计页不带输出参数的命令是历史记录，当前入口会拒绝执行。

如需不同端口，沿用 `STORYBOOK_URL`；本轮没有检查该地址或服务状态。

## 未来真实运行的记录格式

| 文件               | 内容与边界                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `run.json`         | 实际命令、Node 版本、起止时间、配置、来源摘要、索引摘要与运行状态；仅当次持有的独占句柄更新 |
| `index.json`       | 当次服务实际返回的原始索引；不以静态源码数量替代                                            |
| `story-smoke.json` | 实际预期数、结果数、通过数、异常及总体状态；不是逐状态交互或视觉验收                        |

配置预览不产生上述文件；真实运行失败可能只有部分记录，应保留失败目录，另选新目录重跑，不能将缺失结果补写成成功。

来源摘要记录主题 CSS、lockfile、两份 Tabs 补丁的实际 SHA-256，以及 inventory 文件摘要和其声明的输入摘要。inventory 标为 `recorded_input_summary_not_new_freeze`：**没有重新对全部输入做候选冻结**。版本来自 workspace package.json（React／Styles 3.2.6、Theme 0.1.2）；它不是 r2 私有归档版本 `3.2.6-rain.1` 的消费结果，也不证明所指服务正在使用该源码。完整候选身份仍按[最终验收计划 Task 1](../plans/2026-10-20-rain-p5-final-acceptance.md)准备。

## 本轮已验证与未验证

- Node 单文件测试通过：6 个子检查，含父测试共 7 项。覆盖参数、目录／软链接防覆盖、独占创建、有限来源摘要、无效索引及 help／plan 的无网络／浏览器边界。
- 实际 CLI 已核对 help、配置预览成功，以及已有历史目录被拒绝；候选扫描目录未创建。语法、定向 lint 和格式检查通过。
- 证据：[本轮目录](../../evidence/reviews/rain-p5-preflight-2026-10-20/)、[配置预览](../../evidence/reviews/rain-p5-preflight-2026-10-20/configuration-plan.json)、[工具测试](../../evidence/reviews/rain-p5-preflight-2026-10-20/story-smoke-green.log)。真实网络、浏览器工作池与报告的整合运行未执行；不能据此声明新扫描通过。

下一批页面的操作范围另见[定向复查步骤](p5-next-review-batch.md)；该文档仍为待执行计划。[遗留台账](p5-open-issues.md)继续保留当前生产索引、最新全库状态和平台等未验证事项。
