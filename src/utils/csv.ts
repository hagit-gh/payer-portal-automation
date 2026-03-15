import fs from "fs";
import { parse } from "csv-parse";

export interface Payer {
  payerId: string;
  taxId: string;
  portalUrl: string;
  username: string;
  password: string;
  defaultMinDelayMs?: string;
  defaultMaxConcurrency?: string;
}

// Function to read CSV and return all rows
export async function readPayers(csvPath: string): Promise<Payer[]> {
  return new Promise((resolve, reject) => {
    const results: Payer[] = [];
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row) => {
        results.push(row as Payer);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// Function to get a single payer by payerId + taxId
export async function getPayer(csvPath: string, payerId: string, taxId: string): Promise<Payer> {
  const payers = await readPayers(csvPath);
  const payer =  payers.find(p =>  p.payerId === payerId && p.taxId === taxId) || null;
  if (!payer) throw new Error("Payer not found");
  return payer
}