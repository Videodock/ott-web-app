import React, { useEffect } from 'react';
import { JWPlayer } from 'jwplayer-capacitor';

import styles from './Player.module.scss';
import type { Props } from './Player';
import type { PlaylistItem } from '#types/playlist';

async function initPlayer (item: PlaylistItem) {
  await JWPlayer.initialize({
    iosLicenseKey: '...',
    androidLicenseKey: '...',
  });

  await JWPlayer.create({
    nativeConfiguration: {
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      forceFullScreen: true,
      playlist: [
        {
          file: item.sources[0].file,
          image: item.image,
          title: item.title,
          description: item.description,
          starttime: 0,
          captions: [],
        },
      ],
    },
  });
}

const Player: React.FC<Props> = ({
  item,
}: Props) => {
  useEffect(() => {
    initPlayer(item);

    return () => {
      JWPlayer.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={styles.container} />;
};

export default Player;
