# 家庭电子菜单微信小程序

一个原生微信小程序，包含顾客点餐、查看自己的订单，以及商家接单/拒单/完成、维护菜单。数据通过微信云开发数据库与云函数同步，管理员身份由云函数校验。

## 已实现功能

- 顾客端
  - 菜品展示（支持图片，留空显示菜名首字色块）
  - 加减点餐数量、备注、提交订单
  - "我的订单"页查看自己创建过的订单及最新状态、各环节时间线
- 服务侧（仅管理员可见）
  - 查看所有订单，时间线展示下单/接单/完成/拒绝时间
  - 待接单：接单 / 拒绝（可填理由）
  - 制作中：完成
  - 拒绝原因会同步给顾客侧
  - 新增、编辑、上下架、删除菜品
  - 空菜单时一键插入示例菜品
- 通用
  - 自定义底部 Tab Bar，使用 Lucide 风格内嵌 SVG 图标（刀叉 / 列表夹 / 服务铃）
  - 服务 Tab 仅对管理员显示，并实时显示待接单数量角标
  - 通过 `getRole` 云函数判断当前 openid 是否在 `admins` 集合中

## 运行方式

1. 克隆仓库并在微信开发者工具中"导入项目"，选择本仓库目录。
2. 复制 `cloudEnv.example.js` 为 `cloudEnv.js`，把 `YOUR_CLOUD_ENV_ID` 替换成你的云环境 ID。
3. 复制 `project.config.example.json` 为 `project.config.json`，把 `YOUR_WX_APPID` 替换成你的小程序 AppID（或先填 `touristappid` 测试）。
4. 在工具左侧"云开发"面板创建/选择你自己的云环境，并新建三个集合：`dishes`、`orders`、`admins`。`dishes` 与 `orders` 的"权限设置"→"自定义安全规则"都填：
   ```json
   { "read": true, "write": true }
   ```
   `admins` 建议设为"仅创建者可读写"，由你在控制台手动维护。
5. 把自己的 openid 写进 `admins` 集合，例如：
   ```json
   { "openid": "<your_openid>", "name": "owner" }
   ```
   不知道自己 openid 时可以先编译跑一次，在调试器里看 `getRole` 的返回。
6. 部署云函数：右键 `cloudfunctions/getRole`，选择"上传并部署：云端安装依赖"。
7. 编译后第一次以管理员身份打开"服务"页，可点"插入示例"播种默认菜品。

## 数据方案

使用微信云开发数据库，集合：

- `dishes`：菜品（`name`、`category`、`price`、`description`、`image`、`available`、`createdAt`、`updatedAt`）。
- `orders`：订单（`items`、`totalCount`、`totalPrice`、`note`、`status`、`rejectReason`、`createdAt`、`acceptedAt`、`doneAt`、`rejectedAt`、`updatedAt`）。
- `admins`：管理员白名单（`openid`、`name`），由 `getRole` 云函数读取。

订单状态：`pending` 待接单 / `accepted` 制作中 / `done` 已完成 / `rejected` 已拒绝。

顾客的"我的订单"目前按本机记录的 order id 列表筛选，**换设备/重装小程序会丢失历史**。后续可改为按 `_openid` 过滤。

## 目录结构

```
app.js / app.json / app.wxss      全局入口与样式
cloudEnv.example.js               云环境配置模板（复制为 cloudEnv.js）
project.config.example.json       项目配置模板（复制为 project.config.json）
custom-tab-bar/                   自定义底部 Tab Bar（含 SVG 图标）
cloudfunctions/getRole/           判断当前用户是否为管理员
pages/menu/                       顾客点餐页
pages/orders/                     "我的订单"页
pages/service/                    管理员服务台
utils/store.js                    云数据库读写封装
```

## 后续 TODO

- 把"我的订单"切到按 `_openid` 过滤，跨设备同步历史。
- 用云函数实现批量删除订单、更安全的写权限策略。
- 菜品图片支持云存储上传，免去手填 URL。
