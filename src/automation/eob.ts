import { openNewTab, login } from "./utils";
import { getPayer } from "../utils/csv";
import { Locator, Page } from "playwright";
import { requestContext } from "../server";
import fs from "fs";
import { EobPage } from "./pages/eob";

export async function runGetEobData(csvFile: string, eobData: {
   payerId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload:boolean 
}
) {

   const payer = await getPayer(csvFile, eobData.payerId, eobData.taxId)

   const page =  await openNewTab(payer.portalUrl)
   const eobPageObject = new EobPage(page)

   await login(page, payer.username, payer.password)
   await clickOnEobTab(eobPageObject)
   await searchEob(page, eobPageObject, eobData.dateFrom, eobData.dateTo, eobData.taxId)
   const pdfDownloadedData = await EBOsDataProcessing(page, eobPageObject, eobData.maxEobs, eobData.download, eobData.forceRedownload)
   return pdfDownloadedData
}

export async function clickOnEobTab(eobPageObject: EobPage) { 
    const EOBTab = await eobPageObject.getEOBTab()
    await EOBTab.click()
}

export async function searchEob(page: Page, eobPageObject: EobPage, dateStart: string, dateEnd: string, taxId: string) {

    const taxIDElement = await eobPageObject.getTaxIdTextBox()
    await taxIDElement.fill(taxId)

    const dateStartElement = await eobPageObject.getDateFromTextBox()
    await dateStartElement.fill(dateStart)

    const dateEndElement = await eobPageObject.getDateToTextBox()
    await dateEndElement.fill(dateEnd)

    const submitButton = await eobPageObject.getSearchButton()
    await submitButton.click()

    page.waitForLoadState("load")

}

export async function EBOsDataProcessing(
    page: Page,
    eobPageObject:EobPage,
    maximumPdf: number,
    download: boolean,
    forceDownload: boolean
) {

    const rows = await eobPageObject.getEBOsRows()
    const titles = await eobPageObject.getEBOsTableTitles()

    let downloadsCount = 0
    const results: any[] = []

    for (let i = 0; i < rows.length && downloadsCount < maximumPdf; i++) {

        const result = await processRow(
            page,
            eobPageObject,
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


async function processRow(
    page: Page,
    eobPageObject: EobPage,
    row: Locator,
    titles: Locator[],
    download: boolean,
    forceDownload: boolean
) {

    const cells = await eobPageObject.getEBOsTableCells(row)
    const eobId = (await cells[0].innerText()).trim()

    const path = `${requestContext.getStore()?.get("downloadsPath")}\\${eobId}.pdf`

    let downloaded = false

    if (download && (forceDownload || !fs.existsSync(path))) {
        await downloadFile(page, eobPageObject, row, path)
        downloaded = true
    }

    const data = await extractRowData(cells, titles)
    data["EOBPath"] = path

    return { downloaded, data }
}

async function downloadFile(page: Page, eobPage: EobPage, row: Locator, path: string) {

    const downloadButton = await eobPage.getDownloadEOBButton(row)

    const [file] = await Promise.all([
        page.waitForEvent("download"),
        downloadButton.click()
    ])

    await file.saveAs(path)
    await file.delete()
}

async function extractRowData(cells: Locator[], titles: Locator[]) {

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

export function generateEOBResponse(EOBResults: {}, reqData: {
    payerId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload: boolean
}) {

    let results: { runId: string, dateFrom: string, dateTo: string, payerId: string, taxId: string } = {
        runId: "",
        dateFrom: "",
        dateTo: "",
        payerId: "",
        taxId: ""
    }

    results.runId = requestContext.getStore()?.get("runId")
    results.dateFrom = reqData["dateFrom"]
    results.dateTo = reqData["dateTo"]
    results.payerId = reqData["payerId"]
    results.taxId = reqData["taxId"]

    return { ...results, ...EOBResults }
}