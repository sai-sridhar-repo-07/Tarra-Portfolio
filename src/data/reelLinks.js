// ─── Reel Code Links ──────────────────────────────────────────────────────────
// Add a new entry here each time you share a code link in your Instagram reels.
// Tags drive the filter pills on the page — keep them consistent.
//
// Entry shape:
// {
//   id:          unique string (e.g. 'lstm-demand-01')
//   title:       reel / snippet title
//   description: one-line explanation shown on the card
//   tag:         'Python' | 'JavaScript' | 'ML' | 'SQL' | 'DSA' | 'Data' | 'System Design' | etc.
//   link:        GitHub file / gist / repo URL
//   date:        'YYYY-MM-DD'
// }

export const reelLinks = [
  {
    id: 'second-brain-01',
    title: 'Second Brain',
    description: 'A personal knowledge management system to capture, organise, and retrieve notes and ideas.',
    tag: 'Full Stack',
    link: 'https://github.com/sai-sridhar-repo-07/Second-Brain',
    date: '2026-04-10',
  },
  {
    id: 'auto-apply-jobs-01',
    title: 'Auto Apply Jobs',
    description: 'Automates job applications across platforms — scrapes listings and submits forms end-to-end.',
    tag: 'Automation',
    link: 'https://github.com/sai-sridhar-repo-07/Auto-Apply-Jobs',
    date: '2026-04-10',
  },
  {
    id: 'jio-extension-01',
    title: 'Jio Extension',
    description: 'Browser extension to seek and control Jio live streams directly from the toolbar.',
    tag: 'JavaScript',
    link: 'https://github.com/sai-sridhar-repo-07/live-stream-seeker',
    date: '2026-04-10',
  },
  {
    id: 'yt-shorts-pipeline-01',
    title: 'Auto Deploy YouTube Shorts',
    description: 'End-to-end pipeline that auto-generates, renders, and publishes YouTube Shorts on a schedule.',
    tag: 'Automation',
    link: 'https://github.com/sai-sridhar-repo-07/youtube-shorts-pipeline',
    date: '2026-04-10',
  },
]

export function getAllTags() {
  const tags = ['All', ...new Set(reelLinks.map((r) => r.tag))]
  return tags
}
