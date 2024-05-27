import { testConfigs } from '@jwp/ott-testing/constants';

Feature('accessbility');

const disableRetryFailedStep = (test: { disableRetryFailedStep: boolean }): void => {
  test.disableRetryFailedStep = true;
};

Scenario('Homepage WCAG compliant', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('Video detail page WCAG compliant', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.checkA11y();
}).config(disableRetryFailedStep);

Scenario('Playlist page WCAG compliant', async ({ I }) => {
  await I.amOnPage('/p/dGSUzs9o/'); // "Films" page
  I.checkA11y(null, {
    ignore: [
      // { selector: 'html', id: 'document-title' },
      // { id: 'aria-valid-attr-value', selector: '[role="gridcell"]' },
    ],
  });
}).config(disableRetryFailedStep);

Scenario('Video detail inline page WCAG compliant', async ({ I }) => {
  // Fails because of role="image" with aria-label
  I.useConfig(testConfigs.inlinePlayer);
  I.amOnPage('/m/awWEFyPu/big-buck-bunny');
  I.checkA11y();
}).config(disableRetryFailedStep);

// Scenario('Signup modal WCAG compliant', async ({ I }) => {
//   I.useConfig(testConfigs.jwpAuth);
//   I.amOnPage('/?u=create-account');
//   I.checkA11y();
// });

// Scenario('Signin modal WCAG compliant', async ({ I }) => {
//   I.useConfig(testConfigs.jwpAuth);
//   I.amOnPage('/?u=login');
//   I.checkA11y();
// });
