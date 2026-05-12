export {};

const QUOTA_TERMS = ['Apple', 'Banana', 'Cherry'];

describe('AI Definition Quota Limit', () => {
  before(() => {
    cy.task('clearTestUserCards');
    cy.task('resetAIQuota');
    QUOTA_TERMS.forEach((term) => {
      cy.task('seedTestCard', { term, definition: '' });
    });
    cy.login();
    cy.getCookie('firebaseAuthToken').then((c) => Cypress.env('_authToken', c?.value ?? ''));
    cy.getCookie('firebaseAuthRefreshToken').then((c) => Cypress.env('_refreshToken', c?.value ?? ''));
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
      cy.get('[data-cy="definition-side-term-icon-lookup"]').click({ force: true });

      // definition_section only renders once aiDefinition is set — not during the
      // skeleton/loading state — so this wait resolves only after Vertex AI responds
      // and the quota counter has been written to Firestore.
      cy.get('[class*="ai_definition_container"] [class*="definition_section"]', { timeout: 20000 })
        .should('exist');
    });

    // 4th lookup: quota is now exhausted
    cy.visit('/main');
    cy.get('[data-cy="card-term-input"]').type('Mango');
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="definition-side-term-icon-lookup"]').click({ force: true });
    cy.get('[class*="ai_definition_container"]', { timeout: 15000 })
      .should('contain.text', 'You have reached your daily limit of AI definitions.');
  });
});
