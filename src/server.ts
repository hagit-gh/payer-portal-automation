import express, { type Request, type Response } from "express";
import { runGetEobData } from "./automation/eob";
import { generateAppealdata, runSendAppealFlow } from "./automation/appeal";
import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "async_hooks";
import { generateEOBResponse } from "./automation/eob";

export const requestContext = new AsyncLocalStorage<Map<string, any>>();
export const ROOT_DIR = process.cwd();

const PORT = 3000;
const CSV_PAYERS_DATA_PATH = `${ROOT_DIR}\\data\\payer_targets.csv`

const app = express();
app.use(express.json()); 

app.use((req, res, next) => {
    const store = new Map();
    const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().substring(0, 4).toUpperCase()}`
    store.set("runId", runId);
    store.set("downloadsPath", `${ROOT_DIR}\\artifacts\\${runId}`);

    requestContext.run(store, () => {
        next();
    });
});

// Endpoint 1: Retrieve EOBs
app.post("/api/payer/eobs", async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const results = await runGetEobData(CSV_PAYERS_DATA_PATH, data);
        res.setHeader("Content-Type", "application/json");
        res.json(generateEOBResponse(results, data));
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Endpoint 2: Submit Appeal
app.post("/api/payer/submit-appeal", async (req: Request, res: Response) => {
    try {
        const data = req.body; // { payerId, taxId, claimId, appealType, attachments, submit, ... }
        const result = await runSendAppealFlow(CSV_PAYERS_DATA_PATH, data);
        res.setHeader("Content-Type", "application/json");
        res.json(generateAppealdata(result, data));
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


