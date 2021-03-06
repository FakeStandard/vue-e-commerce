# Vue-E-Commerce
使用前後端分離開發模式來 Vue 出一個電商後台管理系統

:rocket: Technology <br>
Front end：Vue、Vue-router、Element-UI、Axios、~~Echarts~~、Vue-table-with-tree-grid <br>
Back end：~~Node.js~~、~~Express~~、~~Jwt~~、~~MySql~~、~~Sequelize~~、MSSQL、.NET Core Web API<br>

# History
| Date | Description |
| -- | -- |
| 2021/2/24 | 安裝 Vue、通過 Vue 建立專案項目 <br> 添加 Element-UI、axios 類別庫 <br> 安裝 MySQL 資料庫 <br> 安裝 Node.js 環境 |
| 2021/2/25 | 完成登入頁面 |
| 2021/2/26 | 製作主頁面框架及設置路由位置 |
| 2021/2/27 | 添加用戶列表的增刪修及分頁實現 |
| 2021/2/28 | 完成權限列表、添加角色列表的增刪修 |
| 2021/3/4 | 角色分配權限、用戶角色的分配 <br> 建立 MSSQL 資料庫 <br> 建立 .NET Core Web API 供專案使用 <br> JSON DATA 改為 Call Web API |
| 2021/3/5 | 完成商品管理之商品分類、添加 vue-table-with-tree-grid 套件

# Tree
- 電商後台管理系統
  - 用戶登入
  - 用戶登出
  - 用戶管理
  - 權限管理
    - 角色列表
    - 權限列表
  - 商品管理
    - 商品列表
    - 分類管理
    - 參數管理
  - 訂單管理
  - 資料統計

# Note

### Install
```shell
npm install -g @vue/cli
```

### Complies
```shell
npm run server
```

> http://localhost:8080/

# Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).