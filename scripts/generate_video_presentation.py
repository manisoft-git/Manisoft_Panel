#!/usr/bin/env python3
"""
Manisoft Mission Control — Sovereign Singularity Omni-Nexus
In-Depth Technical Presentation Video Generator
720p 16:9, cybernetic dark glassmorphic slides, neural voiceover, ambient music.
"""

import os, sys, math, subprocess, glob
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "static")
TEMP_DIR = "/tmp/manisoft_panel_video_build"
FINAL_VIDEO = os.path.join(OUTPUT_DIR, "manisoft_panel_presentation.mp4")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_BOLD   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG    = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO   = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

WIDTH, HEIGHT = 1280, 720
FPS = 25

BG_DEEP  = (5, 8, 14)
BG_CARD  = (10, 16, 28)
ACCENT1  = (0, 220, 130)
ACCENT2  = (0, 160, 255)
TEXT_HI  = (230, 255, 240)
TEXT_MID = (160, 200, 180)
GRID_COL = (20, 40, 30)

def load_font(path, size):
    try:    return ImageFont.truetype(path, size)
    except: return ImageFont.load_default()

def draw_grid(draw):
    for x in range(0, WIDTH, 60):
        draw.line([(x,0),(x,HEIGHT)], fill=(*GRID_COL, 18), width=1)
    for y in range(0, HEIGHT, 60):
        draw.line([(0,y),(WIDTH,y)], fill=(*GRID_COL, 18), width=1)

def glow_rect(draw, x1, y1, x2, y2, color, border=2):
    for i in range(6, 0, -1):
        draw.rectangle([x1-i, y1-i, x2+i, y2+i], outline=(*color[:3], int(40*i/6)))
    draw.rectangle([x1, y1, x2, y2], outline=(*color[:3], 200), width=border)

def draw_badge(draw, x, y, label, color, font):
    tw = draw.textlength(label, font=font)
    pad = 10
    draw.rounded_rectangle([x, y, x+tw+pad*2, y+28], radius=6,
                            fill=(*color[:3], 40), outline=(*color[:3], 180), width=1)
    draw.text((x+pad, y+4), label, font=font, fill=color)
    return int(tw) + pad*2 + 8

SCENES = [
    {
        "title": "MANI$OFT MISSION CONTROL",
        "subtitle": "Sovereign Singularity Omni-Nexus v100.0",
        "body": [
            "Production-ready, fault-tolerant developer command centre",
            "Manages a fleet of 5 live projects from a single panel",
            "Deployed on Render.com with Cloudflare Zero-Trust protection",
            "Built by Manifest Subeno for sovereign operator control",
        ],
        "tags": ["Node.js", "Express", "Zero-Trust", "Redis", "Cloudflare"],
        "voiceover": (
            "Manisoft Mission Control. Version one hundred point zero. "
            "A sovereign developer command centre engineered by Manifest Subeno. "
            "It manages an entire fleet of five live production projects from a single "
            "fault-tolerant panel — deployed on Render dot com, protected by Cloudflare Zero-Trust, "
            "and authenticated with a rolling cryptographic nonce seed system. "
            "This is the nerve centre of the entire Manisoft ecosystem."
        ),
    },
    {
        "title": "SOVEREIGN AUTHENTICATION",
        "subtitle": "Rolling Ghost Password Engine",
        "body": [
            "Three-layer auth: Cloudflare → Google OAuth → Pass-Seed",
            "4-char alphanumeric nonce rotates every 180 seconds",
            "Dual-window memory prevents race-condition lockouts",
            "5 failed attempts triggers 15-minute IP quarantine",
            "Honeypot field triggers instant 24-hour ban",
        ],
        "tags": ["OAuth2", "Google GIS", "Nonce Engine", "HMAC", "IP Quarantine"],
        "voiceover": (
            "Manisoft uses a three-layer sovereign authentication system. "
            "First, Cloudflare Zero-Trust validates the operator email at the edge. "
            "Second, Google OAuth verifies the identity token. "
            "Third, the Rolling Ghost Password Engine validates a four-character alphanumeric nonce "
            "that rotates every one hundred and eighty seconds. "
            "Five failed attempts triggers a fifteen-minute quarantine. "
            "A honeypot field triggers a twenty-four-hour ban. "
            "No unauthorised access is possible."
        ),
    },
    {
        "title": "FLEET HYPERVISOR",
        "subtitle": "Autonomous Multi-Project Control",
        "body": [
            "One-click Start, Stop, Restart, Unpublish, Scale-to-Zero",
            "Live latency and SSL health monitoring across all projects",
            "Ephemeral micro-tunnel with mobile QR code generation",
            "Merkle Audit Ledger — tamper-proof append-only log",
            "FinOps Zombie Resource Reaper eliminates idle cloud spend",
        ],
        "tags": ["Fleet Control", "Render API", "QR Tunnel", "Merkle Ledger", "FinOps"],
        "voiceover": (
            "The Fleet Hypervisor gives the operator one-click control over all five projects. "
            "Start, stop, restart, unpublish, or scale to zero — all from the Mission Control panel. "
            "An ephemeral micro-tunnel dispatcher generates mobile Q-R codes for instant preview. "
            "Every action is logged in a Merkle Audit Ledger, a tamper-proof append-only journal. "
            "The FinOps Zombie Resource Reaper automatically eliminates idle cloud spend."
        ),
    },
    {
        "title": "BARE-METAL TELEMETRY",
        "subtitle": "Threat Radar & System Intelligence",
        "body": [
            "Kernel Pressure Stall Information (PSI) monitoring",
            "ZRAM auto-compression and V8 GC memory compaction",
            "cgroup v2 memory sandboxing — MemoryMax = 650MB",
            "TPM 2.0 Measured Boot Attestation & PQC Sentinel",
            "AI Swarm Tournament Engine — agents compete on tasks",
        ],
        "tags": ["PSI", "cgroup v2", "TPM 2.0", "PQC", "AI Swarm"],
        "voiceover": (
            "Manisoft goes deeper than any ordinary dashboard. "
            "It reads Kernel Pressure Stall Information for real-time memory pressure metrics. "
            "It uses ZRAM auto-compression and V8 memory compaction. "
            "cgroup version two sandboxes memory at six hundred and fifty megabytes. "
            "TPM two point zero provides measured boot attestation. "
            "A Post-Quantum Cryptography sentinel monitors for future threats. "
            "And an AI Swarm Tournament Engine pits autonomous agents against each other to solve tasks."
        ),
    },
    {
        "title": "THE ECOSYSTEM",
        "subtitle": "5 Live Projects — 1 Control Panel",
        "body": [
            "LUMINA        — Cognitive learning & gaming platform  :8080",
            "PASSMASTER AI — Socratic JAMB/WAEC exam coach         :5050",
            "STARSHINE      — Luxury e-commerce storefront          :5000",
            "STRIKE OPS    — FPS combat game (HTML5 Canvas)         :8081",
            "SUBWAY SURFERS — Endless runner arcade game            :8082",
        ],
        "tags": ["Flask", "Node.js", "HTML5", "SQLite", "Render"],
        "voiceover": (
            "Manisoft Mission Control orchestrates five live production projects simultaneously. "
            "Lumina — the cognitive learning and gaming platform. "
            "Passmaster A-I — the Socratic JAMB and WAEC exam coaching engine. "
            "Starshine Steez — a luxury e-commerce storefront. "
            "Strike Ops — an FPS combat game on the HTML5 Canvas. "
            "And Subway Surfers — an endless runner arcade. "
            "All five operate simultaneously, managed from one sovereign control panel."
        ),
    },
    {
        "title": "LIVE & PRODUCTION-GRADE",
        "subtitle": "Cloud-Native Deployment Architecture",
        "body": [
            "Live at https://manisoft-panel.onrender.com",
            "Docker-ready with Dockerfile & Procfile included",
            "Fly.io config for multi-region edge deployment",
            "Disaster Recovery backup system (dr-backup.sh)",
            "Benchmark Supremacy Suite vs industry comparisons",
        ],
        "tags": ["Docker", "Render", "Fly.io", "Cloudflare", "CI/CD"],
        "voiceover": (
            "Manisoft Mission Control is live right now at manisoft-panel dot onrender dot com. "
            "It ships with a full Docker setup, a Procfile for Render, and a Fly dot io configuration "
            "for multi-region edge deployment. "
            "A disaster recovery backup script ensures data is never lost. "
            "And a Benchmark Supremacy Suite compares performance against industry standards. "
            "This is not a prototype. This is production-grade sovereign infrastructure."
        ),
    },
]

def render_scene(scene, idx):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_DEEP)
    draw = ImageDraw.Draw(img, "RGBA")
    draw_grid(draw)

    fn_sm = load_font(FONT_MONO, 13)
    draw.text((40, 22), f"SCENE {idx+1:02d}/{len(SCENES):02d}  //  MANISOFT MISSION CONTROL",
              font=fn_sm, fill=(*ACCENT1[:3], 160))
    draw.rectangle([40, 44, WIDTH-40, 46], fill=ACCENT1)
    draw.rectangle([40, 47, WIDTH//3, 48], fill=(*ACCENT2[:3], 120))

    ft = load_font(FONT_BOLD, 46)
    draw.text((40, 62), scene["title"], font=ft, fill=TEXT_HI)
    fs = load_font(FONT_REG, 20)
    draw.text((40, 118), scene["subtitle"], font=fs, fill=ACCENT1)

    card_y, card_h = 155, 340
    draw.rounded_rectangle([30, card_y, WIDTH-30, card_y+card_h],
                            radius=12, fill=(*BG_CARD, 220))
    glow_rect(draw, 30, card_y, WIDTH-30, card_y+card_h, ACCENT1)

    fb = load_font(FONT_REG, 19)
    for i, line in enumerate(scene["body"]):
        y = card_y + 22 + i*52
        draw.ellipse([50, y+7, 60, y+17], fill=ACCENT1)
        draw.text((72, y), line, font=fb, fill=TEXT_MID)
        draw.line([(72, y+32),(WIDTH-50, y+32)], fill=(*GRID_COL, 60), width=1)

    tag_y = card_y + card_h + 22
    fm = load_font(FONT_MONO, 14)
    x_cur = 40
    for tag in scene["tags"]:
        x_cur += draw_badge(draw, x_cur, tag_y, tag, ACCENT2, fm)

    draw.rectangle([40, HEIGHT-44, WIDTH-40, HEIGHT-42], fill=(*ACCENT1[:3], 60))
    draw.text((40, HEIGHT-36), "MANISOFT  //  SOVEREIGN SINGULARITY OMNI-NEXUS  //  v100.0",
              font=fn_sm, fill=(*ACCENT1[:3], 100))

    fd = os.path.join(TEMP_DIR, f"scene_{idx:02d}_frames")
    os.makedirs(fd, exist_ok=True)
    p = os.path.join(fd, "frame.png")
    img.save(p)
    return p

def synthesize_voice(text, out_path):
    print(f"  🎙 Voiceover ({len(text)} chars)...")
    try:
        r = subprocess.run(
            ["edge-tts","--voice","en-US-ChristopherNeural",
             "--rate","+5%","--text",text,"--write-media",out_path],
            capture_output=True, text=True, timeout=120)
        if r.returncode==0 and os.path.exists(out_path): return True
    except Exception as e: print(f"  ⚠ edge-tts: {e}")
    try:
        subprocess.run(["gtts-cli","--lang","en",text,"--output",out_path],
                       capture_output=True, timeout=90)
        return os.path.exists(out_path)
    except: return False

def get_duration(path):
    r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","default=noprint_wrappers=1:nokey=1",path],
                       capture_output=True, text=True)
    try: return float(r.stdout.strip())
    except: return 8.0

def build_clip(scene, idx, frame, audio):
    out = os.path.join(TEMP_DIR, f"clip_{idx:02d}.mp4")
    dur = get_duration(audio) + 1.2
    subprocess.run([
        "ffmpeg","-y","-loop","1","-i",frame,"-i",audio,
        "-vf",f"scale={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.0008,1.04)':d={int(dur*FPS)}:s={WIDTH}x{HEIGHT}:fps={FPS}",
        "-c:v","libx264","-preset","fast","-crf","22",
        "-c:a","aac","-b:a","128k","-t",str(dur),"-pix_fmt","yuv420p", out
    ], capture_output=True)
    return out

def make_ambient(duration, out_path):
    print("  🎵 Generating ambient soundtrack...")
    subprocess.run([
        "ffmpeg","-y","-f","lavfi","-i",
        f"aevalsrc=0.07*sin(2*PI*55*t)*exp(-0.3*(t mod 2))+0.05*sin(2*PI*110*t)*exp(-0.4*(t mod 1.5))+0.03*sin(2*PI*220*t):s=44100:d={duration}",
        "-af","aecho=0.5:0.5:60:0.4,lowpass=f=800,volume=0.35", out_path
    ], capture_output=True)

def main():
    print("="*60)
    print(" MANISOFT MISSION CONTROL — VIDEO GENERATOR")
    print("="*60)
    clips = []
    for i, scene in enumerate(SCENES):
        print(f"\n📹 Scene {i+1}/{len(SCENES)}: {scene['title']}")
        frame = render_scene(scene, i)
        audio = os.path.join(TEMP_DIR, f"vo_{i:02d}.mp3")
        synthesize_voice(scene["voiceover"], audio)
        clips.append(build_clip(scene, i, frame, audio))
        print(f"  ✅ Clip done")

    list_file = os.path.join(TEMP_DIR, "concat.txt")
    with open(list_file,"w") as f:
        for c in clips: f.write(f"file '{c}'\n")
    raw = os.path.join(TEMP_DIR, "raw_video.mp4")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",list_file,"-c","copy",raw],
                   capture_output=True)

    total = get_duration(raw)
    ambient = os.path.join(TEMP_DIR, "ambient.wav")
    make_ambient(int(total)+5, ambient)

    print("\n🎚  Mastering final output...")
    subprocess.run([
        "ffmpeg","-y","-i",raw,"-i",ambient,
        "-filter_complex","[0:a]volume=1.0[va];[1:a]volume=0.12[vb];[va][vb]amix=inputs=2:duration=first[aout]",
        "-map","0:v","-map","[aout]","-c:v","copy","-c:a","aac","-b:a","144k", FINAL_VIDEO
    ], capture_output=True)

    size_mb = os.path.getsize(FINAL_VIDEO)/(1024*1024)
    dur = get_duration(FINAL_VIDEO)
    print(f"\n🎉 Final video: {FINAL_VIDEO}")
    print("="*60)
    print(f" [SUCCESS] Resolution: {WIDTH}x{HEIGHT}  Duration: {dur:.1f}s  Size: {size_mb:.2f}MB")
    print("="*60)

if __name__ == "__main__":
    main()
