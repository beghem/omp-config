import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const KEY = "copilot-usage";
const POLL_MS = 5 * 60 * 1000;

interface Limit {
	label?: string;
	window?: { resetsAt?: number };
	amount?: { used?: number; limit?: number; usedFraction?: number };
}

function fmtReset(ms: number): string {
	const mins = Math.max(0, Math.round(ms / 60000));
	const d = Math.floor(mins / 1440);
	const h = Math.floor((mins % 1440) / 60);
	return d > 0 ? `${d}d${h}h` : `${h}h${mins % 60}m`;
}

async function fetchText(pi: ExtensionAPI): Promise<string | undefined> {
	const r = await pi.exec("omp", ["usage", "--json", "-p", "github-copilot", "--no-extensions"], { timeout: 30000 });
	if (r.code !== 0) return undefined;
	const limits: Limit[] = JSON.parse(r.stdout).reports?.[0]?.limits ?? [];
	const l = limits.find(x => x.amount?.usedFraction !== undefined);
	if (!l?.amount) return undefined;
	const pct = Math.round((l.amount.usedFraction ?? 0) * 1000) / 10;
	const parts = [`Copilot ${pct}%`];
	if (l.amount.used !== undefined && l.amount.limit) parts.push(`${l.amount.used}/${l.amount.limit}`);
	if (l.window?.resetsAt) parts.push(`reset ${fmtReset(l.window.resetsAt - Date.now())}`);
	return parts.join(" · ");
}

export default function copilotUsage(pi: ExtensionAPI) {
	let timer: ReturnType<typeof setInterval> | undefined;
	pi.on("session_start", async (_event, ctx) => {
		const update = async () => {
			try {
				ctx.ui.setStatus(KEY, await fetchText(pi));
			} catch {
				ctx.ui.setStatus(KEY, undefined);
			}
		};
		void update();
		timer = setInterval(update, POLL_MS);
	});
	pi.on("session_shutdown", async () => {
		if (timer) clearInterval(timer);
	});
}
