import { navigateToPortal } from "./utils";
import { getPayer } from "../utils/csv";
import { requestContext } from "../server";
import { EobPage } from "./pages/eob";
import { LoginPageObject } from "./pages/login";

export async function runGetEobData(csvFile: string, eobData: {
    payerId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload: boolean
}
) {

    const payer = await getPayer(csvFile, eobData.payerId, eobData.taxId)

    const page = await navigateToPortal(payer.portalUrl)
    const eobPageObject = new EobPage(page)
    const loginPageObjects = new LoginPageObject(page)

    await loginPageObjects.login(payer.username, payer.password)
    await eobPageObject.clickOnEobTab()
    await eobPageObject.searchEob(eobData.dateFrom, eobData.dateTo, eobData.taxId)
    const pdfDownloadedData = await eobPageObject.EBOsDataProcessing(eobData.maxEobs, eobData.download, eobData.forceRedownload)
    return pdfDownloadedData
}

export function generateEOBResponse(EOBResults: {}, reqData: {
    payerId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload: boolean
}) {

    let results: { runId: string, dateFrom: string, dateTo: string, payerId: string, taxId: string } = {
        runId: "",
        dateFrom: reqData.dateFrom,
        dateTo: reqData.dateTo,
        payerId: reqData.payerId,
        taxId: reqData.taxId
    }

    results.runId = requestContext.getStore()?.get("runId")
    return { ...results, ...EOBResults }
}