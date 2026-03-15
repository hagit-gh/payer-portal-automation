import { getPayer } from "../utils/csv"
import { AppealPage } from "./pages/appeal"
import { navigateToPortal } from "./utils"
import { requestContext } from "../server"
import { LoginPageObject } from "./pages/login"


export async function runSendAppealFlow(csvFile: string, eobData: {
    payerId: string, claimId: string, taxId: string, type: string, reason: string, submit: boolean,
    attachments: string[]
}
) {

    const payer = await getPayer(csvFile, eobData.payerId, eobData.taxId)
    const page = await navigateToPortal(payer.portalUrl)

    const appealPageObject = new AppealPage(page)
    const loginPageObjects = new LoginPageObject(page)

    await loginPageObjects.login(payer.username, payer.password)
    await appealPageObject.clickOnAppealTab()
    await appealPageObject.fillAppealForm(eobData.taxId, eobData.claimId, eobData.type, eobData.reason, eobData.attachments)

    if (!eobData.submit){
        return {runStatus: "success"}
    }

    await appealPageObject.submitAppeal()
    await appealPageObject.waitForConfirmationPage()

    const confirmationId = await appealPageObject.getConfirmationId( )
    return {confirmationId: confirmationId}
}


export function generateAppealdata(runData: {}, reqData: {
    payerId: string, claimId: string, taxId: string, type: string, reason: string, submit: boolean,
    attachments: string[]
}){
    
    let results: { runId: string, claimId: string, type: string, payerId: string, taxId: string, reason: string } = {
        runId: "",
        claimId: reqData.claimId,
        type: reqData.type,
        payerId: reqData.payerId,
        taxId: reqData.taxId,
        reason: reqData.reason
    }

    results.runId = requestContext.getStore()?.get("runId")
    return { ...results, ...runData }
}



