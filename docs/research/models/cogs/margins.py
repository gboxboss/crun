from cogs_model2 import *

PLANS = [('Starter $29/30cr', 29, 30), ('Creator $79/100cr', 79, 100), ('Pro $199/300cr', 199, 300),
         ('Top-up pack 20cr @ $1.25', 25, 20)]

def fee(price, proc, region):
    vat = 0.20 if region == 'eu' else 0.0
    tot = price*(1+vat); intl = region == 'eu'
    if proc == 'polar_starter':   # V polar docs: 5% + 50c on tax-inclusive total, +1.5% intl
        return 0.05*tot + 0.50 + (0.015*tot if intl else 0)
    if proc == 'polar_pro':       # V 3.8% + 40c (+$20/mo platform fee, fixed)
        return 0.038*tot + 0.40 + (0.015*tot if intl else 0)
    if proc == 'paddle':          # U 5% + 50c on total
        return 0.05*tot + 0.50
    if proc == 'stripe':          # U 2.9%+30c, Billing 0.7%, Tax 0.5%, +1.5% intl (+1% FX not applied)
        return 0.029*tot + 0.30 + 0.007*tot + 0.005*tot + (0.015*tot if intl else 0)

def blended_fee(price, proc, eu_share=0.5):
    return (1-eu_share)*fee(price, proc, 'us') + eu_share*fee(price, proc, 'eu')

def gm(price, credits, cogs_per_credit, util, proc='polar_starter'):
    f = blended_fee(price, proc)
    return (price - f - credits*util*cogs_per_credit)/price

if __name__ == '__main__':
    print('Payment fee % of ex-VAT price (50% US / 50% EU@20% VAT intl card):')
    for name, p, c in PLANS:
        print(f"  {name:28s} " + '  '.join(f"{proc}={blended_fee(p, proc)/p*100:4.1f}%" for proc in ['polar_starter','polar_pro','paddle','stripe']))
    # COGS per credit: 1 credit = 1 finished minute (min 1 per video); short a=1 credit, b=2 credits (started minutes)
    CRED = {'a': 1, 'b': 2, 'c': 10, 'd': 10}
    print('\nCOGS per credit (rec routing), regen 1.0 / 1.5 / 2.0 / 3.0:')
    table = {}
    for vk in VIDEOS:
        for tier in ['budget', 'standard', 'premium']:
            vals = [cost(vk, 'rec', tier, regen=r)[0]/CRED[vk] for r in (1.0, 1.5, 2.0, 3.0)]
            table[(vk, tier)] = vals
            print(f"  {vk} {tier:8s} " + ' '.join(f"{x:6.3f}" for x in vals))
    print('\nGM after Polar Starter fees, standard tier, regen 1.5, credit multipliers premium=3x budget=0.5x:')
    mult = {'budget': 0.5, 'standard': 1.0, 'premium': 3.0}
    for name, p, c in PLANS:
        for util in (0.55, 1.0):
            row = []
            for vk in VIDEOS:
                for tier in ['budget', 'standard', 'premium']:
                    cpc = cost(vk, 'rec', tier, regen=1.5)[0]/(max(1, CRED[vk]*mult[tier]))
                    row.append(f"{vk}{tier[0]}={gm(p, c, cpc, util)*100:5.1f}")
            print(f"  {name:26s} util={util:4.2f} " + ' '.join(row))
