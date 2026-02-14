from PIL import Image

def process_logo(input_path, output_path, invert_dark_text=False):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # RGB + Alpha
        r, g, b, a = item
        
        # Check for white background (allow some noise)
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))  # Transparent
        else:
            if invert_dark_text:
                # If pixel is very dark (e.g. the blue text), make it white/light
                # Dark Blue is approx low R, low G, medium B.
                # Simple check: Low Luminance
                lum = 0.2126*r + 0.7152*g + 0.0722*b
                if lum < 100:
                    # Invert or make White. Let's make it White.
                    new_data.append((255, 255, 255, 255))
                else:
                    new_data.append(item)
            else:
                new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

# Generate simple transparent version
process_logo('swapXride-ui/public/logo.png', 'swapXride-ui/public/logo-transparent.png', invert_dark_text=False)

# Generate dark-mode optimized version (Transparent BG + Light Text)
process_logo('swapXride-ui/public/logo.png', 'swapXride-ui/public/logo-dark-optimized.png', invert_dark_text=True)
