import { testConfigs } from '@jwp/ott-testing/constants';

import { LoginContext } from '#utils/password_utils';
import constants from '#utils/constants';

Feature('Accessibility');

let paidLoginContext: LoginContext;

const disableRetryFailedStep = (test: { disableRetryFailedStep: boolean }): void => {
  test.disableRetryFailedStep = true;
};

// The tests currently need a short `I.wait()` to ensure the pages are fully loaded before
// performing the `checkA11y()` function. Ticket to improve this: https://videodock.atlassian.net/browse/OTT-1884

Scenario('WCAG compliant - Home Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/');
  I.waitForLoaderDone();
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Video Detail Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.wait(1.5);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Playlist Page', async ({ I }) => {
  await I.amOnPage('/p/dGSUzs9o/'); // "Films" page
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Video Detail Inline Page', async ({ I }) => {
  I.useConfig(testConfigs.inlinePlayer);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.wait(1.5);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Search Page with results', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/q/Caminandes');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Search Page containing no results', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/q/querywithoutresults');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Player Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny?r=dGSUzs9o&play=1');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Live Page (EPG)', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/p/fWpLtzVh/?channel=Uh7zcqVm/');
  I.wait(2);
  I.checkA11y(null, {
    ignore: [
      // It is a known issue that the EPG is not fully accessible due to the planby EPG package
      { id: 'scrollable-region-focusable', selector: '[class^="css-"]' },
    ],
  });
}).config(disableRetryFailedStep);

// Account Pages

Scenario('WCAG compliant - Account Page', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/u/my-account');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Payments Page', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/u/payments');
  I.waitForLoaderDone();
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Favorites Page', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/u/favorites');
  I.waitForLoaderDone();
  I.checkA11y();
}).config(disableRetryFailedStep);

// Modals

Scenario('WCAG compliant - Signup Modal - CLEENG', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);
  I.amOnPage('/?u=create-account');
  I.waitForLoaderDone();
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Sign in Modal - CLEENG', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);
  I.amOnPage('/?u=login');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Signup Modal - JWP', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/?u=create-account');
  I.waitForLoaderDone();
  I.checkA11y({
    rules: {
      // This rule is disabled because this component does have a label prop,
      // but is not set in the test configuration
      'label-title-only': {
        enabled: false,
      },
    },
  });
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Sign in Modal - JWP', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/?u=login');
  I.wait(1);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Choose Offer Modal', async ({ I }) => {
  I.useConfig(testConfigs.svod);
  paidLoginContext = await I.registerOrLogin(paidLoginContext);
  I.amOnPage(constants.offersUrl);

  I.wait(1.5);

  I.checkA11y();
}).config(disableRetryFailedStep);
