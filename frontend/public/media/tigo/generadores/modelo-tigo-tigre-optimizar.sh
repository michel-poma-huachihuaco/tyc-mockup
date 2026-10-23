#!/bin/bash
# crudo.glb -> tigo-tigre.glb (weld, dedup, prune, meshopt medium), igual que modelo-tigo.py
set -e
cd "$(dirname "$0")"
GT=""
for b in ~/.npm/_npx/*/node_modules/.bin/gltf-transform; do v=$($b --version 2>/dev/null || true); case "$v" in 4*) GT=$b; break;; esac; done
export npm_config_prefer_offline=true
$GT weld crudo.glb o1.glb >/dev/null
$GT dedup o1.glb o2.glb >/dev/null
$GT prune o2.glb o3.glb >/dev/null
$GT meshopt o3.glb tigo-tigre.glb --level medium >/dev/null
ls -la tigo-tigre.glb
