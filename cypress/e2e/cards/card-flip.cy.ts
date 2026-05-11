describe('Card Flip', () => {
  const TERM = 'Mitosis';
  beforeEach(() => {
    cy.task('clearTestUserCards');
    cy.login();
    cy.visit('/main');
  });

  it('flips the card to show the definition side', () => {
    cy.get('[data-cy="card-term-input"]').type(TERM);
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realClick();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should('be.focused');
    cy.get('[data-cy="definition-side-term"]').first().should('contain.text', TERM);
  });
});
