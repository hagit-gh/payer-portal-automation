import { navigateToPortal, login } from "./utils";
import { getPayer } from "../utils/csv";
import { requestContext } from "../server";
import { EobPage } from "./pages/eob";

export async function runGetEobData(csvFile: string, eobData: {
   payerId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload:boolean 
}
) {

   const payer = await getPayer(csvFile, eobData.payerId, eobData.taxId)

   const page =  await navigateToPortal(payer.portalUrl)
   const eobPageObject = new EobPage(page)

   await login(page, payer.username, payer.password)
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
        dateFrom: "",
        dateTo: "",
        payerId: "",
        taxId: ""
    }

    results.runId = requestContext.getStore()?.get("runId")
    results.dateFrom = reqData.dateFrom
    results.dateTo = reqData.dateTo
    results.payerId = reqData.payerId
    results.taxId = reqData.taxId

    return { ...results, ...EOBResults }
}