from PIL import Image
import os

def trim_whitespace(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        # Get bounding box of non-zero alpha pixels
        # getbbox() returns (left, upper, right, lower)
        # For a fully transparent image it returns None
        
        # Note: logo.png might be RGBA or RGB depending on previous steps.
        # If it's the original "white background" one, we can't just trim alpha=0.
        # But 'logo-dark-optimized.png' is definitely transparent.
        # 'logo.png' (Process 1 result) is also transparent (logo-transparent.png?).
        # Wait, the app uses /logo.png (Light) and /logo-dark-optimized.png (Dark).
        # /logo.png is the ORIGINAL COPY which has a WHITE background.
        # So for /logo.png, trimming based on alpha won't work unless I make it transparent first.
        # But for Light Mode, white background is fine if it matches the header.
        # However, the user is saying "almost in the center".
        
        # Strategy:
        # 1. Trim `logo-dark-optimized.png` (Alpha based).
        # 2. For `logo.png`, if it has a white background, we should TRIM the white space.
        
        bg = Image.new(img.mode, img.size, img.getpixel((0,0)))
        diff = Image.frombytes(mode='1', size=img.size, data=img.tobytes()) # This is wrong logic for simple trim
        
        # Better trim buffer logic:
        # For Transparent images:
        bbox = img.getbbox()
        
        if bbox:
            original_size = img.size
            print(f"[{image_path}] Original Size: {original_size}, BBox: {bbox}")
            
            # Check if significant trimming is possible
            if bbox != (0, 0, original_size[0], original_size[1]):
                cropped = img.crop(bbox)
                cropped.save(image_path)
                print(f"[{image_path}] Trimmed to {cropped.size}")
            else:
                print(f"[{image_path}] No trimming needed (or full image).")
                
                # Check for white background trimming manually if alpha is full
                # (Simple check for top-left pixel)
                if img.getpixel((0,0))[3] == 255:
                     # It's likely opaque. Try to trim "uniform border".
                     # This is trickier. Let's rely on the previous transparency script for 'logo.png' first?
                     # Actually, let's just create 'logo-trimmed.png' for light mode by making it transparent then trimming.
                     pass
        else:
            print(f"[{image_path}] Empty image!")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Process Dark Mode (Definitely Transparent)
trim_whitespace('swapXride-ui/public/logo-dark-optimized.png')

# Process Light Mode
# I suspect logo.png still has the white background.
# I will first run the transparency process on logo.png again, then trim it.
# Because if I trim "White", it will just be a smaller white box.
# If I make it transparent, I can trim it tight.
# User liked "logo in the white mode". 
# I will process logo.png to be transparent but KEEP the colors (just remove white BG), THEN trim.
