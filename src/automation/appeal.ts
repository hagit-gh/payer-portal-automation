import { Page } from "playwright"
import { getPayer } from "../utils/csv"
import { AppealPage } from "./pages/appeal"
import { login, openNewTab } from "./utils"


export async function runSendAppealFlow(csvFile: string, eobData: {
    payerId: string, claimId: string, taxId: string, dateTo: string, dateFrom: string, download: boolean, maxEobs: number, forceRedownload: boolean
}
) {

    const payer = await getPayer(csvFile, eobData.payerId, eobData.taxId)
    const page = await openNewTab(payer.portalUrl)

    const appealPageObject = new AppealPage(page)

    await login(page, payer.username, payer.password)
    await clickOnAppealTab(appealPageObject)
    await fillAppealForm(eobData.taxId, eobData.claimId)

}

async function clickOnAppealTab(appealPageObject: AppealPage){
    const appealTab = await appealPageObject.getAppealTab()
    await appealTab.click()
}

async function fillAppealForm(texId: string, claimId: string, ) {
    throw new Error("Function not implemented.")
}

