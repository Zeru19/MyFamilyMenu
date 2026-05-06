# 家庭电子菜单微信小程序

一个原生微信小程序，包含顾客点餐、查看自己的订单，以及商家接单/拒单/完成、维护菜单。数据通过微信云开发同步。

## 已实现功能

- 顾客端
  - 菜品展示（支持图片，留空显示菜名首字色块）
  - 加减点餐数量、备注、提交订单
  - "我的订单"页查看自己创建过的订单及最新状态
- 服务侧
  - 查看所有订单
  - 待接单：接单 / 拒绝（可填理由）
  - 制作中：完成
  - 拒绝原因会同步给顾客侧
  - 新增、编辑、上下架、删除菜品
  - 空菜单时一键插入示例菜品

## 运行方式

1. 克隆仓库并在微信开发者工具中"导入项目"，选择本仓库目录。
2. 在工具左侧"云开发"面板创建/选择你自己的云环境，并新建两个集合：`dishes`、`orders`。两个集合的"权限设置"→"自定义安全规则"都填：
   ```json
   { "read": true, "write": true }
   ```
3. 复制 `cloudEnv.example.js` 为 `cloudEnv.js`，把 `YOUR_CLOUD_ENV_ID` 替换成你的云环境 ID。
4. 复制 `project.config.example.json` 为 `project.config.json`，把 `YOUR_WX_APPID` 替换成你的小程序 AppID（或先填 `touristappid` 测试）。
5. 编译后第一次打开"服务"页时点"插入示例"播种默认菜品。

## 数据方案

使用微信云开发数据库，集合：

- `dishes`：菜品（name、category、price、description、image、available 等）。
- `orders`：订单（items、totalCount、totalPrice、note、status、rejectReason、createdAt 等）。

订单状态：`pending` 待接单 / `accepted` 制作中 / `done` 已完成 / `rejected` 已拒绝。

顾客的"我的订单"目前按本机记录的 order id 列表筛选，**换设备/重装小程序会丢失历史**。后续可加一个 `login` 云函数获取 openid，按 `_openid` 过滤。

## 后续 TODO

- 加 `login` 云函数获取 openid，把"我的订单"切到按 `_openid` 过滤，跨设备同步。
- 服务侧加 openid 白名单 + 云函数校验，避免任意用户进入管理。
- 用云函数实现批量删除订单、更安全的写权限策略。
- 菜品图片支持云存储上传，免去手填 URL。
