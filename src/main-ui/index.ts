import { Electroview } from "electrobun/view";
import bindsRaw from "./binds.json";

new Electroview({ rpc: null });

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

// Bit positions match Hyprland's modmask
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

function getMods(modmask: number): string[] {
  return MODS_BY_BIT
    .filter(([bit]) => (modmask >> bit) & 1)
    .map(([, label]) => label);
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
  // XF86 media/function keys
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
  quotedbl: "\"",
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

function getKeyLabel(key: string): string {
  if (!key) return "";
  const lower = key.toLowerCase();
  if (lower in KEY_MAP) return KEY_MAP[lower];
  // Function keys: f1–f24
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
  'caelestia:launcherInterrupt',
  'caelestia:refreshDevices',
];

const SUBMAPPING: Record<string, string> = {
  'caelestia:launcher': 'Launcher',
  'caelestia:session': 'Shutdown panel',
  'caelestia:clearNotifs': 'Clear Notifs',
  'caelestia:showall': 'Show all panels',
  'caelestia:lock': 'Lock',
  'caelestia shell -d': 'Unlock',
  'caelestia:brightnessUp': 'Brightness Up',
  'caelestia:brightnessDown': 'Brightness Down',
  'caelestia:mediaToggle': 'Toggle media',
  'caelestia:mediaNext': 'Next media',
  'caelestia:mediaPrev': 'Previous media',
  'caelestia:mediaStop': 'Stop media',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 1': 'Go to Workspace in group 1',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 2': 'Go to Workspace in group 2',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 3': 'Go to Workspace in group 3',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 4': 'Go to Workspace in group 4',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 5': 'Go to Workspace in group 5',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 6': 'Go to Workspace in group 6',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 7': 'Go to Workspace in group 7',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 8': 'Go to Workspace in group 8',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 9': 'Go to Workspace in group 9',
  '~/.config/hypr/scripts/wsaction.fish -g workspace 10': 'Go to Workspace in group 10',
  'caelestia toggle specialws': 'Toggle special workspace',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 1': 'Move to workspace 1',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 2': 'Move to workspace 2',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 3': 'Move to workspace 3',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 4': 'Move to workspace 4',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 5': 'Move to workspace 5',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 6': 'Move to workspace 6',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 7': 'Move to workspace 7',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 8': 'Move to workspace 8',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 9': 'Move to workspace 9',
  '~/.config/hypr/scripts/wsaction.fish movetoworkspace 10': 'Move to workspace 10',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 1': 'Move to workspace in group 1',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 2': 'Move to workspace in group 2',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 3': 'Move to workspace in group 3',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 4': 'Move to workspace in group 4',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 5': 'Move to workspace in group 5',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 6': 'Move to workspace in group 6',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 7': 'Move to workspace in group 7',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 8': 'Move to workspace in group 8',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 9': 'Move to workspace in group 9',
  '~/.config/hypr/scripts/wsaction.fish -g movetoworkspace 10': 'Move to workspace in group 10',
  '~/.config/hypr/scripts/wsaction.fish workspace 1': 'Go to workspace 1',
  '~/.config/hypr/scripts/wsaction.fish workspace 2': 'Go to workspace 2',
  '~/.config/hypr/scripts/wsaction.fish workspace 3': 'Go to workspace 3',
  '~/.config/hypr/scripts/wsaction.fish workspace 4': 'Go to workspace 4',
  '~/.config/hypr/scripts/wsaction.fish workspace 5': 'Go to workspace 5',
  '~/.config/hypr/scripts/wsaction.fish workspace 6': 'Go to workspace 6',
  '~/.config/hypr/scripts/wsaction.fish workspace 7': 'Go to workspace 7',
  '~/.config/hypr/scripts/wsaction.fish workspace 8': 'Go to workspace 8',
  '~/.config/hypr/scripts/wsaction.fish workspace 9': 'Go to workspace 9',
  '~/.config/hypr/scripts/wsaction.fish workspace 10': 'Go to workspace 10',
  'qs -c caelestia kill': 'Kill shell',
  'qs -c caelestia kill; sleep .1; caelestia shell -d': 'Kill & restart shell',
  'movewindow': 'Move window',
  'changegroupactive': 'Change active group',
  'togglegroup': 'Toggle group',
  'moveoutofgroup': 'Remove from group',
  'lockactivegroup': 'Lock the active group',
  'caelestia toggle sysmon': 'Toggle "System monitor" special workspace ',
  'caelestia toggle music': 'Toggle "Music" special workspace',
  'caelestia toggle communication': 'Toggle "Social" special workspace',
  'caelestia toggle todo': 'Toggle "Todo" special workspace',
  'app2unit -- foot': 'Open Terminal',
  'app2unit -- firefox': 'Open Firefox',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'app2unit -- ': 'Open ',
  'Move to workspace special:special': 'Move to special workspace',
  'caelestia resizer pip': 'Picture in Picture mode',
  'caelestia screenshot': 'Screenshot',
  'caelestia:screenshotFreeze': 'Region screenshot (Freeze)',
  'caelestia:screenshot': 'Region screenshot',
  'caelestia record -s': 'Video capture with sound',
  'caelestia record': 'Video capture',
  'caelestia record -r': 'Region video capture',
  'hyprpicker -a': 'Color picker',
  'wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle': 'Toggle mic mute',
  'wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle': 'Toggle audio mute',
  'wpctl set-mute @DEFAULT_AUDIO_SINK@ 0; wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 10%+': 'Volume up',
  'wpctl set-mute @DEFAULT_AUDIO_SINK@ 0; wpctl set-volume @DEFAULT_AUDIO_SINK@ 10%-': 'Volume down',
  'systemctl suspend-then-hibernate': 'Suspend & hibernate',
  'pkill fuzzel || caelestia clipboard': 'Clipboard overlay',
  'pkill fuzzel || caelestia clipboard -d': 'Delete clipboard entry',
  'pkill fuzzel || caelestia emoji -p': 'Emoji selector',
  'notify-send -u low -i dialog-information-symbolic \'Test notification\' "Here\'s a really long message to test truncation and wrapping\nYou can middle click or flick this notification to dismiss it!" -a \'Shell\' -A "Test1=I got it!" -A "Test2=Another action"': 'Test notifications',
  'moveintogroup': 'Move window into group in direction',
  'centerwindow': 'Center floating window',
};








const ARG_SUBS: Record<string, string> = {
  u: "up",
  d: "down",
  l: "left",
  r: "right",
};

interface ParsedDesc {
  skip: boolean;
  spacer: boolean;
  heading: string;
  text: string;
}

function parseDescription(bind: HyprBind): ParsedDesc {
  const raw = bind.description?.trim() ?? "";

  if (raw.startsWith("!skip")) return { skip: true, spacer: false, heading: "", text: "" };

  let spacer = false;
  let heading = "";
  let text = raw;
  let skip = false;

  if (text.startsWith("!br")) {
    spacer = true;
    text = text.replace(/^!br\s*/, "");
  }
  if (text.startsWith("!h")) {
    const rest = text.replace(/^!h\s*/, "");
    const colonIdx = rest.indexOf(":");
    if (colonIdx >= 0) {
      heading = rest.slice(0, colonIdx).trim();
      text = rest.slice(colonIdx + 1).trim();
    } else {
      heading = rest.trim();
      text = "";
    }
  }

  if (!text) {
    // Fall back to dispatcher template
    const template = DISPATCHER_TEMPLATES[bind.dispatcher] ?? bind.dispatcher;
    const arg = ARG_SUBS[bind.arg] ?? bind.arg ?? "";
    text = template.replace("{arg}", arg).replace("{description}", "").trim();
  }

  if (SKIPPED_TEXT.includes(text)) {
    skip = true;
  }

  if (SUBMAPPING[text]) {
    text = SUBMAPPING[text];
  }

  return { skip, spacer, heading, text };
}

// ─── Group binds by submap ────────────────────────────────────────────────────

type BindEntry =
  | { type: "bind"; bind: HyprBind; mods: string[]; key: string; desc: string }
  | { type: "spacer" }
  | { type: "heading"; label: string; desc: string };

function processBinds(raw: HyprBind[]): Map<string, BindEntry[]> {
  const groups = new Map<string, BindEntry[]>();

  for (const bind of raw) {
    if (bind.catch_all) continue;
    if (bind.mouse) continue; // skip pure mouse binds

    const parsed = parseDescription(bind);
    if (parsed.skip) continue;

    const submap = bind.submap || "default";
    if (!groups.has(submap)) groups.set(submap, []);
    const entries = groups.get(submap)!;

    if (parsed.spacer) {
      entries.push({ type: "spacer" });
    }
    if (parsed.heading) {
      entries.push({ type: "heading", label: parsed.heading, desc: parsed.text });
      continue;
    }

    const mods = getMods(bind.modmask);
    const key = getKeyLabel(bind.key);

    // Skip if key is empty and no mods (just a lone super/mod key acting as trigger)
    if (!key && mods.length === 0) continue;

    entries.push({ type: "bind", bind, mods, key, desc: parsed.text });
  }

  return groups;
}

// ─── Render ───────────────────────────────────────────────────────────────────

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

function renderBindRow(entry: BindEntry & { type: "bind" }): HTMLElement {
  const row = document.createElement("div");
  row.className = "bind-row";

  // Keys side
  const keys = document.createElement("div");
  keys.className = "bind-keys";

  for (const mod of entry.mods) {
    const pill = document.createElement("span");
    pill.className = `mod ${MOD_COLORS[mod] ?? "mod-other"}`;
    pill.textContent = mod;
    keys.appendChild(pill);
  }

  if (entry.key) {
    const keyEl = document.createElement("span");
    keyEl.className = "key";
    keyEl.textContent = entry.key;
    keys.appendChild(keyEl);
  }

  // Description side
  const desc = document.createElement("div");
  desc.className = "bind-desc";
  desc.textContent = entry.desc;

  row.appendChild(keys);
  row.appendChild(desc);
  return row;
}

function renderGroup(submap: string, entries: BindEntry[], showHeader = true): HTMLElement {
  const section = document.createElement("section");
  section.className = "submap-group";
  section.dataset.submap = submap;

  if (showHeader) {
    const header = document.createElement("h2");
    header.className = "submap-header";
    header.textContent = submap === "default" ? "Global" : submap;
    section.appendChild(header);
  }

  const grid = document.createElement("div");
  grid.className = "binds-list";

  for (const entry of entries) {
    if (entry.type === "spacer") {
      const spacer = document.createElement("div");
      spacer.className = "bind-spacer";
      grid.appendChild(spacer);
    } else if (entry.type === "heading") {
      const h = document.createElement("div");
      h.className = "bind-subheading";
      h.textContent = entry.label;
      grid.appendChild(h);
      if (entry.desc) {
        const row = renderBindRow({
          type: "bind",
          bind: {} as HyprBind,
          mods: [],
          key: "",
          desc: entry.desc,
        });
        grid.appendChild(row);
      }
    } else {
      grid.appendChild(renderBindRow(entry));
    }
  }

  section.appendChild(grid);
  return section;
}

function renderAll(groups: Map<string, BindEntry[]>): void {
  const container = document.getElementById("binds-container")!;
  container.innerHTML = "";

  // "default" / "global" first, then sorted rest
  const submaps = [...groups.keys()].sort((a, b) => {
    if (a === "default" || a === "global") return -1;
    if (b === "default" || b === "global") return 1;
    return a.localeCompare(b);
  });

  const singleGroup = submaps.length === 1;

  for (const submap of submaps) {
    const entries = groups.get(submap)!;
    if (entries.length === 0) continue;
    container.appendChild(renderGroup(submap, entries, !singleGroup));
  }
}

// ─── Search / filter ──────────────────────────────────────────────────────────

function applyFilter(query: string): void {
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll<HTMLElement>(".bind-row");

  rows.forEach((row) => {
    if (!q) {
      row.style.display = "";
      return;
    }
    const text = row.textContent?.toLowerCase() ?? "";
    row.style.display = text.includes(q) ? "" : "none";
  });

  // Hide empty submap headers
  document.querySelectorAll<HTMLElement>(".submap-group").forEach((section) => {
    const visible = section.querySelectorAll<HTMLElement>('.bind-row:not([style*="none"])');
    section.style.display = visible.length > 0 ? "" : "none";
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const groups = processBinds(bindsRaw as HyprBind[]);
renderAll(groups);

// Show bind count
const countEl = document.getElementById("count");
if (countEl) {
  let total = 0;
  groups.forEach((entries) => {
    total += entries.filter((e) => e.type === "bind").length;
  });
  countEl.textContent = `${total} binds`;
}

const searchEl = document.getElementById("search") as HTMLInputElement;
searchEl.addEventListener("input", () => applyFilter(searchEl.value));
