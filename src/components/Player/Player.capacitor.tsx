import React, { useEffect } from 'react';
import { CapacitorVideoPlayer } from 'capacitor-video-player';

import styles from './Player.module.scss';
import type { Props } from './Player';
import type { PlaylistItem } from '#types/playlist';

async function initPlayer (item: PlaylistItem) {
  await CapacitorVideoPlayer.initPlayer({
    mode: 'fullscreen',
    url: item.sources[0].file,
    playerId: 'player',
    componentTag: 'div',
    title: item.title,
    artwork: item.image,
  });
}

const Player: React.FC<Props> = ({
  item,
}: Props) => {
  useEffect(() => {
    initPlayer(item);

    return () => {
      CapacitorVideoPlayer.exitPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={styles.container} />;
};

export default Player;
