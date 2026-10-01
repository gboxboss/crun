// Sample 1b — the Hormuz short in the "Orbital Satellite" look (same direction, different map style).
import base from './hormuz.mjs';
export default ctx => base({ ...ctx, look: 'satellite' });
