#!/usr/bin/env python3
"""Gera icons/icon-192.png e icon-512.png — volante estilizado, azul clínico do design system."""
import math
from PIL import Image, ImageDraw

AZUL = (37, 99, 235, 255)
AZUL2 = (29, 78, 216, 255)

def icone(tam):
    im = Image.new("RGBA", (tam, tam), (255, 255, 255, 255))   # papel claro
    d = ImageDraw.Draw(im)
    c = tam / 2
    esp = round(tam * 0.055)
    r_ext = tam * 0.35
    r_cubo = tam * 0.115
    # aro
    d.ellipse([c - r_ext, c - r_ext, c + r_ext, c + r_ext], outline=AZUL, width=esp)
    # cubo central
    d.ellipse([c - r_cubo, c - r_cubo, c + r_cubo, c + r_cubo], outline=AZUL2, width=esp)
    # três raios: 90° (para cima) e 210°/330°
    for ang in (90, 210, 330):
        rad = math.radians(ang)
        dx, dy = math.cos(rad), -math.sin(rad)
        d.line([c + dx * r_cubo, c + dy * r_cubo, c + dx * (r_ext - esp / 2), c + dy * (r_ext - esp / 2)],
               fill=AZUL2, width=esp)
    return im

for tam in (192, 512):
    icone(tam).save(f"icons/icon-{tam}.png")
print("icones ok")
