#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="${1:-hardware-capabilities.json}"
ARCH=$(uname -m)
KERNEL=$(uname -r)
HOSTNAME_STR=$(hostname 2>/dev/null || echo "localhost")

echo "=== [MANI\$OFT] PROBING HARDWARE & KERNEL ARCHITECTURE ==="
echo "Host Architecture: $ARCH"
echo "Kernel Release:    $KERNEL"

HAS_AVX2=false
HAS_AVX512=false
HAS_ARM_NEON=false
CPU_CORES=$(nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo 2>/dev/null || echo 1)

if grep -q "avx2" /proc/cpuinfo 2>/dev/null; then
    HAS_AVX2=true
fi
if grep -qE "avx512|avx512f" /proc/cpuinfo 2>/dev/null; then
    HAS_AVX512=true
fi
if grep -qE "asimd|neon" /proc/cpuinfo 2>/dev/null || [[ "$ARCH" == "aarch64"* ]]; then
    HAS_ARM_NEON=true
fi

HAS_IO_URING=false
if [ -f /proc/sys/fs/io_uring_disabled ]; then
    IO_URING_VAL=$(cat /proc/sys/fs/io_uring_disabled 2>/dev/null || echo 1)
    if [ "$IO_URING_VAL" = "0" ]; then
        HAS_IO_URING=true
    fi
elif [ -e /sys/kernel/debug/io_uring ] || grep -q io_uring /proc/kallsyms 2>/dev/null; then
    HAS_IO_URING=true
else
    KERNEL_MAJOR=$(echo "$KERNEL" | cut -d. -f1 | tr -cd '0-9')
    if [ "${KERNEL_MAJOR:-0}" -ge 5 ]; then
        HAS_IO_URING=true
    fi
fi

HAS_GPU_DRI=false
HAS_VULKAN=false
HAS_WEBGPU=true

if [ -d /dev/dri ] || [ -e /dev/mali0 ] || [ -e /dev/kgsl-3d0 ]; then
    HAS_GPU_DRI=true
fi
if command -v vulkaninfo >/dev/null 2>&1 || [ -f /usr/share/vulkan/icd.d ]; then
    HAS_VULKAN=true
fi

TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print $2}' || echo 2097152)
FREE_MEM_KB=$(grep MemAvailable /proc/meminfo 2>/dev/null | awk '{print $2}' || echo 1048576)
TOTAL_MEM_MB=$(( TOTAL_MEM_KB / 1024 ))
FREE_MEM_MB=$(( FREE_MEM_KB / 1024 ))

HAS_ZRAM=false
if grep -q "zram" /proc/swaps 2>/dev/null || ls /dev/zram* >/dev/null 2>&1; then
    HAS_ZRAM=true
fi

HAS_PSI=false
if [ -d /proc/pressure ]; then
    HAS_PSI=true
fi

cat <<JSON > "$OUTPUT_FILE"
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "system": {
    "hostname": "$HOSTNAME_STR",
    "architecture": "$ARCH",
    "kernel": "$KERNEL",
    "cpuCores": $CPU_CORES
  },
  "vectorAcceleration": {
    "avx2": $HAS_AVX2,
    "avx512": $HAS_AVX512,
    "armNeon": $HAS_ARM_NEON
  },
  "kernelSubsystems": {
    "ioUring": $HAS_IO_URING,
    "psi": $HAS_PSI,
    "zram": $HAS_ZRAM
  },
  "hardwareAcceleration": {
    "driAvailable": $HAS_GPU_DRI,
    "vulkan": $HAS_VULKAN,
    "webgpuClientReady": $HAS_WEBGPU
  },
  "memory": {
    "totalMb": $TOTAL_MEM_MB,
    "freeMb": $FREE_MEM_MB,
    "recommendedCgroupMaxMb": 650
  }
}
JSON

echo "✓ Hardware probe completed successfully. Profile written to: $OUTPUT_FILE"
