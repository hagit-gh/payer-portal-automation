import { Page } from "playwright";
import { findElementByTypeAndAttributes } from "../utils";

export class AppealPage {

    constructor(private page: Page) {
        this.page = page
    }

    async getAppealTab() {
        const elements = await findElementByTypeAndAttributes(this.page, "a", "appeal")
        return elements[0]
    }

    async getTexIdTextBox(){
        const elements = await findElementByTypeAndAttributes(this.page, "input", "tex")
        return elements[0]
    }

    async getClaimIdTextBox(){
        const elements = await findElementByTypeAndAttributes(this.page, "input", "claim")
        return elements[0]
    }

    async getAppealTypeSelector(){
        const elements = await findElementByTypeAndAttributes(this.page, "selector", "type")   
        return elements[0]
    }

    async getAttachFileElement(){
        const elements = await findElementByTypeAndAttributes(this.page, "input", "file")   
        return elements[0]
    }

}