describe('Sign-in', () => {
  it('redirects to /main after signing in with valid credentials', () => {
    cy.login();
    cy.visit('/main');
    cy.url().should('include', '/main');
  });
});
