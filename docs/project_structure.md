# 项目架构与目录结构规划

## 1. 项目概述
本项目是一个 React Native (Expo) 本地 PDF 阅读器，支持 Android 和 iOS。

**核心功能：**
*   **本地导入**：通过系统文件选择器导入 PDF。
*   **局域网传输**：内置 HTTP 服务器，允许在浏览器端上传、浏览和删除 PDF 文件。
*   **PDF 阅读**：提供流畅的 PDF 阅读体验。

## 2. 目录结构设计

基于 Expo Router 和功能模块化的设计理念，结合权限管理和局域网服务需求，设计如下结构：

```text
d:\free-pdf\
├── app/                            # [Expo Router] 页面路由与导航入口
│   ├── _layout.tsx                 # 全局布局（Provider, Toast, Root Navigation）
│   ├── (tabs)/                     # 底部标签栏导航组
│   │   ├── _layout.tsx
│   │   ├── index.tsx               # [书架/首页] 展示 PDF 列表
│   │   └── settings.tsx            # [设置页] 局域网服务开关、主题等
│   ├── reader/                     # PDF 阅读器功能组
│   │   ├── [id].tsx                # [阅读页] 具体 PDF 阅读界面（动态路由）
│   │   └── _layout.tsx
│   ├── import/                     # [导入页] 聚合所有导入方式
│   │   ├── index.tsx               # 导入方式选择/局域网服务面板
│   │   └── _layout.tsx
│   └── +not-found.tsx              # 404 页面
│
├── assets/                         # 静态资源
│   ├── fonts/
│   ├── images/
│   └── server-static/              # [Web端资源] 存放局域网网页端的静态资源
│       ├── index.html.ts           # 浏览器访问时显示的 HTML 模板
│       └── script.js.ts            # 浏览器端的交互逻辑 (上传、删除、列表渲染)
│
├── components/                     # UI 组件库
│   ├── common/                     # 通用基础组件（跨功能复用）
│   │   ├── EmptyState.tsx          # 空状态展示
│   │   ├── Button.tsx              # 封装后的统一按钮
│   │   ├── LoadingSpinner.tsx      # 加载指示器
│   │   └── ScreenContainer.tsx     # 统一页面容器（处理 SafeArea）
│   │   
│   ├── pdf-library/                # [功能] 书架/列表相关组件
│   │   ├── PdfList.tsx             # 使用 FlashList 展示列表（高性能）
│   │   ├── PdfThumbnail.tsx        # PDF 封面缩略图组件
│   │   └── PdfListItem.tsx         # 单个 PDF 列表项
│   │   
│   ├── pdf-reader/                 # [功能] 阅读器相关组件
│   │   ├── ReaderHeader.tsx        # 阅读页顶部工具栏
│   │   ├── ReaderFooter.tsx        # 进度条、页码跳转
│   │   └── PdfViewer.tsx           # 核心阅读组件封装
│   │   
│   ├── import/                     # [功能] 导入/传输相关组件
│   │   ├── ImportOptionCard.tsx    # 导入方式卡片 (本地/网络/局域网)
│   │   ├── ServerStatus.tsx        # 服务开启/关闭状态指示
│   │   ├── ConnectionInfo.tsx      # 显示 IP 地址和二维码
│   │   └── DownloadModal.tsx       # 网络链接下载弹窗
│   │
│   └── permissions/                # [功能] 权限相关 UI
│       ├── PermissionGuard.tsx     # 权限拦截包装器
│       └── PermissionModal.tsx     # 权限说明弹窗
│
├── constants/                      # 常量定义
│   ├── Colors.ts                   # 颜色主题
│   ├── Config.ts                   # App 全局配置
│   └── Layout.ts                   # 尺寸常量
│
├── hooks/                          # 自定义 Hooks
│   ├── use-theme-color.ts          # 主题颜色 hook
│   ├── use-local-server.ts         # [核心] 控制 HTTP Server 的 Hook
│   ├── use-pdf-files.ts            # [核心] 获取/刷新文件列表的 Hook
│   └── use-keep-awake.ts           # 阅读时保持屏幕常亮
│
├── services/                       # [核心] 业务逻辑与底层服务（无 UI）
│   ├── file-system/                # 文件系统操作
│   │   ├── file-manager.ts         # 文件的增删改查、移动、重命名
│   │   └── pdf-utils.ts            # 提取 PDF 元数据（封面、页数）
│   ├── local-server/               # 局域网 Web 服务器核心
│   │   ├── server-instance.ts      # HTTP 服务实例 (启动/停止/端口监听)
│   │   ├── router.ts               # 路由分发
│   │   ├── handlers/               # 请求处理器
│   │   │   ├── static-handler.ts   # 返回 HTML
│   │   │   ├── api-file-list.ts    # API: 获取文件列表
│   │   │   ├── api-upload.ts       # API: 文件上传
│   │   │   └── api-delete.ts       # API: 删除文件
│   │   └── web-ui-generator.ts     # 动态生成网页内容
│   ├── permissions/                # 权限逻辑层
│   │   ├── permission-manager.ts   # 统一管理 Android/iOS 权限
│   │   └── android-scoped.ts       # Android Scoped Storage 逻辑
│   └── storage/                    # 数据持久化
│       └── preference-storage.ts   # 存储用户偏好
│
├── store/                          # 全局状态管理 (Zustand)
│   ├── use-file-store.ts           # 管理 PDF 文件列表状态
│   └── use-server-store.ts         # 管理局域网服务状态
│
├── types/                          # TypeScript 类型定义
│   ├── file.d.ts                   # PDF 文件对象结构定义
│   └── navigation.d.ts             # 路由参数定义
│
├── utils/                          # 工具函数
│   ├── format.ts                   # 文件大小/日期格式化
│   └── error-handler.ts            # 统一错误处理
│
├── .cursorrules                    # AI 行为规范
├── app.json
├── package.json
└── tsconfig.json
```

## 3. 核心交互流程设计

### 3.1 权限管理
*   **Android**: 区分 Scoped Storage 和普通文件读取。尽量使用 App 私有目录以减少权限困扰。
*   **iOS**: 依赖系统沙盒，通过 DocumentPicker 导入文件时自动处理权限。

### 3.2 局域网服务 (Web 管理端)
1.  **启动服务**: App 端开启 HTTP Server，获取局域网 IP，生成访问地址 (如 `http://192.168.1.5:8080`)。
2.  **浏览器访问**: PC 浏览器请求该地址，App 返回内置的 HTML/JS 静态资源。
3.  **文件交互**:
    *   **GET /api/files**: 浏览器获取 JSON 列表。
    *   **POST /api/upload**: 浏览器上传文件，App 接收并保存。
    *   **DELETE /api/files/:id**: 浏览器请求删除，App 执行文件删除操作。

