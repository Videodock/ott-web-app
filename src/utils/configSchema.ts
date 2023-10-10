import { array, boolean, mixed, number, object, SchemaOf, string, StringSchema } from 'yup';

import type { Cleeng, JWP, Config, Content, Features, Menu, Styling } from '#types/Config';

const contentSchema: SchemaOf<Content> = object({
  contentId: string().notRequired(),
  title: string().notRequired(),
  featured: boolean().notRequired(),
  backgroundColor: string().nullable().notRequired(),
  type: mixed().oneOf(['playlist', 'continue_watching', 'favorites']),
}).defined();

const menuSchema: SchemaOf<Menu> = object().shape({
  label: string().defined(),
  contentId: string().defined(),
  filterTags: string().notRequired(),
  type: mixed().oneOf(['playlist']).notRequired(),
});

const featuresSchema: SchemaOf<Features> = object({
  recommendationsPlaylist: string().nullable(),
  searchPlaylist: string().nullable(),
  continueWatchingList: string().nullable(),
  favoritesList: string().nullable(),
});

const cleengSchema: SchemaOf<Cleeng> = object({
  id: string().nullable(),
  monthlyOffer: string().nullable(),
  yearlyOffer: string().nullable(),
  useSandbox: boolean().default(true),
});

const jwpSchema: SchemaOf<JWP> = object({
  clientId: string().nullable(),
  assetId: number().nullable(),
  useSandbox: boolean().default(true),
});

const stylingSchema: SchemaOf<Styling> = object({
  backgroundColor: string().nullable(),
  highlightColor: string().nullable(),
  headerBackground: string().nullable(),
  footerText: string().nullable(),
});

export const configSchema: SchemaOf<Config> = object({
  id: string().notRequired(),
  siteName: string().notRequired(),
  description: string().defined(),
  analyticsToken: string().nullable(),
  adSchedule: string().nullable(),
  assets: object({
    banner: string().notRequired().nullable(),
  })
    .notRequired()
    .default({ banner: '/images/logo.png' }),
  content: array().of(contentSchema).default([]),
  menu: array().of(menuSchema).default([]),
  styling: stylingSchema.notRequired().default({ footerText: '' }),
  features: featuresSchema.notRequired().default({}),
  integrations: object({
    cleeng: cleengSchema.notRequired(),
    jwp: jwpSchema.notRequired(),
  })
    .notRequired()
    .default({}),
  custom: object().notRequired().default({}),
  contentSigningService: object().shape({
    // see {@link https://github.com/jquense/yup/issues/1367}
    host: string().required() as StringSchema<string>,
    drmPolicyId: string().notRequired(),
  }),
  contentProtection: object()
    .shape({
      accessModel: string().oneOf(['free', 'freeauth', 'authvod', 'svod']).notRequired(),
      drm: object({
        defaultPolicyId: string(),
      }).notRequired(),
    })
    .notRequired(),
}).defined();
