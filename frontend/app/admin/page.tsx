"use client";

import { useEffect, useState } from "react";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function Admin() {
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || user?.role !== "ADMIN") {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API}/admin/queue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError(data.message || "Unable to load admin queue.");
        window.location.href = "/login";
        return;
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
      setError("Unable to connect to the EventShield API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function action(id: string, actionName: string) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/events/${id}/action`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: actionName,
          note: adminNote
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Action failed.");
        return;
      }

      const data = await response.json();
      if (actionName === 'request_changes') {
        if (data.emailSent) {
          alert("Changes requested. Organizer notification sent.");
        } else if (data.emailError) {
          alert(`Changes requested, but failed to send email: ${data.emailError}`);
        } else {
          alert("Changes requested.");
        }
      }

      setSelected(null);
      setAdminNote("");
      await load();
    } catch (err) {
      console.error(err);
      alert("Unable to complete the action.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="text-sm text-indigo-300 hover:text-indigo-200"
        >
          ← Event discovery
        </a>

        <div className="mt-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[.2em] text-indigo-300">
              Admin Console
            </div>

            <h1 className="mt-2 text-4xl font-black">
              Verification Queue
            </h1>
          </div>

          <button
            onClick={load}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card n={events.length} t="Pending" />

          <Card
            n={
              events.filter(
                (e) => e.verification?.riskLevel === "HIGH"
              ).length
            }
            t="High risk"
          />

          <Card
            n={
              events.filter(
                (e) => e.verification?.riskLevel === "MEDIUM"
              ).length
            }
            t="Manual review"
          />

          <Card
            n={
              events.filter(
                (e) =>
                  (e.verification?.duplicateResult
                    ?.duplicateProbability || 0) >= 65
              ).length
            }
            t="Possible duplicates"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading verification queue...
            </div>
          ) : events.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-lg font-semibold">
                No pending events
              </div>

              <p className="mt-2 text-sm text-slate-500">
                New organizer submissions will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-500">
                <tr>
                  <th className="p-4">Event</th>
                  <th>Quality</th>
                  <th>Trust</th>
                  <th>Risk</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-t border-white/5"
                  >
                    <td className="p-4">
                      <div className="font-semibold">
                        {event.title}
                      </div>

                      <div className="text-xs text-slate-600">
                        {event.organizer?.organizationName ||
                          "Unknown organizer"}
                      </div>
                    </td>

                    <td>
                      {event.verification?.qualityScore ?? "—"}
                    </td>

                    <td>
                      {event.verification?.trustScore ?? "—"}
                    </td>

                    <td>
                      {event.verification?.riskLevel ?? "—"}
                    </td>

                    <td>
                      {event.verification?.recommendation
                        ?.replaceAll("_", " ") ?? "—"}
                    </td>

                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(event)}
                          className="rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() =>
                            action(event.id, "approve")
                          }
                          className="rounded-lg bg-emerald-500/15 px-3 py-2 text-emerald-300 hover:bg-emerald-500/25"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5"
            onClick={() => setSelected(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/10 bg-[#101827] p-7"
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-indigo-300">
                    Verification Report
                  </div>

                  <h2 className="mt-2 text-2xl font-bold">
                    {selected.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Score label="Quality" value={selected.verification?.qualityScore}/>
                <Score label="Trust" value={selected.verification?.trustScore}/>
                <Score label="Confidence" value={selected.verification?.confidence}/>
                <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/10 p-5 border border-white/10">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Level</div>
                  <div className={`mt-2 text-2xl font-black ${selected.verification?.riskLevel==='LOW'?'text-emerald-400':selected.verification?.riskLevel==='MEDIUM'?'text-amber-400':'text-rose-400'}`}>{selected.verification?.riskLevel}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-300">AI Recommendation: {selected.verification?.recommendation?.replace('_',' ')}</div>
                <p className="mt-3 text-lg leading-relaxed text-indigo-100">{selected.verification?.summary}</p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <AgentCard title="Description Agent" data={selected.verification?.descriptionResult} color="blue"/>
                <AgentCard title="Poster Agent" data={selected.verification?.imageResult} color="purple"/>
                <AgentCard title="URL Agent" data={selected.verification?.urlResult} color="emerald"/>
              </div>

              {selected.verification?.findings?.length > 0 && (
                <div className="mt-8 rounded-2xl bg-white/5 p-6 border border-white/10">
                  <h3 className="font-bold text-xl text-white flex items-center gap-2">Key Findings</h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selected.verification.findings.map((f:any,i:number)=>(
                      <div key={i} className="flex gap-3 rounded-xl bg-black/40 p-4 text-sm border-l-4 border-l-rose-500">
                        <div>
                          <div className="font-semibold text-slate-200 capitalize">{f.source} Issue ({f.severity.toUpperCase()})</div>
                          <div className="text-slate-400 mt-1">{f.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-white/5 p-5 border border-white/10">
                <div className="font-semibold">AI Advisor</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {selected.verification?.recommendation === "APPROVE"
                    ? "The event is ready for publication based on the current verification signals."
                    : "Review the highlighted findings and correct the event information before publication."}
                </p>
              </div>

              <div className="mt-6">
                <label className="text-sm font-semibold text-slate-300">Admin Note (Required for Request Changes)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Explain what the organizer needs to fix..."
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="mt-8 flex gap-3 border-t border-white/10 pt-6">
                <button
                  onClick={() => action(selected.id, "approve")}
                  className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    if (!adminNote.trim()) {
                      alert("Please provide an Admin Note before requesting changes.");
                      return;
                    }
                    action(selected.id, "request_changes");
                  }}
                  className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-black"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => action(selected.id, "reject")}
                  className="rounded-xl bg-rose-500 px-5 py-3 font-bold text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ n, t }: { n: number; t: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <div className="text-3xl font-black">{n}</div>
      <div className="mt-1 text-sm text-slate-500">{t}</div>
    </div>
  );
}

function Score({ label, value }: { label: string; value?: number }) {
  const num = value || 0;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/10 p-5 border border-white/10">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value ?? "—"}<span className="text-lg text-slate-500 font-normal">/100</span></div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-black/40 overflow-hidden"><div className={`h-full rounded-full ${num>=80?'bg-emerald-500':num>=60?'bg-amber-500':'bg-rose-500'}`} style={{width:`${num}%`}}/></div>
    </div>
  );
}

function AgentCard({title,data,color}:{title:string,data:any,color:string}){
  const colorMap:any = {blue:'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',purple:'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',emerald:'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400'};
  if(!data) return null;
  return (
    <div className={`rounded-2xl bg-gradient-to-b ${colorMap[color]} p-5 border shadow-lg`}>
      <div className="font-bold text-lg text-white">{title}</div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/20 p-3"><div className="text-xs text-slate-400">Quality</div><div className="text-xl font-bold text-white mt-1">{data.qualityScore ?? 0}</div></div>
        <div className="rounded-xl bg-black/20 p-3"><div className="text-xs text-slate-400">Trust</div><div className="text-xl font-bold text-white mt-1">{data.trustScore ?? 0}</div></div>
      </div>
      <div className="mt-4 space-y-2 text-sm">{data.issues?.length > 0 ? <div className="rounded-xl bg-rose-500/10 p-3 text-rose-300 text-xs"><b>Issues:</b><ul className="list-disc pl-4 mt-1">{data.issues.map((i:string,idx:number)=><li key={idx}>{i}</li>)}</ul></div> : <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-300 text-xs flex items-center gap-2">No issues detected</div>}</div>
    </div>
  );
}