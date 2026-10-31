# 원장(audits/parity_ledger.json)의 차이를 같은 원인끼리 묶는다(이름, 분류, 항목, 값 쌍). 원장 0절 '원인 상위 20' 재료
import json, collections, re, sys
d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'audits/parity_ledger.json'))
g = collections.Counter(); ex = {}; scr = collections.defaultdict(set); own = collections.defaultdict(collections.Counter)
for k, s in d['screens'].items():
    for r in s['rows']:
        if r['allowed']: continue
        n = re.sub(r'#\d+$', '', r['name']); kd = r['kind']
        if kd == 'box': sig = (kd, n, r['field'])
        elif kd == 'color': sig = (kd, n, r['field'], r['figma'].split()[0], (r['code'] or '').split()[0])
        elif kd in ('shape', 'font'): sig = (kd, n, re.sub(r'\d+', '#', r.get('detail', '')))
        else: sig = (kd, n)
        g[sig] += 1; ex.setdefault(sig, (k, r)); scr[sig].add(k.split('_')[0]); own[sig][s['owner']] += 1
for sig, c in g.most_common(int(sys.argv[2]) if len(sys.argv) > 2 else 40):
    k, r = ex[sig]
    print(c, len(scr[sig]), dict(own[sig]), sig, k, {a: b for a, b in r.items() if a not in ('kind', 'name', 'allowed')})
