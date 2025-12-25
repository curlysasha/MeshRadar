#!/usr/bin/env python3
"""
Build script for MeshRadar portable version.

Requirements:
- Python 3.10+
- Node.js 18+
- PyInstaller: pip install pyinstaller

Usage:
    python build_portable.py
"""

import subprocess
import shutil
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"
DIST_DIR = ROOT_DIR / "dist"
BUILD_DIR = ROOT_DIR / "build"


def run_command(cmd: list, cwd: Path = None):
    """Runs command and checks result."""
    print(f">>> {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, shell=sys.platform == "win32")
    if result.returncode != 0:
        print(f"Error running: {' '.join(cmd)}")
        sys.exit(1)


def clean():
    """Clean previous builds."""
    print("\n=== Cleaning ===")
    for path in [DIST_DIR, BUILD_DIR, FRONTEND_DIR / "dist", BACKEND_DIR / "static"]:
        if path.exists():
            print(f"Removing {path}")
            shutil.rmtree(path)


def build_frontend():
    """Build React frontend."""
    print("\n=== Building Frontend ===")

    # Install dependencies
    run_command(["npm", "install"], cwd=FRONTEND_DIR)

    # Build production version
    run_command(["npm", "run", "build"], cwd=FRONTEND_DIR)

    # Copy to backend/static
    src = FRONTEND_DIR / "dist"
    dst = BACKEND_DIR / "static"
    print(f"Copying {src} -> {dst}")
    shutil.copytree(src, dst)


def build_backend():
    """Build Python backend with PyInstaller."""
    print("\n=== Building Backend ===")

    # Check PyInstaller
    try:
        import PyInstaller
    except ImportError:
        print("PyInstaller not installed. Installing...")
        # Try uv (if environment was created with uv)
        try:
            run_command(["uv", "pip", "install", "pyinstaller"], cwd=BACKEND_DIR)
        except Exception:
            # Fallback to regular pip
            run_command([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Use spec file for building
    spec_file = BACKEND_DIR / "MeshRadar.spec"

    run_command([
        sys.executable, "-m", "PyInstaller",
        "--clean",
        "--distpath", str(DIST_DIR),
        "--workpath", str(BUILD_DIR),
        str(spec_file)
    ], cwd=BACKEND_DIR)


def copy_data_files():
    """Copy additional files."""
    print("\n=== Copying Additional Files ===")

    # Copy static to dist (next to exe)
    static_src = BACKEND_DIR / "static"
    static_dst = DIST_DIR / "static"
    if static_src.exists():
        print(f"Copying {static_src} -> {static_dst}")
        shutil.copytree(static_src, static_dst)


def create_readme():
    """Create README for portable version."""
    readme = DIST_DIR / "README.txt"
    readme.write_text("""
MeshRadar - Portable Version
============================

Usage:
1. Run MeshRadar.exe
2. Browser will open automatically at http://localhost:8000
3. Connect Meshtastic node via Serial or TCP

Notes:
- Database (SQLite) is saved in the current folder
- Close the console to stop the server
- Port 8000 must be available

Support: https://github.com/your-repo/meshtastic-web
""", encoding="utf-8")
    print(f"Created {readme}")


def main():
    print("=" * 50)
    print("Building MeshRadar Portable Version")
    print("=" * 50)

    clean()
    build_frontend()
    build_backend()
    copy_data_files()
    create_readme()

    print("\n" + "=" * 50)
    print("Build completed!")
    print(f"Result: {DIST_DIR / 'MeshRadar.exe'}")
    print("=" * 50)


if __name__ == "__main__":
    main()
