export type AdSchedule = {
  adscheduleid?: string;
  client: string;
  schedule: string;
};

export type AdScheduleUrls = {
  json?: string | null;
  xml?: string | null;
};

export type AdDeliveryMethod = 'csai' | 'ssai';

type DeliverySchedule = {
  tag: string[];
  type: 'linear' | 'nonlinear';
  offset: 'pre' | 'post' | string; // seconds, timestamp, percentage
  skipoffset?: number;
};

type DeliveryRules = {
  startOnSeek: 'pre' | 'none' | 'mid';
  timeBetweenAds: number;
  startOn?: number;
  frequency?: number;
};

type DeliveryBids = {
  settings: {
    bidTimeout: number;
    floorPriceCents: number;
    mediationLayerAdServer: 'dfp' | 'jwp' | 'jwpdfp' | 'jwpspotx';
    disableConsentManagementOnNoCmp?: boolean;
    sendAllBids: boolean;
    buckets: { min?: number; max?: number; increment?: number }[]; // anyOf
    consentManagement: {
      usp: {
        cmpApi: 'iab' | 'static';
        timeout: number;
      };
      gdpr: {
        cmpApi: 'iab' | 'static';
        timeout: number;
        defaultGdprScope: boolean;
        allowAuctionWithoutConsent: boolean;
        rules?: {
          purpose: 'basicAds' | 'storage' | 'measurement';
          enforcePurpose: boolean;
          enforceVendor: boolean;
          vendorExceptions?: string[];
        }[];
      };
    };
  };
  ortbParams: {
    plcmt: number;
  };
};

export type DeliveryAdSchedule = {
  rules: DeliveryRules;
  schedule: DeliverySchedule[];
  bids: DeliveryBids;
  client: 'vast' | 'googima';
  vpaidmode?: 'enabled' | 'disabled' | 'insecure';
  adscheduleid: string;
};
