import os
import PIL.Image

master_path = 'assets/logo.png'
im = PIL.Image.open(master_path)
print(f'Master size: {os.path.getsize(master_path)/1024:.1f} KB, dimensions: {im.size}')

# 1. High-resolution 1024x1024 master
im1024 = im.resize((1024, 1024), PIL.Image.Resampling.LANCZOS)
im1024.save('public/logo.png', 'PNG', optimize=True)
im1024.save('public/logo.webp', 'WEBP', quality=98, method=6)

# 2. Crisp 512x512
im512 = im.resize((512, 512), PIL.Image.Resampling.LANCZOS)
im512.save('public/logo-512.webp', 'WEBP', quality=98, method=6)

# 3. High-DPI 256x256 fallback
im256 = im.resize((256, 256), PIL.Image.Resampling.LANCZOS)
im256.save('public/logo-96.webp', 'WEBP', quality=98, method=6)
im256.save('public/logo-96.png', 'PNG', optimize=True)

print('Optimized high-fidelity logos saved.')

