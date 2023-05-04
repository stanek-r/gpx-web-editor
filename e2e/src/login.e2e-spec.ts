import { browser, by, element } from 'protractor';

describe('Login', () => {
  beforeEach(() => {
    browser.get('/');
  });

  it('should display the login form', () => {
    expect(element(by.css('form')).isPresent()).toBeTrue();
  });

  it('should allow a user to log in with valid credentials', async () => {
    const usernameInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const submitButton = element(by.css('button[type="submit"]'));

    await usernameInput.sendKeys('test@test.test');
    await passwordInput.sendKeys('123456789');
    await submitButton.click();

    const errorMessage = element(by.css('.alert'));
    expect(errorMessage.isPresent()).toBeFalse();
  });

  it('should show an error message with invalid credentials', async () => {
    const usernameInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const submitButton = element(by.css('button[type="submit"]'));

    await usernameInput.sendKeys('wrong-username');
    await passwordInput.sendKeys('wrong-password');
    await submitButton.click();

    const errorMessage = element(by.css('.alert'));
    expect(errorMessage.isPresent()).toBeTrue();
  });
});
