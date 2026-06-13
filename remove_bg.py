from PIL import Image

def remove_white_bg(img_path, out_path):
    try:
        img = Image.open(img_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(out_path, "PNG")
        print(f"Successfully processed {img_path} -> {out_path}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

remove_white_bg("public/cbpd-logo-transparent.png", "public/cbpd-logo-transparent.png")
