import { testConfigs } from '@jwp/ott-testing/constants';
import passwordUtils, { LoginContext } from '#utils/password_utils';

Feature('Accessibility');

const disableRetryFailedStep = (test: { disableRetryFailedStep: boolean }): void => {
  test.disableRetryFailedStep = true;
};

function waitForEpgAnimation(I: CodeceptJS.I, sec: number = 1) {
  I.waitForLoaderDone();
  return I.wait(sec);
}

Scenario('WCAG compliant - Home Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Video Detail Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Playlist Page', async ({ I }) => {
  await I.amOnPage('/p/dGSUzs9o/'); // "Films" page
  I.checkA11y(null, {
    ignore: [
      { id: 'document-title', selector: 'html' },
      { id: 'aria-valid-attr-value', selector: '[role="gridcell"]' },
    ],
  });
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Video Detail Inline Page', async ({ I }) => {
  I.useConfig(testConfigs.inlinePlayer);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Search Page with results', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/q/Caminandes');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Search Page containing no results', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/q/querywithoutresults');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Player Page', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny?r=dGSUzs9o&play=1');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Live Page (EPG)', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/p/fWpLtzVh/?channel=Uh7zcqVm/');
  waitForEpgAnimation(I);
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
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Payments Page', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/u/payments');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Favorites Page', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/u/favorites');
  I.checkA11y();
}).config(disableRetryFailedStep);

// Modals

Scenario('WCAG compliant - Signup Modal - CLEENG', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);
  I.amOnPage('/?u=create-account');
  I.wait(0.3); // we need to wait for the modal to be fully loaded (I.seeElement was not sufficient)
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Sign in Modal - CLEENG', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);
  I.amOnPage('/?u=login');
  I.wait(0.3);
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Signup Modal - JWP', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/?u=create-account');
  I.wait(0.3);
  I.checkA11y({
    ignore: [
      // All form elements have an associated label.
      // Custom fields may lack labels if they are not provided. Therefore we need this ignore
      { id: 'label-title-only', selector: '[data-testid="crsf-input"] input' },
    ],
  });
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Sign in Modal - JWP', async ({ I }) => {
  I.useConfig(testConfigs.jwpAuth);
  I.amOnPage('/?u=login');
  I.wait(0.3);
  I.checkA11y();
}).config(disableRetryFailedStep);

const loginContext: LoginContext = {
  email: passwordUtils.createRandomEmail(),
  password: passwordUtils.createRandomPassword(),
};

Scenario.skip('WCAG compliant - Choose Offer Modal', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvod);
  I.amOnPage('/?u=create-account');

  await I.fillRegisterForm(loginContext);
  I.wait(10);
  I.seeElement('[role="dialog"]');

  I.checkA11y({
    ignore: [
      // We are of the opinion that a heading 2 is descriptive enough for the Dialogs and think that
      // adding an aria-label etc, is redundant
      { id: 'aria-dialog-name', selector: 'div[role="dialog"]' }
    ],
  });
}).config(disableRetryFailedStep);

