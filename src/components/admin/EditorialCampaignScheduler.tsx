import { useMemo, useState } from "react";
import { CalendarClock, Check, Loader2, X } from "lucide-react";
import "./editorial-campaign.css";

type CampaignItem = Record<string, any>;
type ReviewState = "idle" | "checking" | "ready" | "conflict" | "scheduling" | "done";

const API = "/api/admin/content";
const CAMPAIGN = "/content/editorial-campaign-nov-2026.json";
const dubaiDate = (value: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date(value));
const titleKey = (value: string) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default function EditorialCampaignScheduler() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ReviewState>("idle");
  const [campaign, setCampaign] = useState<CampaignItem[]>([]);
  const [message, setMessage] = useState("");
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [created, setCreated] = useState(0);

  const ordered = useMemo(() => [...campaign].sort((a, b) => a.publishDate.localeCompare(b.publishDate)), [campaign]);
  const openReview = async () => {
    setOpen(true);
    setState("checking");
    setMessage("");
    setConflicts([]);
    setCreated(0);
    try {
      const [campaignResponse, firstPageResponse] = await Promise.all([
        fetch(CAMPAIGN, { cache: "no-store" }),
        fetch(`${API}?page=1&limit=50`, { credentials: "include", cache: "no-store" }),
      ]);
      if (!campaignResponse.ok) throw new Error("The campaign file could not be loaded.");
      const entries: CampaignItem[] = await campaignResponse.json();
      const firstPage = await firstPageResponse.json().catch(() => ({}));
      if (!firstPageResponse.ok || !firstPage.success) throw new Error(firstPage.message || "Could not check the live content schedule. Please sign in to the admin and try again.");
      const pages = Math.max(1, Number(firstPage.pages) || 1);
      const remaining = await Promise.all(Array.from({ length: pages - 1 }, (_, index) =>
        fetch(`${API}?page=${index + 2}&limit=50`, { credentials: "include", cache: "no-store" }).then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success) throw new Error(data.message || "Could not read all scheduled content.");
          return data.items || [];
        }),
      ));
      const existing: CampaignItem[] = [...(firstPage.items || []), ...remaining.flat()];
      const problems: string[] = [];
      for (const item of entries) {
        const date = dubaiDate(item.publishDate);
        if (existing.some((entry) => entry.status === "scheduled" && entry.publishDate && dubaiDate(entry.publishDate) === date)) {
          problems.push(`${date}: another post is already scheduled`);
        }
        if (existing.some((entry) => entry.type === item.type && (entry.slug === item.slug || titleKey(entry.title) === titleKey(item.title)))) {
          problems.push(`${date}: “${item.title}” matches existing ${item.type} content`);
        }
      }
      setCampaign(entries);
      setConflicts([...new Set(problems)]);
      if (entries.length !== 15) throw new Error(`Expected 15 posts but found ${entries.length}.`);
      if (problems.length) {
        setMessage("The live content library has conflicts on the dates or titles below. No content has been scheduled.");
        setState("conflict");
      } else {
        setMessage("No duplicate titles or occupied publishing dates found. Review the plan, then schedule all 15 posts.");
        setState("ready");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not prepare the campaign.");
      setState("conflict");
    }
  };

  const schedule = async () => {
    if (campaign.length !== 15 || state !== "ready") return;
    setState("scheduling");
    setMessage("");
    let count = 0;
    try {
      for (const item of ordered) {
        const response = await fetch(API, {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(`${item.title}: ${data.message || "Could not schedule post"}`);
        count += 1;
        setCreated(count);
      }
      setMessage("All 15 posts are scheduled at 10:00 AM Dubai time, from 12 to 26 November 2026.");
      setState("done");
    } catch (error) {
      setMessage(`${count} post${count === 1 ? "" : "s"} scheduled before an error. ${error instanceof Error ? error.message : "Please review the content library before retrying."}`);
      setCreated(count);
      setState("conflict");
    }
  };

  return <>
    <button type="button" className="cms-secondary-button" onClick={() => void openReview()} disabled={state === "scheduling"}>
      <CalendarClock size={16}/> Review 15-day campaign
    </button>
    {open && <div className="editorial-campaign-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && state !== "scheduling") setOpen(false); }}>
      <section className="editorial-campaign-dialog" role="dialog" aria-modal="true" aria-labelledby="editorial-campaign-title">
        <header className="editorial-campaign-head">
          <div><span className="cms-kicker">EDITORIAL CALENDAR</span><h2 id="editorial-campaign-title">15 posts, 15 days</h2><p>One post each day at 10:00 AM Dubai time, starting 12 November 2026.</p></div>
          <button type="button" className="editorial-campaign-close" aria-label="Close campaign review" onClick={() => setOpen(false)} disabled={state === "scheduling"}><X size={19}/></button>
        </header>
        <div className="editorial-campaign-status" role="status">
          {state === "checking" || state === "scheduling" ? <Loader2 size={16} className="cms-spin"/> : state === "done" ? <Check size={16}/> : null}
          <span>{state === "checking" ? "Checking existing content and publishing dates…" : state === "scheduling" ? `Scheduling post ${created + 1} of 15…` : message}</span>
        </div>
        {conflicts.length > 0 && <ul className="editorial-campaign-conflicts">{conflicts.map((item) => <li key={item}>{item}</li>)}</ul>}
        <div className="editorial-campaign-list">
          {ordered.map((item) => <article className="editorial-campaign-item" key={item.slug}>
            <img src={item.featuredImage} alt={item.altText || ""}/>
            <div><time>{new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.publishDate))} · 10:00</time><span className={`cms-type ${item.type}`}>{item.type === "tip" ? "Tip" : item.type === "news" ? "News" : "Blog"}</span><h3>{item.title}</h3><p>{item.tags?.slice(0, 3).join(" · ")}</p></div>
          </article>)}
        </div>
        <footer className="editorial-campaign-actions">
          <button type="button" className="cms-secondary-button" onClick={() => setOpen(false)} disabled={state === "scheduling"}>{state === "done" ? "Close" : "Cancel"}</button>
          {state === "idle" && <button type="button" className="cms-primary-button" onClick={() => void openReview()}>Check live schedule</button>}
          {state === "ready" && <button type="button" className="cms-primary-button" onClick={() => void schedule()}>Schedule all 15 posts</button>}
          {state === "conflict" && <button type="button" className="cms-primary-button" onClick={() => void openReview()}>Check again</button>}
          {state === "done" && <span className="editorial-campaign-complete"><Check size={16}/> 15 scheduled</span>}
        </footer>
      </section>
    </div>}
  </>;
}
