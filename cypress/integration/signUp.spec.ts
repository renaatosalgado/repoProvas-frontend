/// <reference types="cypress" />

describe("Sign-up", () => {
  it("should create new user sucessfully", () => {
    cy.visit("http://localhost:3000");

    cy.get("input[name=email]").type("legal@gmail.com");
    cy.get("input[name=password]").type("123456");
    cy.get("input[name=passwordConfirmation]").type("123456");
    cy.get("button[type=submit]").click();

    cy.url().should("equal", "http://localhost:3000/login")
  });
});
