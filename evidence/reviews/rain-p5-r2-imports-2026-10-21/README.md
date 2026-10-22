# r2 全 JavaScript 入口导入核对

2026-10-21，复用 r2 `report.json` 所指的原临时消费者，在 Node v24.13.0 中完成串行真实包入口导入。

| 包 | ESM 根／子路径 | 成功 | 与归档逐字节一致的文件 |
| --- | ---: | ---: | ---: |
| `@heroui/react@3.2.6-rain.1` | 87 | 87 | 420 |
| `@heroui/styles@3.2.6-rain.1` | 85 | 85 | 780 |
| `@rain-classroom/heroui-theme@0.1.2` | 0（仅 CSS） | 不适用 | 3 |

- 合计 172 个 JavaScript 入口，全部通过真实 specifier 解析与 `import()` 执行；包括 Styles `./components/*` 对应的实际 JS 子路径。
- 三个 tgz 的 SHA-256 与 r2 manifest／report 相符；解包包为消费者内的真实目录，每个归档文件逐字节相同，无额外解包文件。
- 三个包未声明 `require` 条件，本次没有独立 CJS 通过结论。CSS、类型声明、元数据和 CSS 通配符不计入 JavaScript 导入数。
- 冻结交付目录内原 23 个文件检查前后摘要未变；未安装、构建、打包、启动浏览器或运行组件测试。

`check.py` 是本次唯一执行的核对脚本；`identity.json` 保存包内文件身份，`requests.json` 保存预期入口，`import-results.json` 保存真实解析与导出名，`results.json` 保存结论。标准错误记录为空。

第三方依赖继续复用本机已有安装，不是全新安装验证。单进程导入会使用 Node 正常模块缓存；本结果只证明入口解析及模块执行，不证明全部行为、浏览器兼容、RSC 或生产就绪。
