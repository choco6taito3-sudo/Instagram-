import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { InstagramClient } from "@instagram-ops/sdk";

const prisma = new PrismaClient();

async function waitForContainer(client: InstagramClient, containerId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const { status_code } = await client.getContainerStatus(containerId);
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR") throw new Error("Media container processing failed");
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error("Media container processing timed out");
}

export async function processPublishScheduled(job: Job<{ postId: string }>) {
  const post = await prisma.scheduledPost.findUnique({
    where: { id: job.data.postId },
    include: { account: true, hashtagSet: true },
  });

  if (!post || post.status !== "pending") return;

  await prisma.scheduledPost.update({
    where: { id: post.id },
    data: { status: "processing" },
  });

  try {
    const client = new InstagramClient(post.account.pageAccessToken || post.account.accessToken);
    let caption = post.caption || "";
    if (post.hashtagSet?.tags.length) {
      caption += "\n\n" + post.hashtagSet.tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    }

    const params: Record<string, string | boolean | number> = { caption };
    const scheduledUnix = Math.floor(post.scheduledAt.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);

    if (scheduledUnix > now + 600) {
      params.published = false;
      params.scheduled_publish_time = scheduledUnix;
    }

    if (post.mediaType === "REELS") {
      params.media_type = "REELS";
      params.video_url = post.mediaUrl;
    } else if (post.mediaType === "VIDEO") {
      params.media_type = "VIDEO";
      params.video_url = post.mediaUrl;
    } else {
      params.image_url = post.mediaUrl;
    }

    const container = await client.createMediaContainer(post.account.igUserId, params as never);
    await waitForContainer(client, container.id);
    const published = await client.publishMedia(post.account.igUserId, container.id);

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: "published",
        containerId: container.id,
        publishedId: published.id,
      },
    });

    if (post.hashtagSetId) {
      await prisma.hashtagSet.update({
        where: { id: post.hashtagSetId },
        data: { usageCount: { increment: 1 } },
      });
    }
  } catch (error) {
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}
