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
      cy.intercept('POST', '/api/consent').as('consent');
      cy.visit('/email-sign-in');
      cy.get('#email').type(Cypress.env('TEST_EMAIL'));
      cy.get('#password').type(Cypress.env('TEST_PASSWORD'), { log: false });
      cy.get('button[type="submit"]').click();
      cy.wait('@consent');
      cy.url().should('include', '/main');
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.request({ url: '/main', failOnStatusCode: false }).its('status').should('eq', 200);
      },
    }
  );
});
