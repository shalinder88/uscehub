#!/usr/bin/env python3
"""
Generate public/og-default.png for social-share previews.

Spec (per audit recommendation):
- 1200x630
- Brand: USCEHub
- Tagline: Source-linked U.S. clinical experience directory
- Bullet line: Verified sources  ·  Last-reviewed status  ·  Correction-friendly
- No "largest" / "best" / "official" / "hospital-approved" claims.
- No fake stats. No hospital logos.
- Editorial dark background; cream text; teal accent dot; brass tagline.

Run from repo root:
    python3 scripts/generate-og-default.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (13, 20, 24)            # #0d1418 deep ink
PAPER = (250, 246, 232)      # #faf6e8 cream
CREAM = (247, 245, 236)      # #f7f5ec
MUTED = (191, 193, 201)      # #bfc1c9
TEAL = (15, 165, 149)        # #0fa595
BRASS = (216, 169, 120)      # #d8a978
HAIRLINE = (52, 55, 63)      # #34373f

OUT = "public/og-default.png"

def find_font(candidates, size):
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

# Georgia — single TTF, reliable Pillow rendering at large sizes.
# (NewYork.ttf and Charter.ttc had glyph spacing issues at 110px wordmark
# when rendered through Pillow's freetype path.)
SERIF = [
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
]
SERIF_ITALIC = [
    "/System/Library/Fonts/Supplemental/Georgia Italic.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf",
]
MONO = [
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Monaco.ttf",
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
]

font_brand   = find_font(SERIF, 110)
font_tag     = find_font(SERIF_ITALIC, 36)
font_bullets = find_font(MONO, 22)
font_url     = find_font(MONO, 18)
font_eyebrow = find_font(MONO, 18)

def text_w(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Subtle hairline frame
margin = 64
draw.rectangle([margin, margin, W - margin, H - margin], outline=HAIRLINE, width=1)

# Eyebrow: VERIFIED DIRECTORY
eyebrow = "—  VERIFIED  DIRECTORY  —"
ew = text_w(draw, eyebrow, font_eyebrow)
draw.text(((W - ew) / 2, 168), eyebrow, font=font_eyebrow, fill=TEAL)

# Brand wordmark with teal-dot separator
# Render "USCE" + "·" + "Hub" centered as a single optical row.
brand_left = "USCE"
dot = "·"
brand_right = "Hub"
gap = 16

w_left  = text_w(draw, brand_left, font_brand)
w_dot   = text_w(draw, dot, font_brand)
w_right = text_w(draw, brand_right, font_brand)
total   = w_left + gap + w_dot + gap + w_right

start_x = (W - total) / 2
y = 218
draw.text((start_x, y), brand_left, font=font_brand, fill=CREAM)
draw.text((start_x + w_left + gap, y), dot, font=font_brand, fill=TEAL)
draw.text((start_x + w_left + gap + w_dot + gap, y), brand_right, font=font_brand, fill=CREAM)

# Tagline: italic brass, source-linked language
tagline = "Source-linked U.S. clinical experience directory"
tw = text_w(draw, tagline, font_tag)
draw.text(((W - tw) / 2, 372), tagline, font=font_tag, fill=BRASS)

# Bullet line — three honest source-trust signals, mono caps
bullets = "VERIFIED SOURCES   ·   LAST-REVIEWED STATUS   ·   CORRECTION-FRIENDLY"
bw = text_w(draw, bullets, font_bullets)
draw.text(((W - bw) / 2, 460), bullets, font=font_bullets, fill=MUTED)

# Footer URL
url = "uscehub.com"
uw = text_w(draw, url, font_url)
draw.text(((W - uw) / 2, H - 110), url, font=font_url, fill=MUTED)

img.save(OUT, format="PNG", optimize=True)
size = os.path.getsize(OUT)
print(f"wrote {OUT}  {W}x{H}  {size} bytes")
