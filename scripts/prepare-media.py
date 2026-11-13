#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys
import time

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VIDEO_DIR = os.path.join(BASE_DIR, "media", "video")
PHOTO_DIR = os.path.join(BASE_DIR, "media", "photo")
TEMP_DIR = "/tmp/tg_widgets_media"

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "media", "gif"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "media", "webm"), exist_ok=True)

ITEMS = [
    {
        "video": "2026-11-13 14-40-03.mp4",
        "name": "overview",
        "title": "Getting Started & Showcase Overview",
        "photo": None,
        "gif_targets": ["media/overview.gif", "examples/overview.gif"],
        "webm_targets": ["media/overview.webm", "examples/overview.webm"],
        "photo_target": None,
    },
    {
        "video": "2026-11-13 14-41-29.mp4",
        "name": "accordion",
        "title": "Accordion (Details & Summary)",
        "photo": "accordeon.png",
        "gif_targets": ["examples/accordion/demo.gif", "media/gif/accordion.gif"],
        "webm_targets": ["examples/accordion/demo.webm", "media/webm/accordion.webm"],
        "photo_target": "examples/accordion/screenshot.png",
    },
    {
        "video": "2026-11-13 14-41-53.mp4",
        "name": "controls",
        "title": "Form Controls (Checkbox, Switch, Radio & Stepper)",
        "photo": "form_controls.png",
        "gif_targets": ["examples/controls/demo.gif", "media/gif/controls.gif"],
        "webm_targets": ["examples/controls/demo.webm", "media/webm/controls.webm"],
        "photo_target": "examples/controls/screenshot.png",
    },
    {
        "video": "2026-11-13 14-42-30.mp4",
        "name": "profile",
        "title": "User Profile & Settings Dashboard",
        "photo": "profile.png",
        "gif_targets": ["examples/profile/demo.gif", "media/gif/profile.gif"],
        "webm_targets": ["examples/profile/demo.webm", "media/webm/profile.webm"],
        "photo_target": "examples/profile/screenshot.png",
    },
    {
        "video": "2026-11-13 14-42-54.mp4",
        "name": "tournament",
        "title": "Chess Tournament Registration",
        "photo": "tournament.png",
        "gif_targets": ["examples/tournament/demo.gif", "media/gif/tournament.gif"],
        "webm_targets": ["examples/tournament/demo.webm", "media/webm/tournament.webm"],
        "photo_target": "examples/tournament/screenshot.png",
    },
    {
        "video": "2026-11-13 14-43-17.mp4",
        "name": "crypto",
        "title": "TON Crypto Wallet",
        "photo": "wallet.png",
        "gif_targets": ["examples/crypto/demo.gif", "media/gif/crypto.gif"],
        "webm_targets": ["examples/crypto/demo.webm", "media/webm/crypto.webm"],
        "photo_target": "examples/crypto/screenshot.png",
    },
    {
        "video": "2026-11-13 14-43-40.mp4",
        "name": "ecommerce",
        "title": "E-Commerce Mini Cart & Checkout",
        "photo": "ecommerce.png",
        "gif_targets": ["examples/ecommerce/demo.gif", "media/gif/ecommerce.gif"],
        "webm_targets": ["examples/ecommerce/demo.webm", "media/webm/ecommerce.webm"],
        "photo_target": "examples/ecommerce/screenshot.png",
    },
    {
        "video": "2026-11-13 14-44-09.mp4",
        "name": "alerts",
        "title": "Alerts & Status Badges",
        "photo": "alerts.png",
        "gif_targets": ["examples/alerts/demo.gif", "media/gif/alerts.gif"],
        "webm_targets": ["examples/alerts/demo.webm", "media/webm/alerts.webm"],
        "photo_target": "examples/alerts/screenshot.png",
    },
    {
        "video": "2026-11-13 14-44-31.mp4",
        "name": "cards",
        "title": "Cards & Analytics Metrics",
        "photo": "cards.png",
        "gif_targets": ["examples/cards/demo.gif", "media/gif/cards.gif"],
        "webm_targets": ["examples/cards/demo.webm", "media/webm/cards.webm"],
        "photo_target": "examples/cards/screenshot.png",
    },
    {
        "video": "2026-11-13 14-44-54.mp4",
        "name": "poll",
        "title": "Interactive Live Poll & Voting",
        "photo": "poll.png",
        "gif_targets": ["examples/poll/demo.gif", "media/gif/poll.gif"],
        "webm_targets": ["examples/poll/demo.webm", "media/webm/poll.webm"],
        "photo_target": "examples/poll/screenshot.png",
    },
    {
        "video": "2026-11-13 14-45-17.mp4",
        "name": "table",
        "title": "Data Tables & Receipts",
        "photo": "table.png",
        "gif_targets": ["examples/table/demo.gif", "media/gif/table.gif"],
        "webm_targets": ["examples/table/demo.webm", "media/webm/table.webm"],
        "photo_target": "examples/table/screenshot.png",
    },
    {
        "video": "2026-11-13 14-45-37.mp4",
        "name": "counter",
        "title": "Live Counter with Client Script",
        "photo": "counter.png",
        "gif_targets": ["examples/counter/demo.gif", "media/gif/counter.gif"],
        "webm_targets": ["examples/counter/demo.webm", "media/webm/counter.webm"],
        "photo_target": "examples/counter/screenshot.png",
    },
]

def format_size(bytes_num):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_num < 1024.0:
            return f"{bytes_num:.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} TB"

def process_item(item):
    name = item["name"]
    video_path = os.path.join(VIDEO_DIR, item["video"])
    temp_gif = os.path.join(TEMP_DIR, f"{name}.gif")
    temp_webm = os.path.join(TEMP_DIR, f"{name}.webm")

    print(f"\n▶ Processing [{item['title']}] ({item['video']})...")
    start = time.time()

    # 1. Copy photo if specified
    if item["photo"] and item["photo_target"]:
        src_photo = os.path.join(PHOTO_DIR, item["photo"])
        dst_photo = os.path.join(BASE_DIR, item["photo_target"])
        os.makedirs(os.path.dirname(dst_photo), exist_ok=True)
        shutil.copy2(src_photo, dst_photo)

    # 2. Convert to GIF (800w, 10fps, optimized palette)
    print(f"  • Generating optimized GIF...")
    vf_gif = "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4"
    cmd_gif = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", vf_gif,
        "-loop", "0",
        temp_gif
    ]
    subprocess.run(cmd_gif, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    gif_size = os.path.getsize(temp_gif)

    for target in item["gif_targets"]:
        dst = os.path.join(BASE_DIR, target)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(temp_gif, dst)

    # 3. Convert to WebM (1280w, VP9, fast multithreaded)
    print(f"  • Generating WebM (VP9)...")
    cmd_webm = [
        "ffmpeg", "-y", "-i", video_path,
        "-c:v", "libvpx-vp9",
        "-b:v", "1M",
        "-crf", "32",
        "-cpu-used", "4",
        "-row-mt", "1",
        "-vf", "scale=1280:-1",
        "-an",
        temp_webm
    ]
    subprocess.run(cmd_webm, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    webm_size = os.path.getsize(temp_webm)

    for target in item["webm_targets"]:
        dst = os.path.join(BASE_DIR, target)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(temp_webm, dst)

    elapsed = time.time() - start
    print(f"  ✓ Finished in {elapsed:.1f}s | GIF: {format_size(gif_size)} | WebM: {format_size(webm_size)}")

def main():
    print(f"Starting media processing for {len(ITEMS)} items...")
    total_start = time.time()
    for item in ITEMS:
        process_item(item)
    print(f"\n🎉 All {len(ITEMS)} items successfully processed in {time.time() - total_start:.1f}s!")

if __name__ == "__main__":
    main()
