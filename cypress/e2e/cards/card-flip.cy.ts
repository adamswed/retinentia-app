let authToken = '';
let refreshToken = '';

describe('Card Flip', () => {
  const TERM = 'Mitosis';

  before(() => {
    cy.task('clearTestUserCards');
    cy.login();
    cy.getCookie('firebaseAuthToken').then((c) => {
      authToken = c?.value ?? '';
    });
    cy.getCookie('firebaseAuthRefreshToken').then((c) => {
      refreshToken = c?.value ?? '';
    });
  });

  beforeEach(() => {
    cy.setCookie('firebaseAuthToken', authToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      domain: 'localhost',
    });
    cy.setCookie('firebaseAuthRefreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      path: '/',
      sameSite: 'lax',
      domain: 'localhost',
    });
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
