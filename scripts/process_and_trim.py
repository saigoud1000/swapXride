from PIL import Image

def process_and_trim(input_path, output_path, invert_text=False):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Remove White Background
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            if invert_text:
                lum = 0.2126*r + 0.7152*g + 0.0722*b
                if lum < 100:
                    new_data.append((255, 255, 255, 255))
                else:
                    new_data.append(item)
            else:
                new_data.append(item)
                
    img.putdata(new_data)
    
    # Now Trim
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Processed {output_path}: Trimmed to {bbox}")
    
    img.save(output_path, "PNG")

# 1. Update Dark Mode Logo (Inverted Text + Transparent + Trimmed)
process_and_trim('swapXride-ui/public/logo.png', 'swapXride-ui/public/logo-dark-optimized.png', invert_text=True)

# 2. Update Light Mode Logo (Original Text + Transparent + Trimmed)
# We update the file that 'logo.tsx' points to.
# Currently logo.tsx points to '/logo.png'. 
# I should replace '/logo.png' with a trimmed version.
process_and_trim('swapXride-ui/public/logo.png', 'swapXride-ui/public/logo-trimmed.png', invert_text=False)
