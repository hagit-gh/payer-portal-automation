import { Locator, Page } from "playwright";
import { findElementByTypeAndAttributes } from "../utils";
import { expect } from "playwright/test";

export class AppealPage {

    constructor(private page: Page) {
        this.page = page
    }

    async getAppealTab() {
        const elements = await findElementByTypeAndAttributes(this.page, "a", "appeal")
        return elements[0]
    }

    async getTexIdTextBox() {
        const elements = await findElementByTypeAndAttributes(this.page, "input", "tex")
        return elements[0]
    }

    async getClaimIdTextBox() {
        const elements = await findElementByTypeAndAttributes(this.page, "input", "claim")
        return elements[0]
    }

    async getAppealTypeSelector() {
        const elements = await findElementByTypeAndAttributes(this.page, "//select", "type")
        return elements[0]
    }

    async getAppealReasonTextBox() {
        const elements = await findElementByTypeAndAttributes(this.page, "//textarea", "reason")
        return elements[0]
    }

    async getAttachFileElement() {
        const elements = await findElementByTypeAndAttributes(this.page, "//input", "file")
        return elements[0]
    }

    async getSubmitButton() {
        const elements = await findElementByTypeAndAttributes(this.page, "//button", "submit")
        return elements[0]
    }

    async getConfirmationBox() {
        const elements = await findElementByTypeAndAttributes(this.page, "//div", "confirmation")
        return elements[0]
    }
    async getConfirmationIdDiv() {
        const elements = await findElementByTypeAndAttributes(this.page, "//div", "id")
        return elements[0]
    }

    async clickOnAppealTab() {
        const appealTab = await this.getAppealTab()
        await appealTab.click()
    }

    async fillAppealForm(this: AppealPage, texId: string, claimId: string, type: string,
        appealReason: string, attachments: string[]
    ) {
        const texIdTextBox = await this.getTexIdTextBox()
        await texIdTextBox.fill(texId)

        const claimIdTextBox = await this.getClaimIdTextBox()
        await claimIdTextBox.fill(claimId)

        const reasonTextBox = await this.getAppealReasonTextBox()
        await reasonTextBox.fill(appealReason)

        const appealType = await this.getAppealTypeSelector()
        const value = await this.getAppealTypesOptions(appealType, type)
        await appealType.selectOption(value)


    }

    async getAppealTypesOptions(typeElement: Locator, option: string) {
        const options = await typeElement.allTextContents()
        if (options.includes(option)) return option
        return "Other"
    }

    async submitAppeal() {
        const button = await this.getSubmitButton()
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes('/appeal')),
            button.click()
        ]);
        
    }

    async waitForConfirmationPage() {
        const confirmationBox = await this.getConfirmationBox()
        await expect(confirmationBox).toBeVisible()
    }

    async getConfirmationId() {

        const regex = /(?:.*?:\s*)?([A-Za-z]+-\d+-\d+)/
        const confirmationIdDiv = await this.getConfirmationIdDiv()
        const text = await confirmationIdDiv.innerText()
        const match = text.match(regex)
        if (match) {
            return match[1]
        }
        throw new Error('Cant extract the confirmation id')
    }

}