import { createURL } from './urlFormatting';

describe('createUrl', () => {
  test('valid url from a path, query params', async () => {
    const url = createURL('/test', { foo: 'bar' });

    expect(url).toEqual('/test?foo=bar');
  });
  test('valid url from a path including params, query params', async () => {
    const url = createURL('/test?existing-param=1', { foo: 'bar' });

    expect(url).toEqual('/test?existing-param=1&foo=bar');
  });
});
