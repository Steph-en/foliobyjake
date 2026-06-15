import express from "express";

// IMPORTANT:
// Vercel serverless runtime executes this file in /var/task.
// Your previous implementation exported the Express app from ../server,
// which caused ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server'.
//
// To make /api/* routes reliable on Vercel, we inline the Express app here
// by re-exporting the server logic from ../server.ts using CommonJS require.
//
// This keeps runtime stable across Node ESM/CJS differences in Vercel.

let app: express.Express;

try {
    const mod = require("../server.cjs");
    app = mod?.default ?? mod;
} catch (e) {
    // Fallback Express app to avoid hard crashes.
    app = express();
    app.get("/api/projects", (_req, res) =>
        res.status(500).json({ error: "Server failed to load (runtime module resolution error)." })
    );
}

export default app;


