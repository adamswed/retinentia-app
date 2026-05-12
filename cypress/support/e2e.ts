import './commands';
import 'cypress-real-events';

beforeEach(() => {
  const authToken: string = Cypress.env('_authToken') ?? '';
  const refreshToken: string = Cypress.env('_refreshToken') ?? '';
  if (authToken) {
    cy.setCookie('firebaseAuthToken', authToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      domain: 'localhost',
    });
  }
  if (refreshToken) {
    cy.setCookie('firebaseAuthRefreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      domain: 'localhost',
    });
  }
});
