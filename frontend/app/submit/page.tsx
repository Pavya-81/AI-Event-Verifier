'use client';
import {useState, useEffect} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001/api';
export default function Submit(){const [msg,setMsg]=useState('');const [loading,setLoading]=useState(false);const [myEvents,setMyEvents]=useState<any[]>([]);const [form,setForm]=useState({title:'',description:'',category:'Workshop',eventDate:'2026-09-20',startTime:'10:00',endTime:'12:00',venue:'',location:'',registrationUrl:'',contactEmail:'organizer@eventshield.ai',contactPhone:''});const set=(k:string,v:string)=>setForm({...form,[k]:v});
  const fetchMyEvents = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API}/my/events`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r=>r.json()).then(data => { if(Array.isArray(data)) setMyEvents(data); }).catch(console.error);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  async function submit(e:any) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const authToken = localStorage.getItem('token');
    if(!authToken){
      setMsg('Please login as organizer first. Demo: organizer@eventshield.ai / Demo123!');
      setLoading(false);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    const file = e.target.poster.files[0];
    if(file) fd.append('poster',file);
    try {
      const r = await fetch(`${API}/events`, {method:'POST', headers:{Authorization:`Bearer ${authToken}`}, body:fd});
      const d = await r.json();
      if(!r.ok){
        setMsg(d.message || 'Submission failed');
        setLoading(false);
        return;
      }
      const eventId = d.event?.id || d.id;
      setMsg('Event submitted. Running AI verification...');
      const vr = await fetch(`${API}/events/${eventId}/verify`, {method:'POST', headers:{Authorization:`Bearer ${authToken}`}});
      const vd = await vr.json();
      if(!vr.ok){
        setMsg(vd.message || 'Verification failed');
        setLoading(false);
        return;
      }
      setMsg(`Submitted. Quality ${vd.qualityScore}/100 · Trust ${vd.trustScore}/100 · ${vd.recommendation}`);
      fetchMyEvents();
    } catch(err:any) {
      setMsg(err.message || 'Network error');
    }
    setLoading(false);
  }

  return <main className="min-h-screen bg-[#070b14] p-6 text-white"><div className="mx-auto max-w-3xl"><a href="/" className="text-sm text-indigo-300">← Back to events</a><h1 className="mt-8 text-4xl font-black">Submit an Event</h1><p className="mt-2 text-slate-500">Submit an event and run the verification pipeline.</p><form onSubmit={submit} className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/[.03] p-7 md:grid-cols-2">{[['title','Event title'],['category','Category'],['eventDate','Date'],['startTime','Start time'],['endTime','End time'],['venue','Venue'],['location','Location'],['registrationUrl','Registration URL'],['contactEmail','Contact email'],['contactPhone','Contact phone']].map(([k,l])=><label key={k} className="text-sm text-slate-400">{l}<input required={['title','category','eventDate','startTime','endTime','venue','location','contactEmail'].includes(k)} type={k==='eventDate'?'date':k.includes('Time')?'time':'text'} value={(form as any)[k]} onChange={e=>set(k,e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-400"/></label>)}<label className="text-sm text-slate-400 md:col-span-2">Description<textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-400"/></label><label className="text-sm text-slate-400 md:col-span-2">Event poster<input name="poster" type="file" accept="image/*" className="mt-2 block w-full rounded-xl border border-dashed border-white/15 p-4 text-sm"/></label><button disabled={loading} className="rounded-xl bg-indigo-500 px-5 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50 md:col-span-2">{loading?'Verifying…':'Submit & Verify Event'}</button>{msg&&<div className="rounded-xl bg-indigo-500/10 p-4 text-sm text-indigo-200 md:col-span-2">{msg}</div>}</form>

{myEvents.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-6">My Submissions</h2>
    <div className="grid gap-4">
      {myEvents.map(ev => (
        <div key={ev.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{ev.title}</h3>
              <div className="text-sm text-slate-400">{new Date(ev.createdAt).toLocaleDateString()}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${ev.status==='APPROVED'?'bg-emerald-500/20 text-emerald-300':ev.status==='CHANGES_REQUESTED'?'bg-amber-500/20 text-amber-300':ev.status==='REJECTED'?'bg-rose-500/20 text-rose-300':'bg-white/10 text-slate-300'}`}>
              {ev.status.replace('_', ' ')}
            </div>
          </div>
          
          {ev.status === 'CHANGES_REQUESTED' && (
            <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="text-sm font-bold text-amber-400 mb-1">Admin Requested Changes:</div>
              <div className="text-sm text-amber-200">{ev.submissions?.[0]?.adminNote || 'Please check your event details and update.'}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

</div></main>}
