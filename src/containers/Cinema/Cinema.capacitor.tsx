import React from 'react';

import type { Props } from './Cinema';

import PlayerContainer from '#src/containers/PlayerContainer/PlayerContainer';

const Cinema: React.FC<Props> = ({
  open,
  item,
  seriesItem,
  onPlay,
  onPause,
  onComplete,
  onClose,
  onNext,
  feedId,
  liveStartDateTime,
  liveEndDateTime,
  liveFromBeginning,
}: Props) => {
  if (!open) {
    return null;
  }

  return (
    <PlayerContainer
      item={item}
      seriesItem={seriesItem}
      feedId={feedId}
      onClose={onClose}
      autostart={true}
      onPlay={onPlay}
      onPause={onPause}
      onComplete={onComplete}
      onNext={onNext}
      liveEndDateTime={liveEndDateTime}
      liveFromBeginning={liveFromBeginning}
      liveStartDateTime={liveStartDateTime}
    />
  );
};

export default Cinema;
