import { browser, by, element } from 'protractor';

describe('Login', () => {
  beforeEach(() => {
    browser.get('/');
  });

  it('should display the login form', () => {
    expect(element(by.css('form')).isPresent()).toBeTrue();
  });

  it('should allow a user to log in with valid credentials', async () => {
    const emailInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const submitButton = element(by.css('button[type="submit"]'));

    await emailInput.sendKeys('test@test.test');
    await passwordInput.sendKeys('123456789');
    await submitButton.click();

    const h1Title = element(by.css('h3'));
    const titleText = await h1Title.getText();
    expect(titleText).toEqual('Vítejte v aplikaci GPX Web editor.');
  });

  it('should show an error message with invalid credentials', async () => {
    const emailInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const submitButton = element(by.css('button[type="submit"]'));

    await emailInput.sendKeys('test@test.test');
    await passwordInput.sendKeys('wrong');
    await submitButton.click();

    const errorMessage = element(by.css('.alert'));
    expect(errorMessage.isPresent()).toBeTrue();
  });
});
