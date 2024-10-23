import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { CSSProperties, TransitionEventHandler } from 'react';

import Image from '../Image/Image';

import styles from './FeaturedShelf.module.scss';

const FeaturedBackground = ({
  id,
  item,
  style,
  hidden,
  onTransitionEnd,
}: {
  id?: string;
  item: PlaylistItem | null;
  style: CSSProperties;
  hidden?: boolean;
  onTransitionEnd?: TransitionEventHandler;
}) => {
  if (!item) return null;

  const image = item.images.find((img) => img.width === 1920)?.src || item?.backgroundImage;

  return (
    <div style={style} aria-hidden={hidden ? 'true' : undefined} id={id} onTransitionEnd={onTransitionEnd}>
      <Image className={styles.image} image={image} width={1920} alt={item?.title} />
    </div>
  );
};

export default FeaturedBackground;
