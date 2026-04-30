// ─── Reel Code Links ──────────────────────────────────────────────────────────
// Add a new entry here each time you share a code link in your Instagram reels.
// Tags drive the filter pills on the page — keep them consistent.
//
// Entry shape:
// {
//   id:          unique string (e.g. 'lstm-demand-01')
//   slug:        URL-safe string — becomes /code-drops/<slug> (shareable per reel)
//   title:       reel / snippet title
//   description: one-line explanation shown on the card
//   tag:         'Python' | 'JavaScript' | 'ML' | 'SQL' | 'DSA' | 'Data' | 'System Design' | etc.
//   link:        GitHub file / gist / repo URL
//   date:        'YYYY-MM-DD'
// }

export const reelLinks = [
  {
    id: 'second-brain-01',
    slug: 'second-brain',
    title: 'Second Brain',
    description: 'A personal knowledge management system to capture, organise, and retrieve notes and ideas.',
    tag: 'Full Stack',
    link: 'https://github.com/sai-sridhar-repo-07/Second-Brain',
    cta: 'View Source Code',
    date: '2026-04-10',
  },
  {
    id: 'auto-apply-jobs-01',
    slug: 'auto-apply-jobs',
    title: 'Auto Apply Jobs',
    description: 'Automates job applications across platforms — scrapes listings and submits forms end-to-end.',
    tag: 'Automation',
    link: 'https://github.com/sai-sridhar-repo-07/Auto-Apply-Jobs',
    cta: 'View Source Code',
    date: '2026-04-10',
  },
  {
    id: 'jio-extension-01',
    slug: 'jio-extension',
    title: 'Jio Extension',
    description: 'Browser extension to seek and control Jio live streams directly from the toolbar.',
    tag: 'JavaScript',
    link: 'https://github.com/sai-sridhar-repo-07/live-stream-seeker',
    cta: 'View Source Code',
    date: '2026-04-10',
  },
  {
    id: 'yt-shorts-pipeline-01',
    slug: 'auto-deploy-youtube-shorts',
    title: 'Auto Deploy YouTube Shorts',
    description: 'End-to-end pipeline that auto-generates, renders, and publishes YouTube Shorts on a schedule.',
    tag: 'Automation',
    link: 'https://github.com/sai-sridhar-repo-07/youtube-shorts-pipeline',
    cta: 'View Source Code',
    date: '2026-04-10',
  },
  {
    id: 'lumina-drift-01',
    slug: 'lumina-drift',
    title: 'Lumina Drift',
    description: 'An interactive visual experience — generative light and motion in the browser.',
    tag: 'Crazy Websites',
    link: 'https://sai-sridhar-repo-07.github.io/Lumina-Drift/',
    cta: 'Visit Website',
    date: '2026-04-14',
  },
  {
    id: 'mario-game-01',
    slug: 'mario-game',
    title: 'Mario Game',
    description: 'Browser-based Mario game built from scratch in JavaScript.',
    tag: 'JavaScript',
    link: 'https://github.com/sai-sridhar-repo-07/Mario-Game',
    cta: 'View Source Code',
    date: '2026-04-19',
  },
  {
    id: 'free-api-explorer-01',
    slug: 'free-api-explorer',
    title: 'Free API Explorer',
    description: 'Browse and test free public APIs directly in the browser — no auth, no setup.',
    tag: 'Crazy Websites',
    link: 'https://sai-sridhar-repo-07.github.io/Free-API-Explorer-/',
    cta: 'Visit Website',
    date: '2026-04-30',
  },
  {
    id: 'atxp-chat-01',
    slug: 'atxp-chat',
    title: 'ATXP Chat',
    description: 'AI chat app with all major LLMs in one place — GPT, Claude, Gemini and more under one roof.',
    tag: 'Crazy Websites',
    link: 'https://chat.atxp.ai/',
    cta: 'Visit Website',
    date: '2026-04-22',
  },
  {
    id: 'loot-drop-01',
    slug: 'loot-drop',
    title: 'Loot Drop',
    description: 'A startup worth checking out.',
    tag: 'Crazy Websites',
    link: 'https://www.loot-drop.io/',
    cta: 'Visit Website',
    date: '2026-04-12',
  },
]

export function getAllTags() {
  const tags = ['All', ...new Set(reelLinks.map((r) => r.tag))]
  return tags
}

export function getBySlug(slug) {
  return reelLinks.find((r) => r.slug === slug) || null
}
