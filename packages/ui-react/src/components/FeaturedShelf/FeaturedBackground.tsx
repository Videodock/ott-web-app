import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import type { CSSProperties } from 'react';

import Image from '../Image/Image';

import styles from './FeaturedShelf.module.scss';

const FeaturedBackground = ({ item, style }: { item: PlaylistItem; style: CSSProperties }) => {
  const image = item.images.find((img) => img.width === 1920)?.src || item?.backgroundImage;

  if (!item) return null;

  return (
    <div style={style}>
      <Image className={styles.image} image={image} width={1920} alt={item?.title} />
    </div>
  );
};

export default FeaturedBackground;
