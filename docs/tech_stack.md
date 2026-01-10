# 技术选型与架构决策

## 1. 核心技术栈
*   **框架**: React Native (Expo SDK 52+)
*   **语言**: TypeScript
*   **路由**: Expo Router (基于文件的路由系统)
*   **UI 引擎**: React Native Reanimated (高性能动画) + StyleSheet

## 2. 关键功能选型

### 2.1 PDF 阅读器
*   **库**: `react-native-pdf`
*   **选型理由**:
    *   基于原生 PDF 内核 (Android `PdfRenderer`, iOS `PDFKit`)，性能稳定。
    *   **支持垂直连续滚动**: 设置 `horizontal={false}` 和 `enablePaging={false}` 即可实现类似网页的长图体验，符合需求。
    *   **内置手势**: 自带双指缩放和平移，无需手动处理复杂的手势冲突。
    *   **功能完备**: 支持页码回调、密码保护、路径/Base64/URL 多种源。

### 2.2 局域网文件传输服务
*   **库**: `react-native-http-bridge`
*   **选型理由**:
    *   **API 简洁**: 将复杂的 Socket/HTTP 协议封装为简单的 JS 回调，开发者无需接触底层网络代码。
    *   **功能匹配**: 支持 GET (页面展示) 和 POST (文件上传) 请求，满足“浏览器端上传”的核心需求。
*   **环境要求**: 需要 **Expo Development Build (Prebuild)**。由于涉及原生网络端口监听，无法在 Expo Go 中运行。

### 2.3 列表与性能
*   **列表容器**: `@shopify/flash-list` (用于书架列表，非 PDF 页面)
    *   比 FlatList 性能高 5-10 倍，适合长列表渲染。
*   **图片加载**: `expo-image`
    *   用于加载 PDF 封面缩略图，支持高效缓存和 WebP 格式。

### 2.4 数据存储
*   **状态管理**: `zustand` (轻量级，无样板代码)
    *   管理文件列表、Server 状态、阅读进度。
*   **本地持久化**: `react-native-mmkv`
    *   极速键值存储，用于保存用户设置和阅读历史。

## 3. 开发环境说明
由于引入了带有原生代码的库 (`react-native-pdf`, `react-native-http-bridge`)，项目将采用 **Continuous Native Generation (CNG)** 模式。
*   **运行方式**: 
    *   不能使用 standard Expo Go App。
    *   需运行 `npx expo prebuild` 生成原生目录。
    *   需运行 `npx expo run:android` 或 `npx expo run:ios` 安装开发版 App 到模拟器/真机。

## 4. UI 交互设计
*   **导航**: 底部 3 Tab (书架 / 导入 / 我的)。
*   **导入页**: 聚合本地导入、网络下载、局域网服务。
*   **阅读页**: 垂直无限滚动，无缝拼接体验。

