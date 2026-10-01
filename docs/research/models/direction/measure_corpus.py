#!/usr/bin/env python3
"""
measure_corpus.py - automatic first-pass shot/camera/sync annotation for map-animation reference videos.

Run on a machine that can reach YouTube (the research container cannot).
  pip install yt-dlp scenedetect opencv-python-headless numpy faster-whisper
  yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" -o "corpus/%(id)s.%(ext)s" <URL>
  python3 measure_corpus.py corpus/VIDEO.mp4 --out corpus/VIDEO.shots.csv [--words]

What it measures (per segment):
  - hard cuts / dissolves (PySceneDetect AdaptiveDetector)
  - camera move inside each cut-to-cut shot, from global affine motion between frames
    (static / pan / zoom_in / zoom_out / rotate / compound), so a single continuous
    map "flight" is split into camera segments the way an editor would describe it
  - visual-event onsets (localized appearance of new pixels: labels, arrows, icons)
  - optional word timestamps (faster-whisper) and, for every visual event, the signed
    offset to the nearest word onset (negative = visual leads speech)

What it does NOT do (second pass, see README section of the report):
  - primitive IDs (border morph, army arrow, rain FX ...) -> VLM tagging of keyframe
    contact sheets + human verification on a 10-20 % sample
  - SFX hits / music changes -> audio onset + novelty analysis (librosa), optional
"""
import argparse, csv, math, sys
import numpy as np
import cv2

ANALYSIS_W = 320  # downscale width for motion analysis


def detect_cuts(path):
    from scenedetect import open_video, SceneManager
    from scenedetect.detectors import AdaptiveDetector, ContentDetector
    video = open_video(path)
    sm = SceneManager()
    sm.add_detector(ContentDetector(threshold=27.0))
    sm.add_detector(AdaptiveDetector())
    sm.detect_scenes(video, show_progress=False)
    scenes = sm.get_scene_list()
    fps = float(video.frame_rate)
    if not scenes:
        return [(0.0, float(video.duration.seconds))], fps
    return [(float(s.seconds), float(e.seconds)) for s, e in scenes], fps


def global_motion(prev, cur):
    """Return (tx, ty, scale, rot_deg, inlier_ratio) of cur relative to prev."""
    p0 = cv2.goodFeaturesToTrack(prev, maxCorners=300, qualityLevel=0.01, minDistance=6)
    if p0 is None or len(p0) < 12:
        return 0.0, 0.0, 1.0, 0.0, 0.0
    p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, p0, None)
    good0, good1 = p0[st == 1], p1[st == 1]
    if len(good0) < 12:
        return 0.0, 0.0, 1.0, 0.0, 0.0
    M, inl = cv2.estimateAffinePartial2D(good0, good1, method=cv2.RANSAC, ransacReprojThreshold=2.0)
    if M is None:
        return 0.0, 0.0, 1.0, 0.0, 0.0
    a, b = M[0, 0], M[1, 0]
    scale = math.hypot(a, b)
    rot = math.degrees(math.atan2(b, a))
    # translation of the frame centre (zoom about the centre is not a pan)
    h, w = prev.shape[:2]
    cx, cy = w / 2.0, h / 2.0
    tcx = M[0, 0] * cx + M[0, 1] * cy + M[0, 2] - cx
    tcy = M[1, 0] * cx + M[1, 1] * cy + M[1, 2] - cy
    return float(tcx), float(tcy), scale, rot, float(inl.mean()) if inl is not None else 0.0


def classify(tx, ty, sc, rot, w):
    """Per-frame label from smoothed motion. Thresholds in fraction-of-width per frame."""
    pan = math.hypot(tx, ty) / w
    z = sc - 1.0
    labels = []
    if pan > 0.0015:
        labels.append("pan")
    if z > 0.0012:
        labels.append("zoom_in")
    elif z < -0.0012:
        labels.append("zoom_out")
    if abs(rot) > 0.08:
        labels.append("rotate")
    if not labels:
        return "static"
    return labels[0] if len(labels) == 1 else "compound:" + "+".join(labels)


def analyse(path, words=None, min_seg=0.4):
    cuts, fps = detect_cuts(path)
    cap = cv2.VideoCapture(path)
    W = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    H = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    h = int(round(ANALYSIS_W * H / W))
    frames_motion, frames_event, inliers = [], [], []
    ok, f = cap.read()
    prev = cv2.cvtColor(cv2.resize(f, (ANALYSIS_W, h)), cv2.COLOR_BGR2GRAY) if ok else None
    idx = 0
    while ok:
        ok, f = cap.read()
        if not ok:
            break
        idx += 1
        cur = cv2.cvtColor(cv2.resize(f, (ANALYSIS_W, h)), cv2.COLOR_BGR2GRAY)
        tx, ty, sc, rot, inl = global_motion(prev, cur)
        frames_motion.append((idx / fps, tx, ty, sc, rot))
        inliers.append((idx / fps, inl, float(cv2.absdiff(cur, prev).mean())))
        # visual event = residual after compensating global motion, concentrated in a blob
        ca, sa = sc * math.cos(math.radians(rot)), sc * math.sin(math.radians(rot))
        cx, cy = ANALYSIS_W / 2.0, h / 2.0
        M = np.array([[ca, -sa, tx + cx - (ca * cx - sa * cy)],
                      [sa, ca, ty + cy - (sa * cx + ca * cy)]], dtype=np.float32)
        warped = cv2.warpAffine(prev, M, (ANALYSIS_W, h))
        resid = cv2.absdiff(cur, warped)
        _, mask = cv2.threshold(resid, 40, 255, cv2.THRESH_BINARY)
        frac = mask.mean() / 255.0
        frames_event.append((idx / fps, frac))
        prev = cur
    cap.release()

    # smooth motion over 5 frames and label
    arr = np.array(frames_motion) if frames_motion else np.zeros((0, 5))
    k = 5
    if len(arr) >= k:
        ker = np.ones(k) / k
        for c in range(1, 5):
            arr[:, c] = np.convolve(arr[:, c], ker, mode="same")
    labels = [classify(r[1], r[2], r[3], r[4], ANALYSIS_W) for r in arr]

    # events: rising edges of residual fraction above adaptive threshold
    ev = np.array(frames_event) if frames_event else np.zeros((0, 2))
    events = []
    if len(ev):
        thr = max(0.004, float(np.percentile(ev[:, 1], 90)))
        above = ev[:, 1] > thr
        for i in range(1, len(above)):
            if above[i] and not above[i - 1]:
                events.append(float(ev[i, 0]))

    # reject detector cuts that are really fast camera moves: if the frame pair across the
    # boundary is still well explained by one global affine motion, it is not a cut
    confirmed = [list(cuts[0])] if cuts else []
    for (s0, e0) in cuts[1:]:
        near = [r for r in inliers if abs(r[0] - s0) <= 0.5 / fps + 1e-6]
        if near and near[0][1] > 0.6:
            confirmed[-1][1] = e0
        else:
            confirmed.append([s0, e0])
    cuts = [tuple(c) for c in confirmed]

    rows = []
    for si, (s, e) in enumerate(cuts):
        # camera segments inside shot: run-length encode per-frame labels,
        # absorb runs shorter than min_seg into the previous run, merge equal neighbours
        runs = []
        for (t, *_), lab in zip(arr, labels):
            if t < s or t >= e:
                continue
            if runs and runs[-1][2] == lab:
                runs[-1][1] = t
            else:
                runs.append([t, t, lab])
        merged = []
        for r in runs:
            if merged and (r[1] - r[0] < min_seg or merged[-1][2] == r[2]):
                merged[-1][1] = r[1]
            else:
                merged.append(r)
        if merged and len(merged) > 1 and merged[0][1] - merged[0][0] < min_seg:
            merged[1][0] = merged[0][0]; merged.pop(0)
        segs = []
        for i, (a0, b0, lab) in enumerate(merged):
            a1 = s if i == 0 else a0
            b1 = e if i == len(merged) - 1 else merged[i + 1][0]
            segs.append((a1, b1, lab))
        if not segs:
            segs = [(s, e, "static")]
        shot_events = [t for t in events if s <= t < e]
        for gi, (a, b, lab) in enumerate(segs):
            seg_events = [t for t in shot_events if a <= t < b]
            offs = []
            if words:
                for t in seg_events:
                    nearest = min(words, key=lambda w: abs(w[1] - t))
                    offs.append(round((t - nearest[1]) * 1000))  # ms; negative = visual leads
            rows.append({
                "shot_index": si, "segment_index": gi,
                "start_s": round(a, 3), "end_s": round(b, 3), "duration_s": round(b - a, 3),
                "cut_in": "cut" if gi == 0 else "camera_change",
                "camera_move": lab, "n_visual_events": len(seg_events),
                "event_times_s": ";".join(f"{t:.2f}" for t in seg_events),
                "event_word_offsets_ms": ";".join(str(o) for o in offs),
            })
    return rows, fps


def transcribe(path):
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(path, word_timestamps=True)
    return [(w.word.strip(), w.start) for seg in segments for w in seg.words]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", required=True)
    ap.add_argument("--words", action="store_true", help="also run faster-whisper word timestamps")
    a = ap.parse_args()
    words = transcribe(a.video) if a.words else None
    rows, fps = analyse(a.video, words)
    with open(a.out, "w", newline="") as fh:
        wr = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        wr.writeheader()
        wr.writerows(rows)
    d = [r["duration_s"] for r in rows]
    print(f"fps={fps:.2f} segments={len(rows)} median_seg={np.median(d):.2f}s mean={np.mean(d):.2f}s", file=sys.stderr)


if __name__ == "__main__":
    main()
