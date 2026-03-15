import { Locator, Page } from "playwright"
import { findElementByTypeAndAttributes } from "../utils"
import { requestContext } from "../../server"
import fs from "fs";

export  class EobPage {

    constructor(private page: Page) {
        this.page = page
    }

    async getEOBTab(){
        const elements =  await findElementByTypeAndAttributes(this.page, "//a", "eob")
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


    async clickOnEobTab() { 
        const EOBTab = await this.getEOBTab()
        await EOBTab.click()
    }
    
    async searchEob(dateStart: string, dateEnd: string, taxId: string) {
    
        const taxIDElement = await this.getTaxIdTextBox()
        await taxIDElement.fill(taxId)
    
        const dateStartElement = await this.getDateFromTextBox()
        await dateStartElement.fill(dateStart)
    
        const dateEndElement = await this.getDateToTextBox()
        await dateEndElement.fill(dateEnd)
    
        const submitButton = await this.getSearchButton()
        await submitButton.click()
    
        this.page.waitForLoadState("load")
    
    }
    
    async EBOsDataProcessing(
        maximumPdf: number,
        download: boolean,
        forceDownload: boolean
    ) {
    
        const rows = await this.getEBOsRows()
        const titles = await this.getEBOsTableTitles()
    
        let downloadsCount = 0
        const results: any[] = []
    
        for (let i = 0; i < rows.length && downloadsCount < maximumPdf; i++) {
    
            const result = await this.processRow(
                rows[i],
                titles,
                download,
                forceDownload
            )
    
            if (result.downloaded) {
                downloadsCount++
            }
    
            results.push(result.data)
        }
    
        return {
            EOBSCount: rows.length,
            EOBSDownloaded: downloadsCount,
            items: results
        }
    }
    
    
    async processRow(
        row: Locator,
        titles: Locator[],
        download: boolean,
        forceDownload: boolean
    ) {
    
        const cells = await this.getEBOsTableCells(row)
        const eobId = (await cells[0].innerText()).trim()
    
        const path = `${requestContext.getStore()?.get("downloadsPath")}\\${eobId}.pdf`
    
        let downloaded = false
    
        if (download && (forceDownload || !fs.existsSync(path))) {
            await this.downloadFile(row, path)
            downloaded = true
        }
    
        const data = await this.extractRowData(cells, titles)
        data["EOBPath"] = path
    
        return { downloaded, data }
    }
    
    async downloadFile(row: Locator, path: string) {
    
        const downloadButton = await this.getDownloadEOBButton(row)
    
        const [file] = await Promise.all([
            this.page.waitForEvent("download"),
            downloadButton.click()
        ])
    
        await file.saveAs(path)
        await file.delete()
    }
    
    async extractRowData(cells: Locator[], titles: Locator[]) {
    
        const details: any = {}
    
        for (let i = 0; i < cells.length; i++) {
    
            const title = (await titles[i].innerText()).trim()
    
            if (!title.toLowerCase().includes("action")) {
                const value = (await cells[i].innerText()).trim()
                details[title] = value
            }
        }
    
        return details
    }
    
}