// Export the icons the scenes use from Iconify JSON sets into www/assets/icons.json ({name: {w, h, paths: [d...]}}).
// game-icons.net icons: CC BY 3.0 (Lorc, Delapouite and contributors). Material Design Icons: Apache-2.0.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sets = { gi: require('@iconify-json/game-icons/icons.json'), mdi: require('@iconify-json/mdi/icons.json') };
const want = {
  sabres: 'gi:crossed-sabres', cannon: 'gi:cannon', basil: 'gi:saint-basil-cathedral', snow: 'gi:snowflake-1',
  thermo: 'gi:thermometer-cold', person: 'mdi:account', skull: 'gi:death-skull', bridge: 'gi:stone-bridge',
  flame: 'gi:flame', cossack: 'gi:cloaked-figure-on-horseback', calendar: 'mdi:calendar-blank', boot: 'gi:walking-boot',
  crown: 'mdi:crown', explosion: 'gi:bright-explosion',
};
const out = {};
for (const [k, ref] of Object.entries(want)) {
  const [set, name] = ref.split(':');
  const s = sets[set], ic = s.icons[name];
  if (!ic) throw new Error('missing icon ' + ref);
  const paths = [...ic.body.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1]);
  out[k] = { w: ic.width || s.width || 24, h: ic.height || s.height || 24, paths };
}
fs.mkdirSync(process.argv[2], { recursive: true });
fs.writeFileSync(process.argv[2] + '/icons.json', JSON.stringify(out));
console.log('icons:', Object.keys(out).join(' '));
