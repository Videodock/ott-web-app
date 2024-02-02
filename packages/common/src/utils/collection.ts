import type { CustomFormField, ConsentsValue } from '../../types/account';
import type { Config } from '../../types/config';
import type { GenericFormValues } from '../../types/form';
import type { Playlist, PlaylistItem } from '../../types/playlist';
import { CARD_ASPECT_RATIOS } from '../constants';

export type PosterAspectRatio = (typeof CARD_ASPECT_RATIOS)[number];

export const getFiltersFromConfig = (config: Config, playlistId: string | undefined): string[] => {
  const menuItem = config.menu.find((item) => item.contentId === playlistId);
  const filters = menuItem?.filterTags?.split(',').filter(Boolean);

  return filters || [];
};

export const filterPlaylist = (playlist: Playlist, filter: string) => {
  if (filter === '') return playlist;

  return {
    ...playlist,
    playlist: playlist.playlist.filter(({ tags }) => (tags ? tags.split(',').includes(filter) : false)),
  };
};

export const generatePlaylistPlaceholder = (playlistLength: number = 15): Playlist => ({
  title: '',
  playlist: new Array(playlistLength).fill({}).map(
    (_value, index) =>
      ({
        description: '',
        duration: 0,
        feedid: '',
        image: '',
        images: [],
        cardImage: '',
        backgroundImage: '',
        channelLogoImage: '',
        link: '',
        genre: '',
        mediaid: `placeholder_${index}`,
        pubdate: 0,
        rating: '',
        sources: [],
        tags: '',
        title: '',
        tracks: [],
      } as PlaylistItem),
  ),
});

export const extractCustomFormFieldValues = (fields?: CustomFormField[]) => {
  const values: Record<string, string | boolean> = {};

  if (!fields) {
    return values;
  }

  fields?.forEach((consent) => {
    values[consent.name] = consent.type === 'checkbox' ? consent.enabledByDefault === true : consent.defaultValue ?? '';
  });

  return values;
};

export const formatConsentsFromValues = (publisherConsents: CustomFormField[] | null, values?: GenericFormValues) => {
  const consents: ConsentsValue[] = [];

  if (!publisherConsents || !values) return consents;

  publisherConsents.forEach((consent) => {
    consents.push({
      name: consent.name,
      version: consent.version || '1',
      state: values[consent.name] ? 'accepted' : 'declined',
    });
  });

  return consents;
};

export const formatConsentsValues = (consentsValues: ConsentsValue[]) =>
  Object.fromEntries((consentsValues || []).map((consent) => [consent.name, consent.state === 'accepted']));

export const deepCopy = (obj: unknown) => {
  if (Array.isArray(obj) || (typeof obj === 'object' && obj !== null)) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
};

export const parseAspectRatio = (input: unknown) => {
  if (typeof input === 'string' && (CARD_ASPECT_RATIOS as readonly string[]).includes(input)) return input as PosterAspectRatio;
};

export const parseTilesDelta = (posterAspect?: PosterAspectRatio) => {
  if (!posterAspect) {
    return 0;
  }

  const parts = posterAspect.split(':');

  return parts.length === 2 ? Math.floor(parseInt(parts[1]) / parseInt(parts[0])) : 0;
};
