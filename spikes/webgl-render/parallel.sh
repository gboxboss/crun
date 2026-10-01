# usage: bash parallel.sh N [extra render.js args]
N=$1; shift
TOTAL=180; CH=$(( (TOTAL + N - 1) / N ))
C0=$(awk '/^cpu /{b=0;for(i=2;i<=NF;i++)t+=$i; print t-$5-$6, t}' /proc/stat)
T0=$(date +%s.%N)
for k in $(seq 0 $((N-1))); do
  F=$((k*CH)); T=$(( (k+1)*CH )); [ $T -gt $TOTAL ] && T=$TOTAL
  node render.js tag=par${N}_$k from=$F to=$T flags=eglmesa read=jpeg q=skip=1 passes=2 out=out/par${N}_part$k.mp4 "$@" > out/par${N}_$k.log 2>&1 &
done
wait
T1=$(date +%s.%N)
C1=$(awk '/^cpu /{b=0;for(i=2;i<=NF;i++)t+=$i; print t-$5-$6, t}' /proc/stat)
# concat parts
rm -f out/par${N}_list.txt; for k in $(seq 0 $((N-1))); do echo "file 'par${N}_part$k.mp4'" >> out/par${N}_list.txt; done
TC0=$(date +%s.%N); ffmpeg -y -loglevel error -f concat -safe 0 -i out/par${N}_list.txt -c copy out/par${N}_concat.mp4; TC1=$(date +%s.%N)
python3 - "$N" "$T0" "$T1" "$C0" "$C1" "$TC0" "$TC1" <<'PY'
import json,sys
N=int(sys.argv[1]); T0,T1=float(sys.argv[2]),float(sys.argv[3]); c0=list(map(int,sys.argv[4].split())); c1=list(map(int,sys.argv[5].split()))
runs=[json.load(open(f'out/par{N}_{k}.json')) for k in range(N)]
for p in (0,1):
  frames=sum(r[p]['summary']['frames'] for r in runs); wall=max(r[p]['summary']['wallMs'] for r in runs)
  cpu=sum(r[p]['summary']['busyCpuSec'] for r in runs)/N  # each process measured system-wide busy; overlapping -> average
  print(f"N={N} pass{p+1}: frames={frames} maxPassWall={wall}ms -> {wall/frames:.1f} ms/frame aggregate, {frames/(wall/1000):.2f} fps; per-proc msPerFrame={[r[p]['summary']['msPerFrame'] for r in runs]} sysCpuUtil~{[r[p]['summary']['cpuUtil'] for r in runs]}")
busy=(c1[0]-c0[0])/100; tot=(c1[1]-c0[1])
print(f"N={N} end-to-end incl launch+setup+2 passes+encode: {T1-T0:.1f}s, system busy CPU {busy:.1f}s, util {100*(c1[0]-c0[0])/tot:.1f}%, concat {float(sys.argv[7])-float(sys.argv[6]):.2f}s; setupWall={[r[0]['summary']['setupWall'] for r in runs]}")
PY
