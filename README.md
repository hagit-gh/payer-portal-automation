# Payer Portal Automation

Automation service that logs into payer portals and downloads EOB (Explanation of Benefits) documents using browser automation.

The service exposes an HTTP API that triggers an automation flow for a specific payer and returns the results of the run.

The automation is implemented using **Node.js**, **TypeScript**, and **Playwright**.

---

# Tech Stack

* Node.js
* TypeScript
* Playwright
* Express
* CSV parsing

---

# Prerequisites

Before running the project, make sure the following tools are installed.

### Node.js

Node.js version **18 or higher** is required.

Check if Node.js is installed:

```
node -v
```

If not installed, download it from:

https://nodejs.org

---

### npm

npm is installed automatically with Node.js.

Verify installation:

```
npm -v
```

---

# Installation

Clone the repository:

```
git clone https://github.com/hagit-gh/payer-portal-automation.git
```

Move into the project directory:

```
cd payer-portal-automation
```

Install project dependencies:

```
npm install
```

Install Playwright browsers:

```
npx playwright install
```

---

# Running the Server

Start the API server with:

```
npm run start:headed for headed mode (usually for debugging)
npm run start:headless for headless mode (usually for production)

```
The server will start locally at:

```
http://localhost:3000
```

---

# Example API Request

Example request to trigger an automation run:

```
curl -X POST http://localhost:3000/run \
-H "Content-Type: application/json" \
-d '{
  "payerId": "PAYER_001",
  "taxId": "12-3456789",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31",
  "maxEobs": 25,
  "download": true,
  "forceRedownload": false,
  "dedupe": {
    "mode": "eobId",
    "scope": "run"
  }
}'
```

---

# Project Structure

```
src/
  server.ts              API server
  automation/            Playwright automation flows
  utils/                 helper utilities

data/
  payer_targets.csv      payer configuration
```

---

# Useful Scripts

Start server

```
npm run start:headless
npm run start:headed

```

Compile TypeScript

```
npm run build
```

Install Playwright browsers

```
npm run playwright:install
```

---

# Notes

Each API request generates a unique `runId` used to track the automation run and downloaded files.

---

# Author

Created as part of a web automation assessment.
