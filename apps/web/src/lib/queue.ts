import { Queue } from "bullmq";

let _publishQueue: Queue | null = null;
let _insightsQueue: Queue | null = null;
let _audienceQueue: Queue | null = null;
let _competitorsQueue: Queue | null = null;
let _reportQueue: Queue | null = null;

function getConnection() {
  return {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
}

function createQueue(name: string): Queue {
  return new Queue(name, { connection: getConnection() });
}

export function getPublishQueue() {
  if (!_publishQueue) _publishQueue = createQueue("publish-scheduled");
  return _publishQueue;
}

export function getInsightsQueue() {
  if (!_insightsQueue) _insightsQueue = createQueue("sync-insights");
  return _insightsQueue;
}

export function getAudienceQueue() {
  if (!_audienceQueue) _audienceQueue = createQueue("sync-audience");
  return _audienceQueue;
}

export function getCompetitorsQueue() {
  if (!_competitorsQueue) _competitorsQueue = createQueue("sync-competitors");
  return _competitorsQueue;
}

export function getReportQueue() {
  if (!_reportQueue) _reportQueue = createQueue("generate-report");
  return _reportQueue;
}

type QueueAddArgs = Parameters<Queue["add"]>;

function queueProxy(getQueue: () => Queue) {
  return {
    add: (...args: QueueAddArgs) => getQueue().add(...args),
  };
}

export const publishQueue = queueProxy(getPublishQueue);
export const insightsQueue = queueProxy(getInsightsQueue);
export const audienceQueue = queueProxy(getAudienceQueue);
export const competitorsQueue = queueProxy(getCompetitorsQueue);
export const reportQueue = queueProxy(getReportQueue);
