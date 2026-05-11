const TERM = 'Photosynthesis';
const DEFINITION = 'The process by which plants convert sunlight into energy';
const UPDATED_TERM = 'Photosynthesis II';

describe.skip('Card CRUD', () => {
  before(() => {
    cy.task('clearTestUserCards');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/main');
  });

  it('creates a card and verifies it appears in the list', () => {
    cy.intercept('POST', '/main').as('cardSave');
    cy.get('[data-cy="card-term-input"]').type(TERM);
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realClick();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should('be.focused');
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realType(DEFINITION);
    cy.get('[data-cy="card-save-button"]').realClick();
    cy.wait('@cardSave');

    cy.get('[data-cy="card-list-toggle"]').click();
    cy.get('[data-cy="card-term-input"][readonly]').should('have.value', TERM);
  });

  it('edits the card term and verifies the update is visible', () => {
    cy.intercept('POST', '/main').as('cardListLoad');
    cy.get('[data-cy="card-list-toggle"]').click();
    cy.wait('@cardListLoad');
    cy.get('[data-cy="card-edit-button"]').first().click();
    cy.get('[data-cy="card-term-input"]')
      .filter((_, el) => (el as HTMLInputElement).value === TERM)
      .clear()
      .type(UPDATED_TERM);
    cy.get('[data-cy="card-flip-right"]').first().click();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realClick();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should('be.focused');
    cy.intercept('POST', '/main').as('cardUpdate');
    cy.contains('[data-cy="card-save-button"]', 'Update').realClick();
    cy.wait('@cardUpdate');

    cy.get('[data-cy="card-term-input"][readonly]').should('have.value', UPDATED_TERM);
  });

  it('deletes the card and verifies it is removed', () => {
    cy.intercept('POST', '/main').as('cardListLoad');
    cy.get('[data-cy="card-list-toggle"]').click();
    cy.wait('@cardListLoad');
    cy.get('[data-cy="card-delete-button"]').first().click();
    cy.intercept('POST', '/main').as('cardDelete');
    cy.get('[data-cy="modal-delete-confirm"]').click();
    cy.wait('@cardDelete');

    cy.get('[data-cy="card-term-input"][readonly]').should('not.exist');
  });
});
