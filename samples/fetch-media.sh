#!/usr/bin/env bash
# Free media used by the samples (all commercial-use OK; credits in README.md).
#   SFX: Sonic Pi samples (CC0, from freesound), AtomCut library packs (CC0: AtomCut, Kenney, OpenGameArt authors)
#   VFX: Kenney particle + smoke packs (CC0, via the shorepine/kenney mirror), Babylon.js particle sheets (CC BY 4.0)
#   Soundfont: GeneralUser GS 2.0 (free for any music use, incl. commercial)
set -euo pipefail
cd "$(dirname "$0")"
V=www/assets/vendor; mkdir -p $V/sfx $V/vfx/kenney $V/sf
TMP=$(mktemp -d)
SP=https://raw.githubusercontent.com/sonic-pi-net/sonic-pi/dev/etc/samples
for f in misc_cineboom drum_roll perc_impact1 perc_impact2 drum_heavy_kick drum_snare_hard ambi_dark_woosh drum_tom_lo_hard; do
  curl -fsSL "$SP/$f.flac" -o $TMP/$f.flac && ffmpeg -y -loglevel error -i $TMP/$f.flac -ac 1 -ar 48000 $V/sfx/$f.wav
done
AC=https://raw.githubusercontent.com/novincode/atomcut-library/main/packs
for f in impacts-risers/audio/impact-deep.wav impacts-risers/audio/sub-drop.wav impacts-risers/audio/whoosh-low.wav \
  impacts-risers/audio/whoosh-high.wav impacts-risers/audio/riser-long.wav impacts-risers/audio/swell.wav \
  motion-essentials/audio/whoosh-pass-slow.wav motion-essentials/audio/whoosh-pass-fast.wav motion-essentials/audio/impact-soft.wav \
  motion-essentials/audio/riser-tension.wav motion-essentials/audio/downer.wav \
  opengameart-25-cc0-bang-firework-sfx/audio/cannon-01.m4a opengameart-25-cc0-bang-firework-sfx/audio/cannon-02.m4a \
  opengameart-25-cc0-bang-firework-sfx/audio/bang-01.m4a opengameart-25-cc0-bang-firework-sfx/audio/bang-03.m4a \
  opengameart-25-cc0-bang-firework-sfx/audio/bang-05.m4a \
  opengameart-20-sword-sound-effects-attacks-and-clashes/audio/sword-clash-1.m4a \
  opengameart-20-sword-sound-effects-attacks-and-clashes/audio/sword-clash-3.m4a \
  kenney-sci-fi-sounds/audio/low-frequency-explosion-000.m4a kenney-sci-fi-sounds/audio/low-frequency-explosion-001.m4a; do
  b=$(basename $f); curl -fsSL "$AC/$f" -o $TMP/$b && ffmpeg -y -loglevel error -i $TMP/$b -ac 1 -ar 48000 $V/sfx/${b%.*}.wav
done
BJ=https://raw.githubusercontent.com/BabylonJS/Assets/master/particles/textures
curl -fsSL "$BJ/fire/Fire_SpriteSheet1_8x8.png" -o $V/vfx/fire8x8.png
curl -fsSL "$BJ/smoke/Smoke_SpriteSheet_8x8.png" -o $V/vfx/smoke8x8.png
KN="https://raw.githubusercontent.com/shorepine/kenney/main/2d"
for f in 00 04 08 12 16 20 24; do curl -fsSL "$KN/Smoke%20Particles/White%20puff/whitePuff$f.png" -o $V/vfx/kenney/whitePuff$f.png; done
for f in 0 2 4 6 8; do curl -fsSL "$KN/Smoke%20Particles/Explosion/explosion0$f.png" -o $V/vfx/kenney/explosion0$f.png; done
for f in smoke_01 smoke_04 smoke_07 smoke_10 muzzle_01 muzzle_03 fire_01 fire_02 flame_01 flame_03 scorch_01 spark_01 light_01; do
  curl -fsSL "$KN/Particle%20Pack/PNG%20(Transparent)/$f.png" -o $V/vfx/kenney/$f.png
done
[ -s $V/sf/GeneralUser-GS.sf2 ] || curl -fsSL https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/main/GeneralUser-GS.sf2 -o $V/sf/GeneralUser-GS.sf2
rm -rf $TMP
echo "media ready"
