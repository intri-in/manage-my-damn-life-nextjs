describe('template spec', () => {
  it('passes', () => {
    cy.request('api/install/check').as('todoRequest');
  })
})