import { afterEach, beforeEach, describe, expect } from 'vitest';
import { unregister } from 'timezone-mock';

import EpgClientService from './epgClient.service';
import type EpgProviderService from './epgProvider.service';

import channel1 from '#test/epg/jwChannel.json';
import livePlaylistFixture from '#test/fixtures/livePlaylist.json';
import type { Playlist } from '#types/playlist';
import { EPG_TYPE } from '#src/config';

const livePlaylist = livePlaylistFixture as Playlist;
const epgService = new EpgClientService();

const transformProgram = vi.fn();
const fetchSchedule = vi.fn();

const mockProgram1 = {
  id: 'test',
  title: 'Test',
  startTime: '2022-06-03T23:50:00.000Z',
  endTime: '2022-06-04T00:55:00.000Z',
  cardImage: '',
  backgroundImage: '',
  description: 'Description',
};

const mockProgram2 = {
  id: 'test',
  title: 'Test',
  startTime: '2022-06-04T07:00:00.000Z',
  endTime: '2022-06-04T07:40:00.000Z',
  cardImage: '',
  backgroundImage: '',
  description: 'Description',
};

vi.mock('#src/modules/container', () => ({
  getNamedModule: (_service: EpgProviderService, type: string) => {
    switch (type) {
      case EPG_TYPE.JW:
      case EPG_TYPE.VIEW_NEXA:
        return {
          transformProgram,
          fetchSchedule,
        };
    }
  },
}));

describe('epgService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // must be called before `vi.useRealTimers()`
    unregister();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('getSchedule fetches and validates a valid schedule', async () => {
    const mockProgram = {
      id: 'test',
      title: 'Test',
      startTime: '2022-06-03T23:50:00.000Z',
      endTime: '2022-06-03T23:55:00.000Z',
      cardImage: '',
      backgroundImage: '',
      description: 'Description',
    };

    fetchSchedule.mockResolvedValue(channel1);
    transformProgram.mockResolvedValue(mockProgram);

    const schedule = await epgService.getSchedule(livePlaylist.playlist[0]);

    expect(schedule.title).toEqual('Channel 1');
    expect(schedule.programs.length).toEqual(33);
    expect(schedule.catchupHours).toEqual(7);
  });

  test('getSchedule enables the demo transformer when scheduleDemo is set', async () => {
    fetchSchedule.mockResolvedValue(channel1);
    transformProgram.mockResolvedValueOnce(mockProgram1);
    transformProgram.mockResolvedValue(mockProgram2);

    // mock the date
    vi.setSystemTime(new Date(2036, 5, 3, 14, 30, 10, 500));

    const item = Object.assign({}, livePlaylist.playlist[0]);
    item.scheduleDemo = '1';

    const schedule = await epgService.getSchedule(item);

    expect(schedule.title).toEqual('Channel 1');
    expect(schedule.programs[0].startTime).toEqual('2036-06-03T23:50:00.000Z');
    expect(schedule.programs[0].endTime).toEqual('2036-06-04T00:55:00.000Z');

    expect(schedule.programs[1].startTime).toEqual('2036-06-04T07:00:00.000Z');
    expect(schedule.programs[1].endTime).toEqual('2036-06-04T07:40:00.000Z');
  });

  test('parseSchedule should remove programs where validation failed', async () => {
    const scheduleItem = {
      id: '1234-1234-1234-1234-1234',
      title: 'The title',
      endTime: '2022-07-19T12:00:00Z',
    };

    transformProgram.mockRejectedValueOnce(undefined);
    transformProgram.mockResolvedValueOnce(mockProgram1);
    transformProgram.mockRejectedValueOnce(undefined);
    transformProgram.mockResolvedValueOnce(mockProgram2);

    const schedule = await epgService.parseSchedule([scheduleItem, scheduleItem, scheduleItem, scheduleItem], livePlaylist.playlist[0]);

    expect(schedule.length).toEqual(2);
  });
});
