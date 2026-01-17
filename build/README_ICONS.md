# 图标文件说明

## 需要的图标文件格式

根据 `package.json` 中的配置，你需要准备以下图标文件：

### macOS
- **文件名**: `icon.icns`
- **位置**: `build/icon.icns`
- **格式**: ICNS (macOS 图标格式)
- **尺寸要求**: 建议包含多种尺寸（16x16, 32x32, 128x128, 256x256, 512x512, 1024x1024）

### Windows
- **文件名**: `icon.ico`
- **位置**: `build/icon.ico`
- **格式**: ICO (Windows 图标格式)
- **尺寸要求**: 建议包含多种尺寸（16x16, 32x32, 48x48, 256x256）

### Linux
- **文件名**: `icon.png`
- **位置**: `build/icon.png`
- **格式**: PNG
- **尺寸要求**: 建议 512x512 或 1024x1024

## 如何生成图标文件

### macOS (.icns)
1. 准备一个 1024x1024 的 PNG 图片
2. 使用以下方法之一生成 ICNS：
   - **在线工具**: https://cloudconvert.com/png-to-icns
   - **命令行** (macOS):
     ```bash
     # 创建 iconset 目录
     mkdir icon.iconset
     
     # 生成不同尺寸的图片
     sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
     sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
     sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
     sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
     sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
     sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
     sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
     sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
     sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
     sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
     
     # 生成 ICNS 文件
     iconutil -c icns icon.iconset -o build/icon.icns
     ```

### Windows (.ico)
1. 准备一个 256x256 的 PNG 图片
2. 使用以下方法之一生成 ICO：
   - **在线工具**: https://cloudconvert.com/png-to-ico
   - **工具**: ImageMagick, GIMP, 或在线转换器

### Linux (.png)
1. 直接使用 PNG 图片（512x512 或 1024x1024）
2. 复制到 `build/icon.png`

## 图标设计建议

- 使用透明背景（PNG）
- 确保在小尺寸下也清晰可见
- 避免过于复杂的细节
- 使用高对比度颜色
- 符合各平台的设计规范

## 放置图标文件

将生成的图标文件放到 `build/` 目录下：
```
build/
  ├── icon.icns  (macOS)
  ├── icon.ico   (Windows)
  └── icon.png   (Linux)
```

然后重新运行打包命令：
```bash
npm run electron:build
```
