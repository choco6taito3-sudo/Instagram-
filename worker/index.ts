import "dotenv/config";
import { Worker } from "bullmq";
import { processPublishScheduled } from "./jobs/publish-scheduled";
import { processSyncInsights } from "./jobs/sync-insights";
import { processSyncAudience } from "./jobs/sync-audience";
import { processSyncCompetitors } from "./jobs/sync-competitors";
import { processGenerateReport } from "./jobs/generate-report";

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetriesPerRequest: null,
};

const queueNames = [
  "sync-insights",
  "sync-audience",
  "publish-scheduled",
  "sync-competitors",
  "generate-report",
] as const;

const workers = [
  new Worker("sync-insights", processSyncInsights, { connection }),
  new Worker("sync-audience", processSyncAudience, { connection }),
  new Worker("publish-scheduled", processPublishScheduled, { connection }),
  new Worker("sync-competitors", processSyncCompetitors, { connection }),
  new Worker("generate-report", processGenerateReport, { connection }),
];

workers.forEach((w) => {
  w.on("completed", (job) =>
    console.log(`[${job.queueName}] completed: ${job.id}`)
  );
  w.on("failed", (job, err) =>
    console.error(`[${job?.queueName}] failed: ${job?.id}`, err.message)
  );
});

console.log(`Worker started. Listening on queues: ${queueNames.join(", ")}`);
