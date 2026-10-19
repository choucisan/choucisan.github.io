# 北邮实验室安全考试题库

`lab-safety.csv.gz` 是 UTF-8 编码、标准 CSV 格式的 gzip 压缩题库。

- 来源：[KY-zhang-X/bupt-lab-safety](https://github.com/KY-zhang-X/bupt-lab-safety) 项目的 `data/` 目录，用户提供的本地副本为 `bupt-lab-safety-main/data/`，共 14 个 JSON 文件、3,048 条原始记录。感谢原作者开源分享。
- 去重：以原始 `qtext` 完全相同为准，保留首次出现的记录；重复记录的题型、选项和答案均一致。
- 结果：2,796 题，其中单选题 2,098 道，多选题 698 道。
- `source_files` 合并保留该题出现的所有源文件名。
- `qurl` 保留首条原始记录中的图片路径。原数据不含图片文件，页面不加载这些相对路径。
- 题库属于原始资料整理，未对答案进行专业核验，不作为实验操作规范或官方安全指导。
- 原始资料附带 MIT License，完整声明保留在 `lab-safety.LICENSE.txt`。

## CSV 字段

| 字段 | 内容 |
| --- | --- |
| `id` | 从 1 开始的题号，按源文件名字典序和文件内顺序生成 |
| `qtext` | 原始题干，保留“题干：”前缀 |
| `qtype` | 单选题 / 多选题 |
| `opts` | JSON 对象，键为选项字母，值为原始选项文本 |
| `ans` | JSON 数组，包含正确选项字母 |
| `source_files` | JSON 数组，包含所有来源文件名 |
| `qurl` | 原始图片路径，仅作溯源保留 |

## 重新导入

在项目根目录执行：

```sh
node scripts/import-lab-safety-data.mjs /path/to/bupt-lab-safety-main/data
```

导入脚本遇到同题干但不同选项或答案时会报错，不会静默丢弃冲突内容。已生成的压缩文件直接随仓库发布，构建不依赖原始 JSON 目录。

页面地址：`/workshops/lab_safety/`。Vite 将压缩文件作为带内容哈希的静态资源发布，浏览器按需下载并本地解压检索，无需服务端接口。
