import { testConfigs } from '@jwp/ott-testing/constants';

Feature('Accessibility');

const disableRetryFailedStep = (test: { disableRetryFailedStep: boolean }): void => {
  test.disableRetryFailedStep = true;
};

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
      // { selector: 'html', id: 'document-title' },
      // { id: 'aria-valid-attr-value', selector: '[role="gridcell"]' },
    ],
  });
}).config(disableRetryFailedStep);

Scenario('WCAG compliant - Video Detail Inline Page', async ({ I }) => {
  // Fails because of role="image" with aria-label
  I.useConfig(testConfigs.inlinePlayer);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.checkA11y();
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

// Scenario('Signup - Modal - WCAG compliant', async ({ I }) => {
//   I.useConfig(testConfigs.jwpAuth);
//   I.amOnPage('/?u=create-account');
//   I.checkA11y();
// });

// Scenario('Signin modal WCAG compliant', async ({ I }) => {
//   I.useConfig(testConfigs.jwpAuth);
//   I.amOnPage('/?u=login');
//   I.checkA11y();
// });
