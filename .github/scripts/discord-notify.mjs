#!/usr/bin/env node

/**
 * Premium Discord Embed v2 Notification script for GitHub Actions CI/CD.
 * Usage: node .github/scripts/discord-notify.mjs <status> [stage]
 * Statuses: started, success, failure, cancelled
 */

const status = (process.argv[2] || 'success').toLowerCase();
const stage = process.argv[3] || '';

const webhookUrl = process.env.DISCORD_WEBHOOK;
if (!webhookUrl) {
  console.log('DISCORD_WEBHOOK is not set. Skipping Discord notification.');
  process.exit(0);
}

const repo = process.env.GITHUB_REPOSITORY || 'Netamaru/osu-search';
const sha = process.env.GITHUB_SHA || '';
const shortSha = sha ? sha.slice(0, 7) : 'latest';
const branch = process.env.GITHUB_REF_NAME || 'main';
const actor = process.env.GITHUB_ACTOR || 'Netamaru';
const eventName = process.env.GITHUB_EVENT_NAME || 'push';
const runId = process.env.GITHUB_RUN_ID || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
const runUrl = runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : `${serverUrl}/${repo}/actions`;
const commitUrl = sha ? `${serverUrl}/${repo}/commit/${sha}` : `${serverUrl}/${repo}`;
const actorUrl = `https://github.com/${actor}`;
const actorAvatar = `https://github.com/${actor}.png?size=96`;
const siteUrl = 'https://osusearch.netamaru.id';
const iconUrl = 'https://raw.githubusercontent.com/Netamaru/osu-search/main/public/icon1.png';
const bannerUrl = 'https://raw.githubusercontent.com/Netamaru/osu-search/main/public/preview.png';

const rawCommitMessage = process.env.COMMIT_MESSAGE || '';
const commitMessage = rawCommitMessage.split('\n')[0].slice(0, 120) || 'Manual or automated trigger';

// Configuration per status
const configMap = {
  started: {
    statusBadge: '🟡 IN PROGRESS',
    title: '🟡 [osu! Search] CI/CD Pipeline Started',
    color: 0xf59e0b, // Amber
    headline: '### ⚡ Build & Deployment Initiated\nA new pipeline run has been triggered and is now compiling.',
    authorText: `${actor} triggered a build`,
  },
  success: {
    statusBadge: '🟢 DEPLOYED',
    title: '🚀 [osu! Search] Deployed to Production (Done)',
    color: 0xff1f8f, // Vibrant osu! Pink
    headline: `### ✨ Deployment Succeeded!\nThe Next.js app was compiled, tested, and reloaded in **PM2** on **[osusearch.netamaru.id](${siteUrl})**.`,
    authorText: `${actor} deployed to production`,
    includeBanner: true,
  },
  failure: {
    statusBadge: '🔴 FAILED',
    title: `❌ [osu! Search] ${stage || 'Pipeline'} Error`,
    color: 0xef4444, // Crimson Red
    headline: `### 💥 Pipeline Failure Alert\nAn error occurred during stage **\`${stage || 'Build & Test'}\`**. Check logs for details.`,
    authorText: `${actor} • Pipeline Error`,
  },
  cancelled: {
    statusBadge: '⚪ CANCELLED',
    title: '⚠️ [osu! Search] Workflow Cancelled',
    color: 0x94a3b8, // Slate
    headline: '### ⏸️ Workflow Cancelled\nThe deployment execution was manually or automatically halted.',
    authorText: `${actor} cancelled the run`,
  },
};

const current = configMap[status] || configMap.success;

// Fields layout
const fields = [
  {
    name: '📝 Commit',
    value: commitUrl ? `[\`${shortSha}\`](${commitUrl}) — ${commitMessage}` : `\`${shortSha}\` — ${commitMessage}`,
    inline: false,
  },
  {
    name: '🌿 Branch',
    value: `\`${branch}\``,
    inline: true,
  },
  {
    name: '⚡ Event',
    value: `\`${eventName}\``,
    inline: true,
  },
  {
    name: '👤 Author',
    value: `[@${actor}](${actorUrl})`,
    inline: true,
  },
  {
    name: '🌐 Environment',
    value: `[Production](${siteUrl})`,
    inline: true,
  },
  {
    name: '📦 PM2 Process',
    value: '`osusearch.netamaru.id`',
    inline: true,
  },
  {
    name: '📊 Status',
    value: `**${current.statusBadge}**`,
    inline: true,
  },
];

// Rich Embed v2 definition
const embed = {
  author: {
    name: current.authorText,
    icon_url: actorAvatar,
    url: actorUrl,
  },
  title: current.title,
  url: status === 'success' ? siteUrl : runUrl,
  color: current.color,
  description: current.headline,
  fields: fields,
  thumbnail: {
    url: iconUrl,
  },
  footer: {
    text: 'osu! Search • Netamaru • Next.js & Bun',
    icon_url: 'https://github.githubassets.com/favicons/favicon.png',
  },
  timestamp: new Date().toISOString(),
};

if (current.includeBanner) {
  embed.image = {
    url: bannerUrl,
  };
}

// ActionRow Link Buttons (Discord Message Components)
const components = [
  {
    type: 1, // ActionRow
    components: [
      {
        type: 2, // Button
        style: 5, // Link
        label: 'Live Website',
        url: siteUrl,
      },
      {
        type: 2,
        style: 5,
        label: 'GitHub Run',
        url: runUrl,
      },
      {
        type: 2,
        style: 5,
        label: 'Commit Diff',
        url: commitUrl,
      },
    ],
  },
];

const payloadWithComponents = {
  username: 'osu! Search CI/CD',
  avatar_url: iconUrl,
  embeds: [embed],
  components: components,
};

const payloadEmbedOnly = {
  username: 'osu! Search CI/CD',
  avatar_url: iconUrl,
  embeds: [embed],
};

async function sendNotification() {
  try {
    // Attempt 1: Send with interactive ActionRow link buttons
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadWithComponents),
    });

    if (res.ok) {
      console.log(`Discord Embed v2 notification sent successfully with components (${status}).`);
      return;
    }

    // Fallback if Discord webhook rejects components (e.g., standard webhook without bot scope)
    const errText = await res.text();
    console.warn(`Discord webhook with components returned ${res.status}: ${errText}. Retrying with embed-only...`);

    const retryRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadEmbedOnly),
    });

    if (retryRes.ok) {
      console.log(`Discord Embed v2 notification sent successfully (${status}).`);
    } else {
      const retryErr = await retryRes.text();
      console.warn(`Discord fallback failed ${retryRes.status}: ${retryErr}`);
    }
  } catch (err) {
    console.warn('Network error sending Discord webhook:', err.message);
  }
}

sendNotification();
