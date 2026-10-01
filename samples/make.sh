#!/usr/bin/env bash
# Render a sample end to end: narration (if missing) -> frames in parallel chunks -> audio mix -> final MP4.
# usage: ./make.sh <scene> <width> <height> [procs]
# Needs the static server running: node server.js 8090
set -euo pipefail
cd "$(dirname "$0")"
SCENE=$1; W=$2; H=$3; N=${4:-3}; FPS=30
B=build/$SCENE
mkdir -p $B
[ -f $B/timing.json ] || python3 tools/tts.py scripts/$SCENE.json $B

node render.js scene=$SCENE w=$W h=$H meta=$B/meta.json
DUR=$(python3 -c "import json;print(json.load(open('$B/meta.json'))['duration'])")
FRAMES=$(python3 -c "import math;print(math.ceil($DUR*$FPS))")
STEP=$(( (FRAMES + N - 1) / N ))
: > $B/chunks.txt
for i in $(seq 0 $((N - 1))); do
  FROM=$(( i * STEP )); TO=$(( (i + 1) * STEP )); [ $TO -gt $FRAMES ] && TO=$FRAMES
  node render.js scene=$SCENE w=$W h=$H from=$FROM to=$TO out=$B/chunk$i.mp4 > $B/chunk$i.log 2>&1 &
  echo "file 'chunk$i.mp4'" >> $B/chunks.txt
done
wait
ffmpeg -y -loglevel error -f concat -safe 0 -i $B/chunks.txt -c copy $B/video.mp4
python3 tools/audio.py $B
ffmpeg -y -loglevel error -i $B/video.mp4 -i $B/mix.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $B/$SCENE.mp4
# smaller copy for sharing (chat apps, previews)
ffmpeg -y -loglevel error -i $B/$SCENE.mp4 -c:v libx264 -preset slow -crf 23 -maxrate ${SHARE_MAXRATE:-6M} -bufsize 12M -pix_fmt yuv420p -c:a copy -movflags +faststart $B/${SCENE}_share.mp4
echo "done: $B/$SCENE.mp4 (+ ${SCENE}_share.mp4)"
