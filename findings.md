# Findings

## Environment
- Workspace: `/Users/zeru/Documents/codes/family_menu`
- Current date/time: 2026-04-28 00:52:28 CST
- `rg --files` returned no files, so the project appears empty.
- The directory is not currently a Git repository.

## WeChat Mini Program Architecture
- Native mini program minimum useful files: `app.js`, `app.json`, `app.wxss`, `project.config.json`, `sitemap.json`, plus page folders containing `.js`, `.json`, `.wxml`, `.wxss`.
- A local MVP can use WeChat local storage for dishes and orders.
- Real customer/service multi-device order sync requires backend infrastructure, typically WeChat CloudBase database/functions or a custom HTTPS API service.

## Implementation Notes
- Customer and service pages share data through `utils/store.js`.
- Dynamic WXML display values such as item counts and order status labels are computed in JS to reduce template expression risk.
- `node --check` passed for `app.js`, `utils/store.js`, `pages/menu/menu.js`, and `pages/service/service.js`.
