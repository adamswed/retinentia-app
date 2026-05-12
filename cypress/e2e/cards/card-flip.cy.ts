describe('Card Flip', () => {
  const TERM = 'Mitosis';

  before(() => {
    cy.login();
    cy.task('clearTestUserCards');
    cy.getCookie('firebaseAuthToken').then((c) => Cypress.env('_authToken', c?.value ?? ''));
    cy.getCookie('firebaseAuthRefreshToken').then((c) => Cypress.env('_refreshToken', c?.value ?? ''));
  });

  beforeEach(() => {
    cy.visit('/main');
  });

  it('flips the card to show the definition side', () => {
    cy.get('[data-cy="card-term-input"]').type(TERM);
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realClick();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should(
      'be.focused',
    );
    cy.get('[data-cy="definition-side-term"]')
      .first()
      .should('contain.text', TERM);
  });
});
