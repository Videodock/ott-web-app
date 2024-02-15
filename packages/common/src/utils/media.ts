import type { Playlist, PlaylistItem } from '../../types/playlist';
import { CONTENT_TYPE } from '../constants';

import { formatDuration, formatVideoSchedule } from './formatting';

type RequiredProperties<T, P extends keyof T> = T & Required<Pick<T, P>>;

type DeprecatedPlaylistItem = {
  seriesPlayListId?: string;
  seriesPlaylistId?: string;
};

export const isPlaylist = (item: unknown): item is Playlist => !!item && typeof item === 'object' && 'feedid' in item;
export const isPlaylistItem = (item: unknown): item is PlaylistItem => !!item && typeof item === 'object' && 'mediaid' in item;

// For the deprecated series flow we store seriesId in custom params
export const getSeriesPlaylistIdFromCustomParams = (item: (PlaylistItem & DeprecatedPlaylistItem) | undefined) =>
  item ? item.seriesPlayListId || item.seriesPlaylistId || item.seriesId : undefined;

// For the deprecated flow we store seriesId in the media custom params
export const isLegacySeriesFlow = (item: PlaylistItem) => {
  return typeof getSeriesPlaylistIdFromCustomParams(item) !== 'undefined';
};

// For the new series flow we use contentType custom param to define media item to be series
// In this case media item and series item have the same id
export const isSeriesContentType = (item: PlaylistItem) => item.contentType?.toLowerCase() === CONTENT_TYPE.series;

export const isSeries = (item: PlaylistItem) => isLegacySeriesFlow(item) || isSeriesContentType(item);

export const isEpisode = (item: PlaylistItem) => {
  return typeof item?.episodeNumber !== 'undefined' || item?.contentType?.toLowerCase() === CONTENT_TYPE.episode;
};

export const getLegacySeriesPlaylistIdFromEpisodeTags = (item: PlaylistItem | undefined) => {
  if (!item || !isEpisode(item)) {
    return;
  }

  const tags = item.tags ? item.tags.split(',') : [];
  const seriesIdTag = tags.find(function (tag) {
    return /seriesid_([\w\d]+)/i.test(tag);
  });

  if (seriesIdTag) {
    return seriesIdTag.split('_')[1];
  }

  return;
};

export const isLiveChannel = (item: PlaylistItem): item is RequiredProperties<PlaylistItem, 'contentType' | 'liveChannelsId'> =>
  item.contentType?.toLowerCase() === CONTENT_TYPE.liveChannel && !!item.liveChannelsId;

export const createVideoMetaArray = (media: PlaylistItem, episodesLabel?: string) => {
  const metaData = [];

  if (media.pubdate) metaData.push(String(new Date(media.pubdate * 1000).getFullYear()));
  if (!episodesLabel && media.duration) metaData.push(formatDuration(media.duration));
  if (episodesLabel) metaData.push(episodesLabel);
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData;
};

export const createPlaylistMetaArray = (playlist: Playlist, episodesLabel?: string) => {
  const metaData = [];

  if (episodesLabel) metaData.push(episodesLabel);
  if (playlist.genre) metaData.push(playlist.genre as string);
  if (playlist.rating) metaData.push(playlist.rating as string);

  return metaData;
};

export const createLiveEventMetaArray = (media: PlaylistItem, locale: string) => {
  const metaData = [];
  const scheduled = formatVideoSchedule(locale, media.scheduledStart, media.scheduledEnd);

  if (scheduled) metaData.push(scheduled);
  if (media.duration) metaData.push(formatDuration(media.duration));
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData;
};
