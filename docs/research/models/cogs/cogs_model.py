"""Parametric per-video COGS model v2 (2026-10-01). USD.
Two routings per tier: NAIVE (what a first build typically does) and RECOMMENDED (green vendors, optimized).
"""
import math
LLM = {'opus55': dict(i=4.0, cr=0.20, o=20.0), 'sonnet55': dict(i=2.0, cr=0.20, o=10.0),
       'haiku45': dict(i=1.0, cr=0.10, o=5.0)}
WEB_SEARCH = 0.010
TTS = {'g38flash_promo': 1500*9/1e6 + 600*0.5/1e6, 'g38flash_list': 1500*18/1e6 + 600*1.0/1e6,
       'g25flash': 1500*10/1e6 + 600*0.5/1e6, 'chirp3hd': 915*30/1e6, 'kokoro': 0.0005}
ALIGN = 0.0051
IMG = {'library': 0.0, 'imagen4fast': 0.02, 'imagen4': 0.04, 'nb2_1k': 0.067, 'nb2_2k': 0.101, 'nbpro_2k': 0.134}
VID = {'veo31lite_720': 0.03, 'veo31lite_1080': 0.05, 'veo31fast_1080': 0.10, 'omni_720': 5792*17.5/1e6}
MUSIC = {'library': 0.0, 'lyria3pro': 0.08}
CPU = {'c8g_od': 0.31904/8/3600, 'c8g_spot': 0.31904/8/3600*0.4, 'cr_worker': 0.000011244+2*0.000001235,
       'cr_job': 0.000018+2*0.000002, 'lambda_arm': 1.7*0.0000133334}
GPU = {'g6f_xl_od': 0.2375/3600, 'g4dn_xl_od': 0.526/3600, 'g6_xl_od': 0.8048/3600, 'g4dn_spot': 0.526/3600*0.35,
       'cr_l4_worker': 4*0.000011244+16*0.000001235+0.0001867}
PF = {'A_cpu': 0.25, 'B_cpu': 1.5, 'B_gpu': 0.04, 'C_gpu': 0.08}
R2_GB = 0.015; R2_A = 4.5e-6; R2_B = 0.36e-6
VIDEOS = {
 'a': dict(name='45 s flat/2D Short (9:16)', sec=45, words=115, scenes=10, mix={'A_cpu': 1.0}),
 'b': dict(name='75 s TikTok cut (9:16)', sec=75, words=195, scenes=16, mix={'A_cpu': 0.7, 'B_gpu': 0.3}),
 'c': dict(name='10 min 2.5D MapLibre (16:9)', sec=600, words=1550, scenes=90, mix={'B_gpu': 1.0}),
 'd': dict(name='10 min globe/terrain + AI hero clips', sec=600, words=1550, scenes=90, mix={'C_gpu': 0.85, 'B_gpu': 0.15}),
}

def stages(v, R):
    """Return dict stage -> (model, uncached_in, cache_read, out, think, searches)."""
    long = v['sec'] >= 300; sc = v['scenes']/10.0; th = R['think']
    tok_scene = R['tok_per_scene']
    S = {}
    if long:
        S['research'] = (R['m_research'], R['res_in_long'], R['res_cr_long'], 6000, 10000*th, R['searches_long'])
        S['script'] = (R['m_script'], 25000, 120000, 9000, 15000*th, 0)
        S['storyboard'] = (R['m_story'], 24000, 60000, tok_scene*v['scenes'], 18000*th, 0)
        S['geo_assets'] = (R['m_geo'], R['geo_in']*6, R['geo_cr']*6, R['geo_out']*6, 1000*th*R['geo_think'], 0)
        S['qa_vision'] = (R['m_qa'], 1100*R['qa_stills_long']+5000, 5000, 3000, 3000*th, R['qa_search_long'])
        S['metadata'] = ('sonnet55', 10000, 0, 1500, 1000, 0) if not R['merge_meta'] else ('sonnet55', 0, 0, 1500, 0, 0)
    else:
        bs = 1.0 if v['sec'] < 60 else 1.6
        S['research'] = (R['m_research'], R['res_in_short'], R['res_cr_short'], 1200, 2500*th, R['searches_short'])
        S['script'] = (R['m_script'], 5000, 12000, 1200*bs, 3000*bs*th, 0)
        S['storyboard'] = (R['m_story'], 3000*sc**0.5, 9000, tok_scene*v['scenes'], 3000*sc*th, 0)
        S['geo_assets'] = (R['m_geo'], R['geo_in']*sc, R['geo_cr']*sc, R['geo_out']*sc, 800*sc*th*R['geo_think'], 0)
        S['qa_vision'] = (R['m_qa'], 1100*R['qa_stills_short']+3000, 3000, 800, 1500*th, R['qa_search_short'])
        S['metadata'] = ('sonnet55', 3000, 0, 700, 500, 0) if not R['merge_meta'] else ('sonnet55', 0, 0, 700, 0, 0)
    return S

REGEN_FRAC = {'research': 0.0, 'script': 0.25, 'storyboard': 0.30, 'geo_assets': 0.20, 'qa_vision': 0.30,
              'metadata': 0.10, 'tts': 0.30, 'align': 0.30, 'images': 0.50, 'video': 0.60, 'music': 0.20,
              'render': 0.35, 'remotion': 1.0, 'storage': 0.5, 'orch': 0.5}

BASE = dict(think=1.0, tok_per_scene=350, m_research='sonnet55', m_script='opus55', m_story='sonnet55',
            m_geo='sonnet55', m_qa='sonnet55', res_in_short=18000, res_cr_short=0, searches_short=3,
            res_in_long=70000, res_cr_long=50000, searches_long=12, geo_in=8000, geo_cr=12000, geo_out=1500,
            geo_think=1.0, qa_stills_short=6, qa_stills_long=40, qa_search_short=0, qa_search_long=0, merge_meta=False,
            tts='g38flash_list', img='imagen4', n_img=(3, 20), img_reroll=1.5, music='lyria3pro', vid=None,
            hero_s=24, vid_reroll=2.0, cpu='c8g_od', gpu='g6f_xl_od', res=1.0, remotion_renders=2, batch=False)

def R(**kw):
    d = dict(BASE); d.update(kw); return d

ROUTES = {
 # NAIVE = straightforward first build (all-LLM pipeline, AI images everywhere, paid search always)
 ('naive', 'budget'): R(think=0.5, m_script='sonnet55', res_in_short=4000, searches_short=0, res_in_long=12000,
                        res_cr_long=0, searches_long=0, qa_stills_short=2, qa_stills_long=10, tts='kokoro',
                        img='library', n_img=(0, 0), music='library'),
 ('naive', 'standard'): R(),
 ('naive', 'premium'): R(think=2.2, m_research='opus55', m_story='opus55', m_qa='opus55', res_in_short=40000,
                         res_cr_short=10000, searches_short=6, res_in_long=150000, res_cr_long=150000,
                         searches_long=25, qa_stills_short=12, qa_stills_long=80, qa_search_short=2, qa_search_long=6,
                         img='nb2_2k', n_img=(5, 35), vid='veo31lite_1080', gpu='g4dn_xl_od', res=1.78),
 # RECOMMENDED = green vendors, deterministic geo, compact scene DSL, library-first assets
 ('rec', 'budget'): R(think=0.4, m_script='sonnet55', m_geo='haiku45', res_in_short=6000, searches_short=0,
                      res_in_long=20000, res_cr_long=0, searches_long=0, tok_per_scene=170, geo_in=2000, geo_cr=4000,
                      geo_out=500, geo_think=0.0, qa_stills_short=0, qa_stills_long=0, merge_meta=True,
                      tts='g25flash', img='library', n_img=(0, 0), music='library', cpu='c8g_spot',
                      gpu='g4dn_spot', remotion_renders=1, batch=True),
 ('rec', 'standard'): R(think=0.7, m_script='opus55', m_geo='haiku45', res_in_short=8000, searches_short=0,
                        res_in_long=40000, res_cr_long=30000, searches_long=5, tok_per_scene=180, geo_in=2500,
                        geo_cr=5000, geo_out=600, geo_think=0.0, qa_stills_short=3, qa_stills_long=15,
                        merge_meta=True, tts='g38flash_list', img='imagen4fast', n_img=(1, 6), music='library',
                        cpu='c8g_od', gpu='g6f_xl_od', remotion_renders=1),
 ('rec', 'premium'): R(think=1.5, m_research='opus55', m_script='opus55', m_story='opus55', m_geo='haiku45',
                       res_in_short=25000, res_cr_short=10000, searches_short=4, res_in_long=100000,
                       res_cr_long=100000, searches_long=15, tok_per_scene=200, geo_in=3000, geo_cr=6000, geo_out=700,
                       geo_think=0.3, qa_stills_short=8, qa_stills_long=40, qa_search_long=4, merge_meta=True,
                       tts='g38flash_list', img='nb2_1k', n_img=(3, 20), music='lyria3pro', vid='veo31lite_1080',
                       hero_s=24, cpu='c8g_od', gpu='g4dn_xl_od', res=1.0, remotion_renders=1),
}

def llm_cost(st, batch=False):
    m, ui, cr, o, th, s = st; p = LLM[m]; f = 0.5 if batch else 1.0
    return f*(ui*p['i'] + cr*p['cr'] + (o+th)*p['o'])/1e6 + s*WEB_SEARCH

def cost(vk, route, tier, regen=1.0, fps=30, res=None, pf=None, gpu=None, cpu=None, b_cpu_path=False, overrides=None):
    v = VIDEOS[vk]; Rt = dict(ROUTES[(route, tier)])
    if overrides: Rt.update(overrides)
    PFx = dict(PF); PFx.update(pf or {})
    mins = v['sec']/60; long = v['sec'] >= 300
    out = {}
    for k, st in stages(v, Rt).items():
        out[k] = llm_cost(st, Rt['batch'] and k not in ('qa_vision',))
    out['tts'] = TTS[Rt['tts']]*mins*1.15
    out['align'] = 0.0003*mins if Rt['tts'] == 'kokoro' else ALIGN*mins
    n_img = Rt['n_img'][1 if long else 0]
    out['images'] = n_img*IMG[Rt['img']]*Rt['img_reroll']
    out['video'] = Rt['hero_s']*VID[Rt['vid']]*Rt['vid_reroll'] if (Rt['vid'] and vk == 'd') else 0.0
    out['music'] = 0.0 if Rt['music'] == 'library' else MUSIC['lyria3pro']*max(1, math.ceil(v['sec']/180))*1.5
    frames = v['sec']*fps; r = res if res is not None else Rt['res']
    cp = CPU[cpu or Rt['cpu']]; gp = GPU[gpu or Rt['gpu']]; rc = 0.0
    for cls, sh in v['mix'].items():
        f = frames*sh
        if cls == 'A_cpu': rc += f*PFx['A_cpu']*r*cp
        elif cls == 'B_gpu': rc += (f*PFx['B_cpu']*r*cp) if b_cpu_path else (f*PFx['B_gpu']*r**0.9*gp)
        elif cls == 'C_gpu': rc += f*PFx['C_gpu']*r**0.9*gp
    out['render'] = rc*1.25
    out['remotion'] = Rt['remotion_renders']*0.01
    gb = v['sec']*10/8/1000*3
    out['storage'] = gb*R2_GB + 300*R2_A + v['sec']*40*R2_B
    out['orch'] = 0.005 + 0.00002*v['sec']
    parts = {k: c*(1+(regen-1)*REGEN_FRAC[k]) for k, c in out.items()}
    return sum(parts.values()), parts

GROUP = {'LLM': ['research', 'script', 'storyboard', 'geo_assets', 'qa_vision', 'metadata'],
         'Voice': ['tts', 'align'], 'Images': ['images'], 'AI video': ['video'], 'Music': ['music'],
         'Render': ['render'], 'Remotion': ['remotion'], 'Storage+orch': ['storage', 'orch']}

def grouped(parts):
    return {g: sum(parts[k] for k in ks) for g, ks in GROUP.items()}

if __name__ == '__main__':
    for route in ['naive', 'rec']:
        print(f"\n=== {route} ===")
        print("video tier | " + " | ".join(GROUP) + " | TOTAL | $/min")
        for vk in VIDEOS:
            for tier in ['budget', 'standard', 'premium']:
                t, p = cost(vk, route, tier); g = grouped(p)
                print(f"{vk} {tier:8s} | " + " | ".join(f"{g[x]:.3f}" for x in GROUP) + f" | {t:.3f} | {t/(VIDEOS[vk]['sec']/60):.3f}")
