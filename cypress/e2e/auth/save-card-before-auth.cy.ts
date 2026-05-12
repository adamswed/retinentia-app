export {};

const TERM = 'Osmosis';
const DEFINITION = 'Movement of water across a membrane';

describe('Save Card Before Auth', () => {
  before(() => {
    cy.task('clearTestUserCards');
    cy.visit('/welcome');
    cy.window().then(
      (win) =>
        new Cypress.Promise<void>((resolve) => {
          const req = win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        }),
    );
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('auto-saves a stored card after the user signs in', () => {
    // Fill in a card on /welcome as an unauthenticated user
    cy.visit('/welcome');
    cy.get('[data-cy="card-term-input"]').type(TERM);
    cy.get('[data-cy="card-flip-right"]').click();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realClick();
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should(($el) => {
      expect($el[0]).to.equal($el[0].ownerDocument.activeElement);
    });
    cy.get('[data-cy="card-definition-editor"] .ql-editor').realType(
      DEFINITION,
    );

    // Clicking Save with no auth calls storeCardData() in card-form.tsx:
    // validates the card, writes { term, definition } to localStorage['card'],
    // then calls router.push('/sign-in')
    cy.get('[data-cy="card-save-button"]').click({ force: true });
    cy.url().should('include', '/sign-in');

    // Click the email sign-in option — navigates to /email-sign-in
    cy.contains('Sign in').click();
    cy.url().should('include', '/email-sign-in');

    // Register intercepts before submitting so they catch their respective POSTs:
    // - consent fires when /main first loads after a successful login
    // - autoSave fires when checkIfCardIsStored reads localStorage and calls
    //   handleAddIndexCard in card-form.tsx
    cy.intercept('POST', '/api/consent').as('consent');
    cy.intercept('POST', '/main').as('autoSave');

    cy.get('#email').type(Cypress.env('TEST_EMAIL'));
    cy.get('#password').type(Cypress.env('TEST_PASSWORD'), { log: false });
    cy.get('button[type="submit"]').click();

    cy.wait('@consent');
    cy.wait('@autoSave');

    // Open the card list and verify the card was auto-saved
    cy.get('[data-cy="card-list-toggle"]').click();
    cy.get('[data-cy="card-term-input"][readonly]').should('have.value', TERM);
    cy.get('[data-cy="card-definition-editor"] .ql-editor').should(
      'contain.text',
      DEFINITION,
    );
  });
});
