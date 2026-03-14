import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { executeAction, type SlackAction } from "@/shared/lib/slack-actions";

function verifySlackSignature(request: NextRequest, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  const fiveMinAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinAgo) return false;

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature =
    "v0=" +
    crypto.createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

  const sigBuffer = Buffer.from(mySignature);
  const reqBuffer = Buffer.from(signature);
  if (sigBuffer.length !== reqBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, reqBuffer);
}

async function updateSlackMessage(
  botToken: string,
  channel: string,
  messageTs: string,
  text: string,
  blocks?: any[],
): Promise<void> {
  await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      ts: messageTs,
      text,
      blocks: blocks ?? [],
    }),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();

  if (!verifySlackSignature(request, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const payloadStr = params.get("payload");
  if (!payloadStr) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const payload = JSON.parse(payloadStr);
  if (payload.type !== "block_actions") {
    return NextResponse.json({ ok: true });
  }

  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  const actionItem = payload.actions?.[0];
  if (!actionItem) return NextResponse.json({ ok: true });

  const channel = payload.channel?.id;
  const messageTs = payload.message?.ts;
  if (!channel || !messageTs) return NextResponse.json({ ok: true });

  if (actionItem.action_id === "cancel_action") {
    await updateSlackMessage(botToken, channel, messageTs, "취소되었습니다.");
    return NextResponse.json({ ok: true });
  }

  if (actionItem.action_id === "confirm_action") {
    try {
      const action: SlackAction = JSON.parse(actionItem.value);

      // Remove buttons immediately to prevent double-click
      await updateSlackMessage(
        botToken,
        channel,
        messageTs,
        ":hourglass_flowing_sand: 처리 중...",
        [{ type: "section", text: { type: "mrkdwn", text: ":hourglass_flowing_sand: 처리 중..." } }],
      );

      const resultText = await executeAction(action);
      await updateSlackMessage(botToken, channel, messageTs, resultText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await updateSlackMessage(
        botToken,
        channel,
        messageTs,
        `오류가 발생했습니다: ${message}`,
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
