# PDF 水印去除工具

一个基于 Web 的 PDF 水印去除工具，支持用户上传带水印的 PDF 文件，手动选择要删除的水印元素，生成无水印的新 PDF。

## 技术栈

### 前端
- **Next.js 15** + **TypeScript**
- **Tailwind CSS** - 样式框架
- **React PDF** - PDF 渲染和预览
- **React Dropzone** - 文件上传

### 后端
- **FastAPI** - Python Web 框架
- **PyMuPDF (fitz)** - PDF 解析和对象提取
- **pikepdf** - PDF 修改和处理
- **python-multipart** - 文件上传支持

## 功能特性

- ✅ PDF 文件上传（支持拖拽）
- ✅ PDF 页面预览和缩放
- ✅ 智能对象识别（文本、图像、路径）
- ✅ 可视化水印选择
- ✅ 精确水印删除
- ✅ 处理结果下载
- 🔄 批量处理多页相同水印（开发中）
- 🔄 大文件优化处理（开发中）

## 安装和运行

### 环境要求
- Node.js 18+ 
- Python 3.8+
- pip

### 后端设置

1. 进入后端目录：
```bash
cd backend
```

2. 安装 Python 依赖：
```bash
pip install -r requirements.txt
```

3. 启动 FastAPI 服务器：
```bash
python main.py
```

后端服务将在 `http://localhost:8000` 启动

### 前端设置

1. 进入项目根目录：
```bash
cd pdf-watermark-remover
```

2. 配置环境变量：
```bash
cp .env.example .env.local
# 编辑 .env.local 设置正确的 API 地址
```

3. 安装 Node.js 依赖：
```bash
npm install
```

4. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 `http://localhost:3000` 启动

### 环境配置

在 `.env.local` 文件中配置后端 API 地址：

```bash
# 开发环境
NEXT_PUBLIC_API_URL=http://localhost:8000

# 生产环境（需要设置为实际的后端 API 地址）
# NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## 使用方法

1. **上传 PDF**：拖拽或点击选择要处理的 PDF 文件
2. **预览文档**：查看 PDF 页面，系统会自动识别页面中的所有对象
3. **选择水印**：
   - 点击页面中的水印元素进行选择
   - 在右侧对象列表中查看和管理选中的对象
   - 使用"清除选择"清空当前选择
4. **删除水印**：点击"删除选中的水印"按钮处理文档
5. **下载结果**：处理完成后自动下载无水印的 PDF 文件

## API 接口

### 上传 PDF
```http
POST /api/upload
Content-Type: multipart/form-data

返回: {
  "fileId": "uuid",
  "filename": "example.pdf", 
  "pages": [{"page": 1, "width": 595, "height": 842}]
}
```

### 获取页面对象
```http
GET /api/objects?fileId={fileId}&page={pageNumber}

返回: [
  {
    "id": "text_0",
    "type": "text",
    "bbox": [x1, y1, x2, y2],
    "text": "水印文字",
    "color": 0,
    "opacity": 1.0
  }
]
```

### 删除水印
```http
POST /api/remove
Content-Type: application/json

{
  "fileId": "uuid",
  "selections": [
    {
      "page": 1, 
      "objectIds": ["text_0", "image_1"]
    }
  ]
}

返回: {"taskId": "uuid"}
```

### 下载结果
```http
GET /api/download/{taskId}

返回: PDF 文件流
```

## 项目结构

```
pdf-watermark-remover/
├── src/
│   ├── app/
│   │   └── page.tsx              # 主页面
│   └── components/
│       ├── PDFUploader.tsx       # 文件上传组件
│       └── PDFViewer.tsx         # PDF 查看和编辑组件
├── backend/
│   ├── main.py                   # FastAPI 应用主文件
│   └── requirements.txt          # Python 依赖
├── package.json                  # Node.js 依赖和脚本
└── README.md                     # 项目说明
```

## 开发计划

- [ ] 添加批量处理多页相同水印功能
- [ ] 实现用户注册和文件历史管理
- [ ] 优化大文件处理性能
- [ ] 添加更多水印检测算法
- [ ] 支持 OCR 图像水印处理

## 注意事项

- 文件大小限制：建议不超过 100MB
- 临时文件会自动清理（24小时后）
- 支持的文件格式：PDF
- 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
