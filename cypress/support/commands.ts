export {};

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.session(
    Cypress.env('TEST_EMAIL'),
    () => {
      cy.visit('/email-sign-in');
      cy.get('#email').type(Cypress.env('TEST_EMAIL'));
      cy.get('#password').type(Cypress.env('TEST_PASSWORD'), { log: false });
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/main');
    },
    { cacheAcrossSpecs: true }
  );
});
