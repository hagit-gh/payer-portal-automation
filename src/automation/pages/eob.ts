import { Locator, Page } from "playwright"
import { findElementByTypeAndAttributes } from "../utils"

export  class EobPage {

    constructor(private page: Page) {
        this.page = page
    }

    async getEOBTab(){
        const elements =  await findElementByTypeAndAttributes(this.page, "a", "eob")
        return elements[0]
    }

    async getTaxIdTextBox(){
        const elements =  await findElementByTypeAndAttributes(this.page, "//input", "tax")
        return elements[0]
    }

    async getDateFromTextBox(){
        const elements = await findElementByTypeAndAttributes(this.page, "//input", "date-from")
        return elements[0]
    }

    async getDateToTextBox(){
        const elements = await findElementByTypeAndAttributes(this.page, "//input", "date-to")
        return elements[0]
    }

    async getSearchButton(){
        const elements =  await findElementByTypeAndAttributes(this.page, "//button", "submit")
        return elements[0]
    }

    async getEBOsRows() {
        return await findElementByTypeAndAttributes(this.page,"//table//tbody//tr", "")
    }

    async getEBOsTableTitles(){
        return await findElementByTypeAndAttributes(this.page, "//table//th", "")
    }

    async getEBOsTableCells(row: Locator) {
        return await row.locator("//td").all()
    }

    async getDownloadEOBButton(row: Locator) {
        const elements =  await findElementByTypeAndAttributes(row, "//td", "download")
        return elements[0]
    }

}