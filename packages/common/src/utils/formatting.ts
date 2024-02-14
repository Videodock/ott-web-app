export const formatDurationTag = (seconds: number): string | null => {
  if (!seconds) return null;

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} min`;
};

/**
 * @param duration Duration in seconds
 *
 * Calculates hours and minutes into a string
 * Hours are only shown if at least 1
 * Minutes get rounded
 *
 * @returns string, such as '2h 24m' or '31m'
 */

export const formatDuration = (duration: number): string | null => {
  if (!duration) return null;

  const hours = Math.floor(duration / 3600);
  const minutes = Math.round((duration - hours * 3600) / 60);

  const hoursString = hours ? `${hours}h ` : '';
  const minutesString = minutes ? `${minutes}m ` : '';

  return `${hoursString}${minutesString}`;
};

export const formatPrice = (price: number, currency: string, country?: string) => {
  return new Intl.NumberFormat(country || 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatSeriesMetaString = (seasonNumber?: string, episodeNumber?: string) => {
  if (!seasonNumber && !episodeNumber) {
    return '';
  }

  return seasonNumber && seasonNumber !== '0' ? `S${seasonNumber}:E${episodeNumber}` : `E${episodeNumber}`;
};

export const formatVideoSchedule = (locale: string, scheduledStart?: Date, scheduledEnd?: Date) => {
  if (!scheduledStart) {
    return '';
  }

  if (!scheduledEnd) {
    return formatLocalizedDateTime(scheduledStart, locale, ' • ');
  }

  return `${formatLocalizedDateTime(scheduledStart, locale, ' • ')} - ${formatLocalizedTime(scheduledEnd, locale)}`;
};

export const formatLocalizedDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const formatLocalizedTime = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric' }).format(date);
};

export const formatLocalizedDateTime = (date: Date, locale: string, separator = ' ') => {
  return `${formatLocalizedDate(date, locale)}${separator}${formatLocalizedTime(date, locale)}`;
};
