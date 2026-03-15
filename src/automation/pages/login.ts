import { Page } from "playwright";
import { findElementByTypeAndAttributes } from "../utils";

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
        return await findElementByTypeAndAttributes(this.page, "//button", "submit")
    }

}
