import { Page } from "playwright";
import { findElementByTypeAndAttributes } from "../utils";
import { expect } from "playwright/test";

export class LoginPageObject{

    constructor(private page: Page) {
        this.page = page
    }

    async getUserNameTextBox() {
        const element = await findElementByTypeAndAttributes(this.page, "//input", "username", 120000)
        return element[0]
    }

    async getPasswordTextBox() {
        const elements = await findElementByTypeAndAttributes(this.page, "//input", "password", 120000)
        return elements[0]
    }

    async getLoginButton(){
        const elements =  await findElementByTypeAndAttributes(this.page, "//button", "submit")
        return elements[0]
    }

    async login(userName: string, password: string) {
    
        const userNameElement = await this.getUserNameTextBox()
        
        await expect(userNameElement).toBeEditable()
        await userNameElement.fill(userName);
    
        const passwordElement = await this.getPasswordTextBox()
        await expect(passwordElement).toBeEditable()
        await passwordElement.fill(password);
    
        const loginButton = await this.getLoginButton()
        await loginButton.click()
    
    }
}
