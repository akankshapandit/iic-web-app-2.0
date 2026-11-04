import sys
import os
import json
import zipfile

def extract_images_from_docx(docx_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    extracted_images = []

    try:
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            # Word documents store embedded images inside word/media/
            for filename in docx_zip.namelist():
                if filename.startswith('word/media/'):
                    # Read the image file bytes
                    image_data = docx_zip.read(filename)
                    
                    # Generate a unique filename
                    base_name = os.path.basename(filename)
                    unique_filename = f"extracted_{os.path.basename(docx_path)}_{base_name}"
                    output_path = os.path.join(output_dir, unique_filename)
                    
                    # Save image to disk
                    with open(output_path, 'wb') as img_file:
                        img_file.write(image_data)
                    
                    # Store public URL path for frontend
                    extracted_images.append(f"/uploads/events/{unique_filename}")
                    
        print(json.dumps({ "success": True, "images": extracted_images }))
    except Exception as e:
        print(json.dumps({ "success": False, "error": str(e) }))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({ "success": False, "error": "Missing arguments" }))
        sys.exit(1)
        
    docx_file_path = sys.argv[1]
    target_uploads_dir = sys.argv[2]
    extract_images_from_docx(docx_file_path, target_uploads_dir)