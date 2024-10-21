import classNames from 'classnames';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';

import styles from './FeaturedShelf.module.scss';
import type { Animating } from './FeaturedShelf';

type Props = {
  playlist: Playlist;
  dimmed: boolean;
  index: number;
  animating: Animating;
  prevItem: PlaylistItem;
  nextItem: PlaylistItem;
  setIndex: (index: number) => void;
};

const FeaturedPagination = ({ playlist, dimmed, index, animating, prevItem, nextItem, setIndex }: Props) => {
  return (
    <div className={classNames(styles.dots, styles.undimmed, { [styles.dimmed]: dimmed })}>
      {playlist.playlist.map((current, itemIndex) => {
        return (
          <button
            className={classNames(
              styles.dot,
              animating &&
                playlist.playlist.findIndex(({ mediaid }) => mediaid === (['left', 'left-end'].includes(animating) ? prevItem : nextItem).mediaid) ===
                  itemIndex &&
                styles.dotActive,
              !animating && itemIndex === index && styles.dotActive,
            )}
            aria-label={`Show item ${index + 1} of ${playlist.playlist.length}`}
            key={current.mediaid}
            onClick={() => setIndex(itemIndex)}
          >
            <div />
          </button>
        );
      })}
    </div>
  );
};

export default FeaturedPagination;
