import type { CustomFormField, ConsentsValue } from '../../types/account';
import type { Config } from '../../types/config';
import type { GenericFormValues } from '../../types/form';
import type { Playlist, PlaylistItem } from '../../types/playlist';
import { CARD_ASPECT_RATIOS } from '../constants';

export type PosterAspectRatio = (typeof CARD_ASPECT_RATIOS)[number];

const getFiltersFromConfig = (config: Config, playlistId: string | undefined): string[] => {
  const menuItem = config.menu.find((item) => item.contentId === playlistId);
  const filters = menuItem?.filterTags?.split(',').filter(Boolean);

  return filters || [];
};

const filterPlaylist = (playlist: Playlist, filter: string) => {
  if (filter === '') return playlist;

  return {
    ...playlist,
    playlist: playlist.playlist.filter(({ tags }) => (tags ? tags.split(',').includes(filter) : false)),
  };
};

const chunk = <T>(input: T[], size: number) => {
  return input?.reduce((arr: T[][], item, idx: number) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

const findPlaylistImageForWidth = (playlistItem: PlaylistItem, width: number): string =>
  playlistItem.images.find((img) => img.width === width)?.src || playlistItem.image;

const generatePlaylistPlaceholder = (playlistLength: number = 15): Playlist => ({
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

const formatConsentValues = (publisherConsents: CustomFormField[] | null = [], customerConsents: ConsentsValue[] | null = []) => {
  if (!publisherConsents || !customerConsents) {
    return {};
  }

  return publisherConsents.reduce((acc, publisherConsent) => {
    const consent = customerConsents?.find((customerConsent) => customerConsent.name === publisherConsent.name);

    if (consent) {
      acc[publisherConsent.name] = consent.state === 'accepted';
    }

    return acc;
  }, {} as Record<string, boolean>);
};

const formatConsents = (publisherConsents: CustomFormField[] | null = [], customerConsents: ConsentsValue[] | null = []) => {
  if (!publisherConsents || !customerConsents) {
    return {};
  }
  const values: Record<string, boolean> = {};
  publisherConsents?.forEach((publisherConsent) => {
    if (customerConsents?.find((customerConsent) => customerConsent.name === publisherConsent.name && customerConsent.state === 'accepted')) {
      values[publisherConsent.name] = true;
    }
  });

  return values;
};

const extractConsentValues = (consents?: CustomFormField[]) => {
  const values: Record<string, string | boolean> = {};

  if (!consents) {
    return values;
  }

  consents?.forEach((consent) => {
    values[consent.name] = consent.type === 'checkbox' ? consent.enabledByDefault === true : consent.defaultValue ?? '';
  });

  return values;
};

const formatConsentsFromValues = (publisherConsents: CustomFormField[] | null, values?: GenericFormValues) => {
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

const checkConsentsFromValues = (publisherConsents: CustomFormField[], consents: Record<string, string | boolean>) => {
  const customerConsents: ConsentsValue[] = [];
  const consentsErrors: string[] = [];

  if (!publisherConsents || !consents) return { customerConsents, consentsErrors };

  publisherConsents.forEach((consent) => {
    if (consent.required && !consents[consent.name]) {
      consentsErrors.push(consent.name);
    }

    customerConsents.push({
      name: consent.name,
      version: consent.version || '1',
      state: consents[consent.name] ? 'accepted' : 'declined',
    });
  });

  return { customerConsents, consentsErrors };
};

const deepCopy = (obj: unknown) => {
  if (Array.isArray(obj) || (typeof obj === 'object' && obj !== null)) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
};

const parseAspectRatio = (input: unknown) => {
  if (typeof input === 'string' && (CARD_ASPECT_RATIOS as readonly string[]).includes(input)) return input as PosterAspectRatio;
};

const parseTilesDelta = (posterAspect?: PosterAspectRatio) => {
  if (!posterAspect) {
    return 0;
  }

  const parts = posterAspect.split(':');

  return parts.length === 2 ? Math.floor(parseInt(parts[1]) / parseInt(parts[0])) : 0;
};

export {
  getFiltersFromConfig,
  filterPlaylist,
  chunk,
  findPlaylistImageForWidth,
  generatePlaylistPlaceholder,
  formatConsentValues,
  formatConsents,
  formatConsentsFromValues,
  extractConsentValues,
  checkConsentsFromValues,
  deepCopy,
  parseAspectRatio,
  parseTilesDelta,
};
