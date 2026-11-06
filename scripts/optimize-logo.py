import os
import PIL.Image

logo_path = 'public/logo.png'
backup_path = 'public/logo_original_backup.png'

if not os.path.exists(backup_path):
    import shutil
    shutil.copyfile(logo_path, backup_path)
    print(f'Backed up original logo to {backup_path}')

im = PIL.Image.open(backup_path)
print(f'Original size: {os.path.getsize(backup_path)/1024:.1f} KB, dimensions: {im.size}')

# Resize to crisp 512x512
im512 = im.resize((512, 512), PIL.Image.Resampling.LANCZOS)

# 1. Save optimized WebP
webp_path = 'public/logo.webp'
im512.save(webp_path, 'WEBP', quality=92, method=6)
print(f'Saved {webp_path}: {os.path.getsize(webp_path)/1024:.1f} KB')

# 2. Save optimized PNG (adaptive palette with alpha)
im_quant = im512.quantize(colors=256, method=2)
im_quant.save(logo_path, optimize=True)
print(f'Saved {logo_path}: {os.path.getsize(logo_path)/1024:.1f} KB')

