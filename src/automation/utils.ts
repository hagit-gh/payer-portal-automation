import { Browser, chromium, Page, Locator} from "playwright";
import { requestContext } from "../server";
import { delay } from "../utils/waiters";

let browser: Browser | null = null;

async function waitForAllElements(baseElement: Page | Locator, selector: string, timeout = 5000) {
    const startTime = Date.now();
    let prev = 0
    
    while (Date.now() - startTime < timeout) {
        const arr = await baseElement.locator(selector).all();
        if (arr.length > 0 && arr.length == prev) return
        prev = arr.length
        await delay(250); // Wait a short interval before checking again
    }
}

export async function findElementByTypeAndAttributes(baseElement: Page | Locator, selector: string, attribute: string, timeout = 5000) {

    await waitForAllElements(baseElement, selector, timeout);

    const elements: Locator[] = await baseElement.locator(selector).all();
    const elementsArray = []

    for (let el of elements) {
        const attrs = await el.evaluate(e => ({
            id: e.getAttribute("id"),
            name: e.getAttribute("name"),
            placeholder: e.getAttribute("placeholder"),
            testid: e.getAttribute("data-testid"),
            html_type: e.getAttribute("type"),
            class: e.getAttribute("class")
        }));

        const text = await el.innerText()
        const combined = Object.values(attrs)
            .filter(Boolean)
            .join(" ")
            .concat(` ${text}`);

        const regex = new RegExp(attribute.replace(/\s+/g, "\\s*"), "i");

        if (regex.test(combined) || attribute == "") {
            elementsArray.push(el)
        }
    }

    return elementsArray
}

export async function getBrowser() {
    if (!browser) {
        browser = await chromium.launch({ 
            headless: process.env.HEADLESS == "true", 
            downloadsPath: requestContext.getStore()?.get("downloadsPath")
         });
        console.log("Browser launched");
    }
    return browser;
}

export async function navigateToPortal(portalUrl: string): Promise<Page> {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(portalUrl, { waitUntil: 'load', timeout:100000})
    return page
}
