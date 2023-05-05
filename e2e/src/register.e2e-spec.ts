import { browser, by, element } from 'protractor';

describe('Register', () => {
  beforeEach(async () => {
    browser.get('/');
    const submitButton = element(by.css('.btn-secondary'));
    await submitButton.click();
  });

  it('should display the register form', async () => {
    expect(element(by.css('form')).isPresent()).toBeTrue();
  });

  it('should allow a user to register with valid credentials', async () => {
    const emailInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const passwordInput2 = element(by.css('.register-password-repeat'));
    const submitButton = element(by.css('button[type="submit"]'));

    await emailInput.sendKeys('test2@test.test');
    await passwordInput.sendKeys('123456789');
    await passwordInput2.sendKeys('123456789');
    await submitButton.click();

    const h1Title = element(by.css('h1'));
    const titleText = await h1Title.getText();
    expect(titleText).toEqual('Čekání na verifikaci emailové adresy');
  });

  it('should show an error message with email that already exists', async () => {
    const emailInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const passwordInput2 = element(by.css('.register-password-repeat'));
    const submitButton = element(by.css('button[type="submit"]'));

    await emailInput.sendKeys('test@test.test');
    await passwordInput.sendKeys('123456789');
    await passwordInput2.sendKeys('123456789');
    await submitButton.click();

    const errorMessage = element(by.css('.alert'));
    expect(errorMessage.isPresent()).toBeTrue();
  });

  it('should show an error message with different passwords', async () => {
    const emailInput = element(by.css('input[type="text"]'));
    const passwordInput = element(by.css('input[type="password"]'));
    const passwordInput2 = element(by.css('.register-password-repeat'));
    const submitButton = element(by.css('button[type="submit"]'));

    await emailInput.sendKeys('test@test.test');
    await passwordInput.sendKeys('wrong');
    await passwordInput2.sendKeys('wrong-again');
    await submitButton.click();

    const errorMessage = element(by.css('.alert'));
    expect(errorMessage.isPresent()).toBeTrue();
  });
});
