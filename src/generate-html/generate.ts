import { resolve } from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HyprBind {
  locked: boolean;
  mouse: boolean;
  release: boolean;
  repeat: boolean;
  longPress: boolean;
  non_consuming: boolean;
  has_description: boolean;
  modmask: number;
  submap: string;
  submap_universal: string;
  key: string;
  keycode: number;
  catch_all: boolean;
  description: string;
  dispatcher: string;
  arg: string;
}

// ─── Modifier decoding ────────────────────────────────────────────────────────

const MODS_BY_BIT: [number, string][] = [
  [6, "SUPER"],
  [0, "SHIFT"],
  [2, "CTRL"],
  [3, "ALT"],
  [5, "HYPR"],
  [7, "ALTGR"],
  [1, "CAPS"],
  [4, "NUM"],
];

export function getMods(modmask: number): string[] {
  return MODS_BY_BIT.filter(([bit]) => (modmask >> bit) & 1).map(([, label]) => label);
}

// ─── Key name mapping ─────────────────────────────────────────────────────────

const KEY_MAP: Record<string, string> = {
  return: "ENTER",
  space: "SPACE",
  tab: "TAB",
  escape: "ESC",
  backspace: "BKSP",
  delete: "DEL",
  super_l: "",
  super_r: "",
  up: "UP",
  down: "DOWN",
  left: "LEFT",
  right: "RIGHT",
  prior: "PGUP",
  next: "PGDN",
  home: "HOME",
  end: "END",
  insert: "INS",
  print: "PRTSC",
  caps_lock: "CAPS",
  num_lock: "NUMLOCK",
  xf86audioraisevolume: "VOL+",
  xf86audiolowervolume: "VOL-",
  xf86audiomute: "MUTE",
  xf86audiomicmute: "MIC MUTE",
  xf86audionext: "NEXT",
  xf86audioprev: "PREV",
  xf86audioplay: "PLAY",
  xf86audiopause: "PAUSE",
  xf86audiostop: "STOP",
  xf86monbrightnessup: "BRIGHT+",
  xf86monbrightnessdown: "BRIGHT-",
  xf86search: "SEARCH",
  xf86calculator: "CALC",
  xf86sleep: "SLEEP",
  xf86power: "POWER",
  ampersand: "&",
  eacute: "é",
  quotedbl: '"',
  apostrophe: "'",
  parenleft: "(",
  minus: "-",
  egrave: "è",
  underscore: "_",
  ccedilla: "ç",
  agrave: "à",
  exclam: "!",
  period: ".",
  semicolon: ";",
};

export function getKeyLabel(key: string): string {
  if (!key) return "";
  const lower = key.toLowerCase();
  if (lower in KEY_MAP) return KEY_MAP[lower]!;
  if (/^f\d+$/.test(lower)) return lower.toUpperCase();
  return key.toUpperCase();
}

// ─── Description formatting ───────────────────────────────────────────────────

const DISPATCHER_TEMPLATES: Record<string, string> = {
  cyclenext: "Move focus {arg}",
  exit: "Exit Hyprland",
  exec: "{arg}",
  forcekillactive: "Kill window",
  fullscreen: "Toggle maximize",
  killactive: "Close window",
  layoutmsg: "{arg}",
  mouse: "{arg}",
  movefocus: "Move focus {arg}",
  movetoworkspace: "Move to workspace {arg}",
  movetoworkspacesilent: "Send to workspace {arg}",
  pseudo: "Toggle window span",
  resizeactive: "Resize {arg}",
  swapnext: "Swap with adjacent",
  togglefloating: "Toggle float",
  togglesplit: "Change split direction",
  workspace: "Goto workspace {arg}",
  global: "{arg}",
  pin: "Pin window",
};

const SKIPPED_TEXT: string[] = [
  "caelestia:launcherInterrupt",
  "caelestia:refreshDevices",
];

const SUBMAPPING: Record<string, string> = {
  "caelestia:launcher": "Launcher",
  "caelestia:session": "Shutdown panel",
  "caelestia:clearNotifs": "Clear notifications",
  "caelestia:showall": "Show all panels",
  "caelestia:lock": "Lock",
  "caelestia shell -d": "Unlock",
  "caelestia:brightnessUp": "Brightness Up",
  "caelestia:brightnessDown": "Brightness Down",
  "caelestia:mediaToggle": "Toggle media",
  "caelestia:mediaNext": "Next media",
  "caelestia:mediaPrev": "Previous media",
  "caelestia:mediaStop": "Stop media",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 1": "Go to Workspace in group 1",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 2": "Go to Workspace in group 2",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 3": "Go to Workspace in group 3",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 4": "Go to Workspace in group 4",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 5": "Go to Workspace in group 5",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 6": "Go to Workspace in group 6",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 7": "Go to Workspace in group 7",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 8": "Go to Workspace in group 8",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 9": "Go to Workspace in group 9",
  "~/.config/hypr/scripts/wsaction.fish -g workspace 10": "Go to Workspace in group 10",
  "caelestia toggle specialws": "Toggle special workspace",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 1": "Move to workspace 1",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 2": "Move to workspace 2",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 3": "Move to workspace 3",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 4": "Move to workspace 4",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 5": "Move to workspace 5",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 6": "Move to workspace 6",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 7": "Move to workspace 7",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 8": "Move to workspace 8",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 9": "Move to workspace 9",
  "~/.config/hypr/scripts/wsaction.fish movetoworkspace 10": "Move to workspace 10",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 1": "Move to workspace in group 1",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 2": "Move to workspace in group 2",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 3": "Move to workspace in group 3",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 4": "Move to workspace in group 4",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 5": "Move to workspace in group 5",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 6": "Move to workspace in group 6",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 7": "Move to workspace in group 7",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 8": "Move to workspace in group 8",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 9": "Move to workspace in group 9",
  "~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 10": "Move to workspace in group 10",
  "~/.config/hypr/scripts/wsaction.fish workspace 1": "Go to workspace 1",
  "~/.config/hypr/scripts/wsaction.fish workspace 2": "Go to workspace 2",
  "~/.config/hypr/scripts/wsaction.fish workspace 3": "Go to workspace 3",
  "~/.config/hypr/scripts/wsaction.fish workspace 4": "Go to workspace 4",
  "~/.config/hypr/scripts/wsaction.fish workspace 5": "Go to workspace 5",
  "~/.config/hypr/scripts/wsaction.fish workspace 6": "Go to workspace 6",
  "~/.config/hypr/scripts/wsaction.fish workspace 7": "Go to workspace 7",
  "~/.config/hypr/scripts/wsaction.fish workspace 8": "Go to workspace 8",
  "~/.config/hypr/scripts/wsaction.fish workspace 9": "Go to workspace 9",
  "~/.config/hypr/scripts/wsaction.fish workspace 10": "Go to workspace 10",
  "qs -c caelestia kill": "Kill shell",
  "qs -c caelestia kill; sleep .1; caelestia shell -d": "Kill & restart shell",
  movewindow: "Move window",
  changegroupactive: "Change active group",
  togglegroup: "Toggle group",
  moveoutofgroup: "Remove from group",
  lockactivegroup: "Lock the active group",
  "caelestia toggle sysmon": "Toggle system monitor workspace",
  "caelestia toggle music": "Toggle music workspace",
  "caelestia toggle communication": "Toggle social workspace",
  "caelestia toggle todo": "Toggle todo workspace",
  "app2unit -- foot": "Open Terminal",
  "app2unit -- firefox": "Open Firefox",
  "Move to workspace special:special": "Move to special workspace",
  "caelestia resizer pip": "Picture in Picture mode",
  "caelestia screenshot": "Screenshot",
  "caelestia:screenshotFreeze": "Region screenshot (Freeze)",
  "caelestia:screenshot": "Region screenshot",
  "caelestia record -s": "Video capture with sound",
  "caelestia record": "Video capture",
  "caelestia record -r": "Region video capture",
  "hyprpicker -a": "Color picker",
  "wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle": "Toggle mic mute",
  "wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle": "Toggle audio mute",
  "wpctl set-mute @DEFAULT_AUDIO_SINK@ 0; wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 10%+": "Volume up",
  "wpctl set-mute @DEFAULT_AUDIO_SINK@ 0; wpctl set-volume @DEFAULT_AUDIO_SINK@ 10%-": "Volume down",
  "systemctl suspend-then-hibernate": "Suspend & hibernate",
  "pkill fuzzel || caelestia clipboard": "Clipboard overlay",
  "pkill fuzzel || caelestia clipboard -d": "Delete clipboard entry",
  "pkill fuzzel || caelestia emoji -p": "Emoji selector",
  "notify-send -u low -i dialog-information-symbolic 'Test notification' \"Here's a really long message to test truncation and wrapping\nYou can middle click or flick this notification to dismiss it!\" -a 'Shell' -A \"Test1=I got it!\" -A \"Test2=Another action\"":
    "Test notifications",
  moveintogroup: "Move window into group",
  centerwindow: "Center floating window",
  "/home/jolo/.local/bin/os-shortcuts": "Key bindings",
};

const ARG_SUBS: Record<string, string> = {
  u: "up",
  d: "down",
  l: "left",
  r: "right",
};

// ─── SHORTCUT ORDER ───────────────────────────────────────────────────────────
// Edit this array to control the display order of all shortcuts.
// Reorder entries freely — the generator sorts output by position here.
// Shortcuts not listed appear at the bottom of their category (then globally).

export const SHORTCUT_ORDER: string[] = [
  // ── Launcher ──────────────────────────────────────────────────────────────
  "Launcher",
  "Show all panels",

  // ── System ────────────────────────────────────────────────────────────────
  "Lock",
  "Unlock",
  "Shutdown panel",
  "Suspend & hibernate",
  "Kill shell",
  "Kill & restart shell",
  "Clear notifications",

  // ── Apps ──────────────────────────────────────────────────────────────────
  "Open Terminal",
  "Open Firefox",

  // ── Windows ───────────────────────────────────────────────────────────────
  "Close window",
  "Toggle float",
  "Toggle maximize",
  "Move focus left",
  "Move focus right",
  "Move focus up",
  "Move focus down",
  "Move focus",
  "Move focus prev",
  "Move window",
  "Pin window",
  "Toggle float",
  "Center floating window",
  "Resize exact 55% 70%",
  "Picture in Picture mode",

  // ── Groups ────────────────────────────────────────────────────────────────
  "Toggle group",
  "Remove from group",
  "Lock the active group",
  "Change active group",
  "Move window into group",

  // ── Workspaces ────────────────────────────────────────────────────────────
  "Go to workspace 1",
  "Go to workspace 2",
  "Go to workspace 3",
  "Go to workspace 4",
  "Go to workspace 5",
  "Go to workspace 6",
  "Go to workspace 7",
  "Go to workspace 8",
  "Go to workspace 9",
  "Go to workspace 10",
  "Goto workspace -1",
  "Goto workspace +1",
  "Goto workspace -10",
  "Goto workspace +10",
  "Toggle special workspace",
  "Toggle system monitor workspace",
  "Toggle music workspace",
  "Toggle social workspace",
  "Toggle todo workspace",
  "Move to workspace 1",
  "Move to workspace 2",
  "Move to workspace 3",
  "Move to workspace 4",
  "Move to workspace 5",
  "Move to workspace 6",
  "Move to workspace 7",
  "Move to workspace 8",
  "Move to workspace 9",
  "Move to workspace 10",
  "Move to workspace -1",
  "Move to workspace +1",
  "Move to special workspace",

  // ── Media & Audio ─────────────────────────────────────────────────────────
  "Toggle media",
  "Next media",
  "Previous media",
  "Stop media",
  "Volume up",
  "Volume down",
  "Toggle audio mute",
  "Toggle mic mute",
  "Brightness Up",
  "Brightness Down",

  // ── Screenshots & Recording ───────────────────────────────────────────────
  "Screenshot",
  "Region screenshot (Freeze)",
  "Region screenshot",
  "Video capture with sound",
  "Video capture",
  "Region video capture",
  "Color picker",

  // ── Clipboard & Utilities ─────────────────────────────────────────────────
  "Clipboard overlay",
  "Delete clipboard entry",
  "Emoji selector",
  "Test notifications",
  "Key bindings",
];

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
// Controls which section each shortcut description belongs to.
// Descs not listed here appear in an "Other" section at the end.

export const CATEGORIES: { name: string; descs: string[] }[] = [
  {
    name: "Launcher",
    descs: ["Launcher", "Show all panels"],
  },
  {
    name: "System",
    descs: [
      "Lock",
      "Unlock",
      "Shutdown panel",
      "Suspend & hibernate",
      "Kill shell",
      "Kill & restart shell",
      "Clear notifications",
    ],
  },
  {
    name: "Apps",
    descs: ["Open Terminal", "Open Firefox"],
  },
  {
    name: "Windows",
    descs: [
      "Close window",
      "Toggle float",
      "Toggle maximize",
      "Pin window",
      "Center floating window",
      "Picture in Picture mode",
      "Resize exact 55% 70%",
      "Move focus left",
      "Move focus right",
      "Move focus up",
      "Move focus down",
      "Move focus",
      "Move focus prev",
      "Move window",
    ],
  },
  {
    name: "Groups",
    descs: [
      "Toggle group",
      "Remove from group",
      "Lock the active group",
      "Change active group",
      "Move window into group",
    ],
  },
  {
    name: "Workspaces",
    descs: [
      "Go to workspace 1",
      "Go to workspace 2",
      "Go to workspace 3",
      "Go to workspace 4",
      "Go to workspace 5",
      "Go to workspace 6",
      "Go to workspace 7",
      "Go to workspace 8",
      "Go to workspace 9",
      "Go to workspace 10",
      "Goto workspace -1",
      "Goto workspace +1",
      "Goto workspace -10",
      "Goto workspace +10",
      "Toggle special workspace",
      "Toggle system monitor workspace",
      "Toggle music workspace",
      "Toggle social workspace",
      "Toggle todo workspace",
      "Move to workspace 1",
      "Move to workspace 2",
      "Move to workspace 3",
      "Move to workspace 4",
      "Move to workspace 5",
      "Move to workspace 6",
      "Move to workspace 7",
      "Move to workspace 8",
      "Move to workspace 9",
      "Move to workspace 10",
      "Move to workspace -1",
      "Move to workspace +1",
      "Move to special workspace",
    ],
  },
  {
    name: "Media & Audio",
    descs: [
      "Toggle media",
      "Next media",
      "Previous media",
      "Stop media",
      "Volume up",
      "Volume down",
      "Toggle audio mute",
      "Toggle mic mute",
      "Brightness Up",
      "Brightness Down",
    ],
  },
  {
    name: "Screenshots & Recording",
    descs: [
      "Screenshot",
      "Region screenshot (Freeze)",
      "Region screenshot",
      "Video capture with sound",
      "Video capture",
      "Region video capture",
      "Color picker",
    ],
  },
  {
    name: "Clipboard & Utilities",
    descs: [
      "Clipboard overlay",
      "Delete clipboard entry",
      "Emoji selector",
      "Test notifications",
      "Key bindings",
    ],
  },
];

// ─── Parsing ──────────────────────────────────────────────────────────────────

interface ParsedDesc {
  skip: boolean;
  text: string;
}

function parseDescription(bind: HyprBind): ParsedDesc {
  const raw = bind.description?.trim() ?? "";

  if (raw.startsWith("!skip")) return { skip: true, text: "" };

  let text = raw;

  if (text.startsWith("!br")) {
    text = text.replace(/^!br\s*/, "");
  }
  if (text.startsWith("!h")) {
    const rest = text.replace(/^!h\s*/, "");
    const colonIdx = rest.indexOf(":");
    text = colonIdx >= 0 ? rest.slice(colonIdx + 1).trim() : "";
  }

  if (!text) {
    const template = DISPATCHER_TEMPLATES[bind.dispatcher] ?? bind.dispatcher;
    const arg = ARG_SUBS[bind.arg] ?? bind.arg ?? "";
    text = template.replace("{arg}", arg).replace("{description}", "").trim();
  }

  if (SKIPPED_TEXT.includes(text)) return { skip: true, text: "" };
  if (SUBMAPPING[text]) text = SUBMAPPING[text]!;

  return { skip: false, text };
}

// ─── Process binds ────────────────────────────────────────────────────────────

interface ProcessedBind {
  mods: string[];
  key: string;
  desc: string;
}

function processBinds(raw: HyprBind[]): ProcessedBind[] {
  const results: ProcessedBind[] = [];

  for (const bind of raw) {
    if (bind.catch_all) continue;
    if (bind.mouse) continue;

    const parsed = parseDescription(bind);
    if (parsed.skip) continue;

    const mods = getMods(bind.modmask);
    const key = getKeyLabel(bind.key);
    if (!key && mods.length === 0) continue;

    results.push({ mods, key, desc: parsed.text });
  }

  return results;
}

// ─── Sorting & grouping ───────────────────────────────────────────────────────

const ORDER_INDEX = new Map(SHORTCUT_ORDER.map((desc, i) => [desc, i]));

function sortKey(desc: string): number {
  return ORDER_INDEX.get(desc) ?? Number.MAX_SAFE_INTEGER;
}

function getCategoryName(desc: string): string {
  for (const cat of CATEGORIES) {
    if (cat.descs.includes(desc)) return cat.name;
  }
  return "Other";
}

// ─── HTML rendering ───────────────────────────────────────────────────────────

const MOD_COLORS: Record<string, string> = {
  SUPER: "mod-super",
  SHIFT: "mod-shift",
  CTRL: "mod-ctrl",
  ALT: "mod-alt",
  HYPR: "mod-hypr",
  ALTGR: "mod-altgr",
  CAPS: "mod-caps",
  NUM: "mod-num",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBind(bind: ProcessedBind): string {
  const keyPills = [
    ...bind.mods.map((m) => `<span class="mod ${MOD_COLORS[m] ?? "mod-other"}">${esc(m)}</span>`),
    ...(bind.key ? [`<span class="key">${esc(bind.key)}</span>`] : []),
  ].join("");

  return `<div class="bind-row"><div class="bind-keys">${keyPills}</div><div class="bind-desc">${esc(bind.desc)}</div></div>`;
}

function renderSection(name: string, binds: ProcessedBind[]): string {
  const rows = binds.map(renderBind).join("\n        ");
  return `
    <section class="submap-group" data-category="${esc(name)}">
      <h2 class="submap-header">${esc(name)}</h2>
      <div class="binds-list">
        ${rows}
      </div>
    </section>`;
}

function generateHtml(binds: ProcessedBind[]): string {
  // Sort all binds globally by SHORTCUT_ORDER
  const sorted = [...binds].sort((a, b) => sortKey(a.desc) - sortKey(b.desc));

  // Group into categories (preserving sorted order within each group)
  const catOrder = CATEGORIES.map((c) => c.name);
  const grouped = new Map<string, ProcessedBind[]>();
  for (const name of [...catOrder, "Other"]) grouped.set(name, []);

  for (const bind of sorted) {
    const cat = getCategoryName(bind.desc);
    grouped.get(cat)!.push(bind);
  }

  const totalBinds = binds.length;
  const sections = [...grouped.entries()]
    .filter(([, binds]) => binds.length > 0)
    .map(([name, binds]) => renderSection(name, binds))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OS Shortcuts</title>
  <style>
    /* ── Catppuccin Mocha palette ── */
    :root {
      --base:    #1e1e2e;
      --mantle:  #181825;
      --crust:   #11111b;
      --surface0: #313244;
      --surface1: #45475a;
      --surface2: #585b70;
      --overlay0: #6c7086;
      --overlay1: #7f849c;
      --text:    #cdd6f4;
      --subtext0: #a6adc8;
      --subtext1: #bac2de;
      --lavender: #b4befe;
      --blue:    #89b4fa;
      --sapphire: #74c7ec;
      --sky:     #89dceb;
      --teal:    #94e2d5;
      --green:   #a6e3a1;
      --yellow:  #f9e2af;
      --peach:   #fab387;
      --maroon:  #eba0ac;
      --red:     #f38ba8;
      --mauve:   #cba6f7;
      --pink:    #f5c2e7;
      --flamingo: #f2cdcd;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--base);
      color: var(--text);
      font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
      font-size: 16px;
      line-height: 1.5;
      min-height: 100vh;
    }

    /* ── Header ── */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--crust);
      border-bottom: 1px solid var(--surface0);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    header h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--mauve);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    #search {
      flex: 1;
      max-width: 340px;
      background: var(--surface0);
      border: 1px solid var(--surface1);
      border-radius: 6px;
      color: var(--text);
      font-family: inherit;
      font-size: 16px;
      padding: 5px 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    #search::placeholder { color: var(--overlay0); }
    #search:focus { border-color: var(--mauve); }

    .count {
      font-size: 14px;
      color: var(--overlay1);
      white-space: nowrap;
    }

    /* ── Main layout ── */
    main {
      padding: 16px 20px 40px;
    }

    /* ── Submap sections ── */
    .submap-group {
      break-inside: avoid;
      margin-bottom: 20px;
      background: var(--mantle);
      border: 1px solid var(--surface0);
      border-radius: 8px;
      overflow: hidden;
    }

    .submap-header {
      background: var(--surface0);
      color: var(--lavender);
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-bottom: 1px solid var(--surface1);
    }

    .binds-list {
      padding: 4px 0;
    }

    /* ── Bind rows ── */
    .bind-row {
      display: grid;
      grid-template-columns: 300px 1fr;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      transition: background 0.1s;
    }
    .bind-row:hover { background: var(--surface0); }

    .bind-keys {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .bind-desc {
      color: var(--subtext1);
      font-size: 16px;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Modifier pills ── */
    .mod, .key {
      display: inline-flex;
      align-items: center;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      line-height: 1.6;
      white-space: nowrap;
    }

    .mod-super  { background: rgba(203,166,247,0.18); color: var(--mauve);    border: 1px solid rgba(203,166,247,0.35); }
    .mod-shift  { background: rgba(250,179,135,0.18); color: var(--peach);    border: 1px solid rgba(250,179,135,0.35); }
    .mod-ctrl   { background: rgba(137,180,250,0.18); color: var(--blue);     border: 1px solid rgba(137,180,250,0.35); }
    .mod-alt    { background: rgba(166,227,161,0.18); color: var(--green);    border: 1px solid rgba(166,227,161,0.35); }
    .mod-hypr   { background: rgba(243,188,168,0.18); color: var(--flamingo); border: 1px solid rgba(243,188,168,0.35); }
    .mod-altgr  { background: rgba(148,226,213,0.18); color: var(--teal);     border: 1px solid rgba(148,226,213,0.35); }
    .mod-caps   { background: rgba(249,226,175,0.18); color: var(--yellow);   border: 1px solid rgba(249,226,175,0.35); }
    .mod-num    { background: rgba(127,132,156,0.18); color: var(--overlay1); border: 1px solid rgba(127,132,156,0.35); }
    .mod-other  { background: rgba(127,132,156,0.18); color: var(--overlay1); border: 1px solid rgba(127,132,156,0.35); }

    .key {
      background: var(--surface1);
      color: var(--text);
      border: 1px solid var(--surface2);
      min-width: 22px;
      justify-content: center;
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--mantle); }
    ::-webkit-scrollbar-thumb { background: var(--surface1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--surface2); }
  </style>
</head>
<body>
  <header>
    <h1>OS Shortcuts</h1>
    <input type="search" id="search" placeholder="Filter by key or description…" autocomplete="off" spellcheck="false">
    <span class="count" id="count">${totalBinds} binds</span>
  </header>
  <main id="binds-container">
${sections}
  </main>
  <script>
    (function () {
      function applyFilter(query) {
        var q = query.toLowerCase().trim();
        document.querySelectorAll('.bind-row').forEach(function (row) {
          row.style.display = !q || row.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
        document.querySelectorAll('.submap-group').forEach(function (section) {
          var visible = section.querySelectorAll('.bind-row:not([style*="none"])');
          section.style.display = visible.length > 0 ? '' : 'none';
        });
      }
      var searchEl = document.getElementById('search');
      searchEl.addEventListener('input', function () { applyFilter(searchEl.value); });
    })();
  </script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const bindsPath = resolve(import.meta.dir, "../main-ui/binds.json");
const outputPath = resolve(import.meta.dir, "../main-ui/index.html");

const bindsRaw: HyprBind[] = JSON.parse(await Bun.file(bindsPath).text());
const processed = processBinds(bindsRaw);
const html = generateHtml(processed);

await Bun.write(outputPath, html);
console.log(`✓ Generated ${outputPath} (${processed.length} binds)`);
