from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
import tempfile
import uuid
from typing import List, Dict, Any
import fitz  # PyMuPDF
import pikepdf
import json

app = FastAPI(title="PDF Watermark Remover API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary storage for uploaded files
TEMP_DIR = tempfile.mkdtemp()
uploaded_files = {}

@app.get("/")
async def root():
    return {"message": "PDF Watermark Remover API"}

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload PDF and return file info with page previews"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, f"{file_id}.pdf")
    
    # Save uploaded file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Open PDF with PyMuPDF
        doc = fitz.open(file_path)
        pages = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            # Get page dimensions
            rect = page.rect
            pages.append({
                "page": page_num + 1,
                "width": rect.width,
                "height": rect.height
            })
        
        doc.close()
        
        # Store file info
        uploaded_files[file_id] = {
            "filename": file.filename,
            "path": file_path,
            "pages": len(pages)
        }
        
        return {
            "fileId": file_id,
            "filename": file.filename,
            "pages": pages
        }
        
    except Exception as e:
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

@app.get("/api/objects")
async def get_page_objects(fileId: str, page: int):
    """Get all objects (text, images, paths) from a specific page"""
    if fileId not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = uploaded_files[fileId]["path"]
    
    try:
        doc = fitz.open(file_path)
        if page < 1 or page > len(doc):
            raise HTTPException(status_code=400, detail="Invalid page number")
        
        page_obj = doc[page - 1]
        objects = []
        
        # Extract text objects
        text_instances = page_obj.get_text("dict")
        for block in text_instances["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        bbox = span["bbox"]
                        objects.append({
                            "id": f"text_{len(objects)}",
                            "type": "text",
                            "bbox": [bbox[0], bbox[1], bbox[2], bbox[3]],
                            "text": span["text"],
                            "font": span["font"],
                            "size": span["size"],
                            "color": span["color"],
                            "opacity": 1.0  # Default opacity
                        })
        
        # Extract image objects
        image_list = page_obj.get_images()
        for img_index, img in enumerate(image_list):
            # Get image bbox
            img_rect = page_obj.get_image_bbox(img[0])
            objects.append({
                "id": f"image_{img_index}",
                "type": "image",
                "bbox": [img_rect.x0, img_rect.y0, img_rect.x1, img_rect.y1],
                "opacity": 1.0
            })
        
        # Extract drawing objects (paths, shapes)
        drawings = page_obj.get_drawings()
        for draw_index, drawing in enumerate(drawings):
            objects.append({
                "id": f"path_{draw_index}",
                "type": "path",
                "bbox": [drawing["rect"][0], drawing["rect"][1], 
                        drawing["rect"][2], drawing["rect"][3]],
                "opacity": drawing.get("opacity", 1.0),
                "color": drawing.get("color", 0)
            })
        
        doc.close()
        return objects
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting objects: {str(e)}")

@app.post("/api/remove")
async def remove_watermarks(request: Dict[str, Any]):
    """Remove selected watermark objects from PDF"""
    file_id = request.get("fileId")
    selections = request.get("selections", [])  # [{page: int, objectIds: [str]}]
    
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = uploaded_files[file_id]["path"]
    output_path = os.path.join(TEMP_DIR, f"{file_id}_output.pdf")
    
    try:
        # Use pikepdf for precise object removal
        with pikepdf.open(file_path) as pdf:
            for selection in selections:
                page_num = selection["page"] - 1
                object_ids = selection["objectIds"]
                
                # This is a simplified approach - in practice, you'd need
                # more sophisticated object identification and removal
                # For now, we'll use PyMuPDF for text removal
                pass
        
        # Alternative approach using PyMuPDF for text removal
        doc = fitz.open(file_path)
        
        for selection in selections:
            page_num = selection["page"] - 1
            object_ids = selection["objectIds"]
            page = doc[page_num]
            
            # Get all text instances for removal
            text_instances = page.get_text("dict")
            
            for obj_id in object_ids:
                if obj_id.startswith("text_"):
                    # Extract index from object ID
                    try:
                        text_index = int(obj_id.split("_")[1])
                        # Remove text by creating a redaction annotation
                        # This is a simplified approach
                        blocks = text_instances["blocks"]
                        current_index = 0
                        
                        for block in blocks:
                            if "lines" in block:
                                for line in block["lines"]:
                                    for span in line["spans"]:
                                        if current_index == text_index:
                                            bbox = fitz.Rect(span["bbox"])
                                            # Add redaction (removal) annotation
                                            annot = page.add_redact_annot(bbox)
                                            annot.update()
                                        current_index += 1
                    except (ValueError, IndexError):
                        continue
            
            # Apply redactions (actually remove the content)
            page.apply_redactions()
        
        # Save the modified PDF
        doc.save(output_path)
        doc.close()
        
        # Generate task ID for download
        task_id = str(uuid.uuid4())
        uploaded_files[task_id] = {
            "path": output_path,
            "original_filename": uploaded_files[file_id]["filename"]
        }
        
        return {"taskId": task_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing watermarks: {str(e)}")

@app.get("/api/result")
async def get_result(taskId: str):
    """Get processing result and download URL"""
    if taskId not in uploaded_files:
        raise HTTPException(status_code=404, detail="Task not found")
    
    file_info = uploaded_files[taskId]
    if os.path.exists(file_info["path"]):
        return {
            "status": "done",
            "downloadUrl": f"/api/download/{taskId}"
        }
    else:
        return {"status": "error", "message": "File not found"}

@app.get("/api/download/{task_id}")
async def download_result(task_id: str):
    """Download the processed PDF"""
    if task_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = uploaded_files[task_id]
    file_path = file_info["path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    original_name = file_info.get("original_filename", "output.pdf")
    output_name = f"watermark_removed_{original_name}"
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=output_name
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)