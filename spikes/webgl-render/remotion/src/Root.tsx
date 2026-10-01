import React from 'react';
import { Composition } from 'remotion';
import { MapScene } from './MapScene';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MapH" component={MapScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ query: 'skip=1' }} />
    <Composition id="MapV" component={MapScene} durationInFrames={180} fps={30} width={1080} height={1920} defaultProps={{ query: 'skip=1' }} />
    <Composition id="MapHNoSkip" component={MapScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ query: '' }} />
  </>
);
