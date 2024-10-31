import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import ChevronRight from '@jwp/ott-theme/assets/icons/chevron_right.svg?react';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { isContentType, testId } from '@jwp/ott-common/src/utils/common';
import { MEDIA_CONTENT_TYPE } from '@jwp/ott-common/src/constants';

import TruncatedText from '../TruncatedText/TruncatedText';
import StartWatchingButton from '../../containers/StartWatchingButton/StartWatchingButton';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';

import styles from './FeaturedShelf.module.scss';

const FeaturedMetadata = ({
  item,
  loading,
  playlistId,
  style,
  hidden,
}: {
  item: PlaylistItem | null;
  loading: boolean;
  playlistId: string | undefined;
  style?: CSSProperties;
  hidden?: boolean;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  if (!item) return null;

  const isWatchable =
    !isContentType(item, MEDIA_CONTENT_TYPE.hub) && !isContentType(item, MEDIA_CONTENT_TYPE.liveChannel) && !isContentType(item, MEDIA_CONTENT_TYPE.page);
  const hasVideo = item.sources.find((source) => source.file.indexOf('.m3u8') > -1 || source.file.indexOf('.mp4') > -1);

  return (
    <div
      className={styles.metadata}
      data-testid={testId(`featured-metadata--${hidden ? 'hidden' : 'visible'}`)}
      style={{ ...style, visibility: hidden ? 'hidden' : undefined }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <h2 className={classNames(loading ? styles.loadingTitle : styles.title)}>{!loading && item?.title}</h2>
      <TruncatedText text={item?.description} maximumLines={3} />
      <div>
        {hasVideo && isWatchable && <StartWatchingButton item={item} playUrl={mediaURL({ id: item.mediaid, title: item.title, playlistId, play: true })} />}
        <Button
          label={t('common:more_info')}
          onClick={() => navigate(mediaURL({ id: item.mediaid, title: item.title, playlistId }))}
          startIcon={<Icon icon={ChevronRight} />}
          size="large"
        />
      </div>
    </div>
  );
};

export default FeaturedMetadata;
