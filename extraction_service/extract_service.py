import fitz  # PyMuPDF
import re
import io
import base64
import torch
import clip
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="IIC Report Extraction Microservice")

# Enable CORS for communication with Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CLIP model on available device (GPU if available, else CPU)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading CLIP model on {device}...")
model, preprocess = clip.load("ViT-B/32", device=device)

# Labels used by CLIP to distinguish posters/flyers from actual event photographs
CLASSIFICATION_LABELS = [
    "a graphic design flyer or poster with promotional text and announcements",
    "a real photograph of students and faculty at an event or classroom presentation"
]

def classify_extracted_image(image_bytes: bytes) -> str:
    """Classifies an extracted image as either a POSTER or EVENT_PHOTO."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_input = preprocess(img).unsqueeze(0).to(device)
        text_inputs = clip.tokenize(CLASSIFICATION_LABELS).to(device)

        with torch.no_grad():
            logits_per_image, _ = model(image_input, text_inputs)
            probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]

        # Index 0 = Poster, Index 1 = Event Photo
        return "POSTER" if probs[0] > probs[1] else "EVENT_PHOTO"
    except Exception as e:
        print(f"Classification warning: {e}")
        return "EVENT_PHOTO"


@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    """Primary endpoint called by Node.js to parse PDF reports."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {str(e)}")

    full_text = ""
    extracted_urls = set()
    extracted_images = []

    # 1. Page-by-Page Processing: Text, Hyperlinks, Embedded Images
    for page_num in range(len(doc)):
        page = doc[page_num]
        full_text += page.get_text() + "\n"

        # Extract embedded PDF hyperlinks
        for link in page.get_links():
            if "uri" in link and link["uri"]:
                extracted_urls.add(link["uri"].strip())

        # Extract embedded raw images
        for img_index, img in enumerate(page.get_images(full_raw=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            ext = base_image["ext"]
            width = base_image["width"]
            height = base_image["height"]

            # Filter out tiny logos, icons, and bullets (< 150px)
            if width > 150 and height > 150:
                img_type = classify_extracted_image(image_bytes)
                
                # Convert image bytes to base64 string so Node.js can easily receive it
                b64_image = base64.b64encode(image_bytes).decode("utf-8")
                
                extracted_images.append({
                    "base64": f"data:image/{ext};base64,{b64_image}",
                    "type": img_type,
                    "width": width,
                    "height": height
                })

    # 2. Extract Plain Text URLs via Regex
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    found_urls = re.findall(url_pattern, full_text)
    for u in found_urls:
        extracted_urls.add(u.strip())

    # 3. Categorize Extracted URLs
    video_link = ""
    social_media_links = []

    for url in extracted_urls:
        url_lower = url.lower()
        if "youtube.com" in url_lower or "youtu.be" in url_lower or "drive.google.com" in url_lower:
            if not video_link:
                video_link = url
        elif "instagram.com" in url_lower:
            social_media_links.append({"platform": "Instagram", "url": url})
        elif "linkedin.com" in url_lower:
            social_media_links.append({"platform": "LinkedIn", "url": url})
        elif "facebook.com" in url_lower:
            social_media_links.append({"platform": "Facebook", "url": url})

    return {
        "text_snippet": full_text[:500],
        "video_link": video_link,
        "social_media_links": social_media_links,
        "extracted_images": extracted_images
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)