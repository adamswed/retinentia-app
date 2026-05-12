export {};

const TERM = 'Apple';

describe.skip('AI Definition Quota Limit', () => {
  before(() => {
    cy.task('clearTestUserCards');
    cy.task('setAIQuotaToLimit');
    cy.login();
    cy.getCookie('firebaseAuthToken').then((c) => Cypress.env('_authToken', c?.value ?? ''));
    cy.getCookie('firebaseAuthRefreshToken').then((c) => Cypress.env('_refreshToken', c?.value ?? ''));
  });

  beforeEach(() => {
    cy.visit('/main');
  });

  it('shows the daily quota limit message when the AI definition limit is reached', () => {
    cy.get('[data-cy="card-term-input"]').type(TERM);
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="definition-side-term-icon-lookup"]').click({force: true});
    cy.get('[class*="ai_definition_container"]', { timeout: 15000 })
      .should('contain.text', 'You have reached your daily limit of AI definitions.');
  });
});
