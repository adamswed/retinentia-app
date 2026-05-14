export {};

const QUOTA_TERMS = ['Apple', 'Banana', 'Cherry'];

describe('AI Definition Quota Limit', () => {
  before(() => {
    cy.task('clearTestUserCards');
    cy.task('resetAIQuota');
    cy.login();
    cy.getCookie('firebaseAuthToken').then((c) =>
      Cypress.env('_authToken', c?.value ?? ''),
    );
    cy.getCookie('firebaseAuthRefreshToken').then((c) =>
      Cypress.env('_refreshToken', c?.value ?? ''),
    );
  });

  beforeEach(() => {
    cy.visit('/main');
  });

  it('shows the daily quota limit message when the AI definition limit is reached', () => {
    // Exhaust the AI quota with 3 lookups using the seeded card terms.
    // We type each term into the new-card input rather than navigating the list
    // because read-only list cards do not expose [data-cy="card-flip-right"].
    QUOTA_TERMS.forEach((term, index) => {
      if (index > 0) cy.visit('/main');

      cy.get('[data-cy="card-term-input"]').type(term);
      cy.get('[data-cy="card-flip-right"]').click();
      cy.get('[data-cy="definition-side-term-icon-lookup"]').click({
        force: true,
      });
      cy.get('[data-cy="ai-definition-result"]', { timeout: 20000 }).should(
        'exist',
      );
    });

    // 4th lookup: quota is now exhausted
    cy.visit('/main');
    cy.get('[data-cy="card-term-input"]').type('Mango');
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="definition-side-term-icon-lookup"]').click({
      force: true,
    });
    cy.get('[data-cy="ai-definition-result"]', { timeout: 20000 }).should(
      'contain.text',
      'You have reached your daily limit of AI definitions.',
    );
  });
});
