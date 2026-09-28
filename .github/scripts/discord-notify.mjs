#!/usr/bin/env node

/**
 * Clean & Minimal Discord Notification script for GitHub Actions CI/CD.
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
const runId = process.env.GITHUB_RUN_ID || '';
const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
const runUrl = runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : `${serverUrl}/${repo}/actions`;
const commitUrl = sha ? `${serverUrl}/${repo}/commit/${sha}` : `${serverUrl}/${repo}`;
const actorUrl = `https://github.com/${actor}`;
const actorAvatar = `https://github.com/${actor}.png?size=96`;
const siteUrl = 'https://osusearch.netamaru.id';
const iconUrl = 'https://raw.githubusercontent.com/Netamaru/osu-search/main/public/icon1.png';

const rawCommitMessage = process.env.COMMIT_MESSAGE || '';
const commitMessage = rawCommitMessage.split('\n')[0].slice(0, 100) || 'Automated trigger';

const config = {
  started: {
    title: '[osu! Search] Build Started',
    color: 0xf59e0b, // Amber
    description: `Pipeline triggered for branch \`${branch}\`.`,
    statusText: 'In Progress',
  },
  success: {
    title: '[osu! Search] Deploy Succeeded',
    color: 0xff1f8f, // osu! Pink
    description: `Application successfully deployed to [osusearch.netamaru.id](${siteUrl}).`,
    statusText: 'Success',
  },
  failure: {
    title: `[osu! Search] ${stage || 'Pipeline'} Failed`,
    color: 0xef4444, // Red
    description: `An error occurred during stage **${stage || 'Build & Deploy'}**.`,
    statusText: 'Failed',
  },
  cancelled: {
    title: '[osu! Search] Pipeline Cancelled',
    color: 0x94a3b8, // Slate
    description: 'The workflow execution was cancelled.',
    statusText: 'Cancelled',
  },
};

const current = config[status] || config.success;

const fields = [
  {
    name: 'Commit',
    value: commitUrl ? `[\`${shortSha}\`](${commitUrl}) ${commitMessage}` : `\`${shortSha}\` ${commitMessage}`,
    inline: false,
  },
  {
    name: 'Branch',
    value: `\`${branch}\``,
    inline: true,
  },
  {
    name: 'Author',
    value: `[@${actor}](${actorUrl})`,
    inline: true,
  },
  {
    name: 'Status',
    value: current.statusText,
    inline: true,
  },
];

if (status === 'success') {
  fields.push({
    name: 'Environment',
    value: `[osusearch.netamaru.id](${siteUrl})`,
    inline: true,
  });
}

fields.push({
  name: 'GitHub Action',
  value: `[View Run](${runUrl})`,
  inline: true,
});

const embed = {
  author: {
    name: `${actor} • GitHub Actions`,
    icon_url: actorAvatar,
    url: actorUrl,
  },
  title: current.title,
  url: status === 'success' ? siteUrl : runUrl,
  color: current.color,
  description: current.description,
  fields: fields,
  thumbnail: {
    url: iconUrl,
  },
  footer: {
    text: 'osu! Search • CI/CD',
    icon_url: 'https://github.githubassets.com/favicons/favicon.png',
  },
  timestamp: new Date().toISOString(),
};

const payload = {
  username: 'osu! Search CI/CD',
  avatar_url: iconUrl,
  embeds: [embed],
};

async function sendNotification() {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`Discord notification sent successfully (${status}).`);
    } else {
      const text = await res.text();
      console.warn(`Discord webhook responded with HTTP ${res.status}: ${text}`);
    }
  } catch (err) {
    console.warn('Network error sending Discord webhook:', err.message);
  }
}

sendNotification();
