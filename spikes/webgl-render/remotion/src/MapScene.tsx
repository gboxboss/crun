import React, { useEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';

const ORIGIN = 'http://127.0.0.1:8080';
// One scene per tab; created lazily and shared between frames rendered in this tab.
let scenePromise: Promise<any> | null = null;

export const MapScene: React.FC<{ query: string }> = ({ query }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<any>(null);
  const [loadHandle] = useState(() => delayRender('map setup', { timeoutInMilliseconds: 120000 }));

  useEffect(() => {
    if (!scenePromise) {
      scenePromise = (async () => {
        const mod = await import(/* webpackIgnore: true */ `${ORIGIN}/scene.mjs`);
        const s = mod.createScene(ref.current, { origin: ORIGIN, query });
        await s.setup();
        return s;
      })();
    }
    scenePromise.then((s) => { setScene(s); continueRender(loadHandle); });
  }, [loadHandle, query]);

  useEffect(() => {
    if (!scene) return;
    const h = delayRender(`map frame ${frame}`, { timeoutInMilliseconds: 60000 });
    scene.frame(frame, fps).then(() => continueRender(h));
  }, [scene, frame, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#9fc3d6' }}>
      <link rel="stylesheet" href={`${ORIGIN}/lib/maplibre-gl.css`} />
      <div ref={ref} style={{ position: 'absolute', inset: 0 }} />
    </AbsoluteFill>
  );
};
