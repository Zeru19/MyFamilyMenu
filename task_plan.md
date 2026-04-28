# Task Plan: 家庭电子菜单微信小程序

## Goal
搭建一个可用的家庭电子菜单微信小程序最小版本：顾客端能浏览菜品、点餐、重置点餐；服务侧能维护菜品并接收/处理点餐请求；同时列出上线或真机联调需要用户准备的微信小程序基建。

## Current Phase
complete

## Phases

### Phase 1: 项目脚手架
- [x] 创建微信小程序基础配置
- [x] 创建全局样式
- [x] 创建本地数据模块
- **Status:** complete

### Phase 2: 顾客端点餐
- [x] 实现菜品展示
- [x] 实现购物车数量调整
- [x] 实现订单提交
- [x] 实现重置点餐
- **Status:** complete

### Phase 3: 服务侧管理
- [x] 实现菜品新增和编辑
- [x] 实现菜品上下架和默认恢复
- [x] 实现订单接收展示
- [x] 实现订单状态更新和清空订单
- **Status:** complete

### Phase 4: 验证与文档
- [x] 检查文件结构
- [x] 检查 JavaScript 语法
- [x] 检查 JSON 配置解析
- [x] 补充运行方式和用户需准备基建
- **Status:** complete

## Key Questions
1. 是否需要多设备实时同步？当前 MVP 不实现，真实使用需要微信云开发或自建 HTTPS 后端。
2. 服务侧是否需要独立权限？当前 MVP 放在同一小程序 tab 中，后续应增加管理员校验。

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用原生微信小程序结构 | 不引入 npm 依赖，降低导入微信开发者工具和真机调试成本 |
| MVP 使用 `wx.setStorageSync` | 足够支撑本机演示、流程确认和基础交互 |
| 顾客端和服务侧放在同一小程序 | 便于家庭内部测试和快速迭代 |
| 文档明确后端基建 | 避免把本地存储误认为多设备实时接单能力 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| 当前目录不是 Git 仓库 | 1 | 记录为环境现状，不影响创建小程序文件 |
| planning-with-files stop hook reported 0/0 phases done | 1 | 将计划文件从表格状态改为模板兼容的 `### Phase` 和 `**Status:** complete` 格式 |

## Verification
- `node --check app.js`
- `node --check utils/store.js`
- `node --check pages/menu/menu.js`
- `node --check pages/service/service.js`
- Parsed all JSON config files with Node.

