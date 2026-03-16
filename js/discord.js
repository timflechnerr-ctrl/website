/* ═══════════════════════════════════════════
   discord.js — Lanyard Live Status
   User ID: 1229013813886717976
═══════════════════════════════════════════ */

'use strict';

const DISCORD_ID = '1229013813886717976';
const LANYARD_WS  = 'wss://api.lanyard.rest/socket';
const LANYARD_API = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

/* DOM refs */
const els = {
  avatar:         document.getElementById('discordAvatar'),
  avatarFallback: document.getElementById('discordAvatarFallback'),
  globalName:     document.getElementById('discordGlobalName'),
  usernameTag:    document.getElementById('discordUsernameTag'),
  statusBadge:    document.getElementById('statusBadge'),
  activityWrap:   document.getElementById('discordActivityWrap'),
  activityImg:    document.getElementById('activityImg'),
  activityImgFallback: document.getElementById('activityIconFallback'),
  activityName:   document.getElementById('activityName'),
  activityDetail: document.getElementById('activityDetail'),
};

/* Status label map */
const STATUS_MAP = {
  online:  'Online',
  idle:    'Away',
  dnd:     'Do Not Disturb',
  offline: 'Offline',
};

/* ─── Update UI from Lanyard data ─── */
function applyData(data) {
  if (!data) return;

  const { discord_user, discord_status, activities, spotify } = data;

  /* Avatar */
  if (discord_user && discord_user.avatar) {
    const url = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.${discord_user.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=128`;
    els.avatar.onload = () => {
      els.avatar.classList.add('loaded');
      if (els.avatarFallback) els.avatarFallback.style.display = 'none';
    };
    els.avatar.onerror = () => {
      els.avatar.classList.remove('loaded');
      if (els.avatarFallback) els.avatarFallback.style.display = 'flex';
    };
    els.avatar.src = url;
  }

  /* Name */
  if (discord_user) {
    const display = discord_user.global_name || discord_user.username;
    if (els.globalName)  els.globalName.textContent  = display;
    if (els.usernameTag) els.usernameTag.textContent = discord_user.username;
  }

  /* Status badge */
  if (els.statusBadge) {
    els.statusBadge.className = 'discord-status-badge ' + (discord_status || 'offline');
  }

  /* Activity / Spotify */
  let shown = false;

  // Check Spotify first
  if (spotify && spotify.song) {
    setActivity(
      spotify.album_art_url || '',
      'Listening to Spotify',
      `${spotify.song} — ${spotify.artist}`
    );
    shown = true;
  }

  // Fall back to first activity
  if (!shown && activities && activities.length > 0) {
    const act = activities.find(a => a.type === 0) || activities[0];
    const imgUrl = getActivityImage(act);
    setActivity(
      imgUrl,
      act.name || 'Playing',
      act.state || act.details || STATUS_MAP[discord_status] || 'Online'
    );
    shown = true;
  }

  // No activity — show status
  if (!shown) {
    setActivity(
      '',
      'Discord',
      STATUS_MAP[discord_status] || 'Offline'
    );
  }
}

function setActivity(imgUrl, name, detail) {
  if (imgUrl) {
    els.activityImg.src           = imgUrl;
    els.activityImg.style.display = 'block';
    els.activityImgFallback.style.display = 'none';
    els.activityImg.onerror = () => {
      els.activityImg.style.display = 'none';
      els.activityImgFallback.style.display = 'flex';
    };
  } else {
    els.activityImg.style.display = 'none';
    els.activityImgFallback.style.display = 'flex';
  }
  if (els.activityName)   els.activityName.textContent   = name;
  if (els.activityDetail) els.activityDetail.textContent = detail;
}

function getActivityImage(act) {
  if (!act || !act.assets) return '';
  const key = act.assets.large_image || act.assets.small_image || '';
  if (!key) return '';
  if (key.startsWith('mp:external/')) {
    // External image (e.g. Spotify)
    return 'https://media.discordapp.net/' + key.replace('mp:', '');
  }
  if (act.application_id) {
    return `https://cdn.discordapp.com/app-assets/${act.application_id}/${key}.webp?size=64`;
  }
  return '';
}


/* ─── WebSocket connection (real-time) ─── */
let ws, heartbeatInterval;

function connectWS() {
  ws = new WebSocket(LANYARD_WS);

  ws.addEventListener('open', () => {
    console.log('[Lanyard] WebSocket connected');
  });

  ws.addEventListener('message', (ev) => {
    let payload;
    try { payload = JSON.parse(ev.data); } catch { return; }

    const { op, d } = payload;

    switch (op) {
      case 1: // Hello — start heartbeat + subscribe
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 3 }));
          }
        }, d.heartbeat_interval);

        ws.send(JSON.stringify({
          op: 2,
          d: { subscribe_to_id: DISCORD_ID },
        }));
        break;

      case 0: // Event
        if (d && (d.discord_user || d.discord_status !== undefined)) {
          applyData(d);
        }
        break;
    }
  });

  ws.addEventListener('close', () => {
    clearInterval(heartbeatInterval);
    console.log('[Lanyard] WS closed — reconnecting in 5s…');
    setTimeout(connectWS, 5000);
  });

  ws.addEventListener('error', () => {
    ws.close();
  });
}


/* ─── Fallback: REST fetch ─── */
async function fetchREST() {
  try {
    const res  = await fetch(LANYARD_API);
    const json = await res.json();
    if (json.success && json.data) applyData(json.data);
  } catch (err) {
    console.warn('[Lanyard] REST fetch failed:', err);
    if (els.activityDetail) els.activityDetail.textContent = 'Could not fetch status.';
  }
}


/* ─── Init ─── */
fetchREST(); // Immediate first load
connectWS(); // Then keep real-time updates
