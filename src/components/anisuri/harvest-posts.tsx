import { ownsRequest } from "@/lib/demo/actions";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/demo/seed";
import { formatDate, formatQuantity, productName } from "@/lib/demo/format";
import { updateDemo, useDemoState } from "@/lib/demo/store";
import type { AssessmentRequest, ProductId } from "@/lib/demo/types";

const week = 7 * 86400000;
const fresh = (updated: string) => Date.now() - Date.parse(updated) < week;
const box = "surface-card my-4 space-y-3 p-4";
const input = "block w-full rounded-xl border border-input bg-card p-3";

export function DemandPanel({ trader = false }: { trader?: boolean }) {
  const state = useDemoState();
  const [crop, setCrop] = useState<ProductId>("corn");
  const entries = (state.demand ?? []).filter(item => item.product === crop && fresh(item.updated));
  const mine = entries.some(item => item.buyerId === state.traderBuyerId);
  function change(listed: boolean) {
    updateDemo(s => {
      const demand = (s.demand ?? []).filter(e => e.buyerId !== s.traderBuyerId || e.product !== crop);
      if (listed) demand.push({ buyerId: s.traderBuyerId, product: crop, updated: new Date().toISOString() });
      return { ...s, demand };
    });
  }
  return <section className={box}><h2 className="text-xl font-bold">Buyer demand this week</h2>
    <p>Local demo board. Buying notices expire after seven days and cover participating buyers only.</p>
    <label>Product<select className={input} value={crop} onChange={e => setCrop(e.target.value as ProductId)}>{PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {entries.length ? <ul>{entries.map(e => { const buyer = state.buyers.find(b => b.id === e.buyerId); return <li key={e.buyerId}>{buyer?.name} · {buyer?.municipality} · Updated {formatDate(e.updated)}</li>; })}</ul> : <p>No recent buying notices for this crop. Market demand is unknown.</p>}
    {trader && <Button onClick={() => change(!mine)}>{mine ? "Withdraw buying notice" : "List this crop as wanted"}</Button>}
  </section>;
}

export function FarmerPost({ post }: { post: AssessmentRequest }) {
  const state = useDemoState();
  function choose(buyerId: string, nextStep: AssessmentRequest["nextStep"]) {
    updateDemo(s => ({ ...s, requests: s.requests.map(r => r.id === post.id ? { ...r, buyerId, nextStep } : r) }));
  }
  return <section className={box}><Link to="/farmer/assessments" search={{}}>Back to My Assessments</Link>
    <h1 className="text-2xl font-bold">{productName(post.product)} · {formatQuantity(post)}</h1>
    <p>{post.condition} · {post.location}</p><p>{post.remarks}</p>
    {post.responses?.some(reply => !reply.seen) && <Button variant="outline" onClick={() => updateDemo(s => ({ ...s, requests: s.requests.map(r => r.id === post.id ? { ...r, responses: r.responses?.map(reply => ({ ...reply, seen: true })) } : r) }))}>Mark responses as read</Button>}
    <h2 className="font-bold">{post.responses?.length ?? 0} buyer responses</h2>
    {!post.responses?.length && <p>Your post is open. Buyers can respond here.</p>}
    {post.responses?.map(reply => <article key={reply.buyerId} className="rounded-xl border p-3">
      <h3 className="font-bold">{state.buyers.find(b => b.id === reply.buyerId)?.name}</h3>
      <p>{formatDate(reply.at)} · {reply.unavailable ? "Buyer unavailable" : reply.grade ? "Physical sample inspected" : "Post reviewed"}</p>
      {reply.grade && <p>Preliminary grade: {reply.grade}</p>}<p>{reply.note}</p>
      {!reply.unavailable && <Button variant="outline" onClick={() => choose(reply.buyerId, "deliver")}>Plan delivery with this buyer</Button>}
    </article>)}
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => choose("", "prepare")}>Prepare harvest further</Button>
    <Button variant="outline" onClick={() => choose("", "other-buyer")}>Wait for other buyers</Button></div>
    {post.nextStep && <p role="status">Your choice: {post.nextStep === "deliver" ? "Arrange delivery with " + state.buyers.find(b => b.id === post.buyerId)?.name : post.nextStep === "prepare" ? "Prepare harvest further" : "Wait for other buyers"}. You can change this choice.</p>}
  </section>;
}

export function TraderBoard() {
  const state = useDemoState();
  const posts = state.requests.filter(r => r.responses !== undefined);
  return <div><label>Demo buyer<select className={input} value={state.traderBuyerId} onChange={e => updateDemo(s => ({ ...s, traderBuyerId: e.target.value }))}>{state.buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
    <DemandPanel trader/><h1 className="text-2xl font-bold">Farmer posts</h1>
    {!posts.length && <p>New harvest posts will appear here.</p>}
    {posts.map(post => <ReplyForm key={post.id + state.traderBuyerId} post={post} buyerId={state.traderBuyerId}/>)}</div>;
}

function ReplyForm({ post, buyerId }: { post: AssessmentRequest; buyerId: string }) {
  const previous = post.responses?.find(r => r.buyerId === buyerId);
  const [note, setNote] = useState(previous?.note ?? "");
  const [unavailable, setUnavailable] = useState(Boolean(previous?.unavailable));
  const [grade, setGrade] = useState(previous?.grade ?? "");
  const [inspected, setInspected] = useState(Boolean(previous?.grade));
  return <form className={box} onSubmit={e => {
    e.preventDefault();
    if (!note.trim() || (inspected && !grade.trim())) return;
    const reply = { buyerId, unavailable, seen: false, note: note.trim(), grade: inspected ? grade.trim() : "", at: new Date().toISOString() };
    updateDemo(s => ({ ...s, requests: s.requests.map(r => r.id === post.id ? { ...r, responses: [...(r.responses ?? []).filter(v => v.buyerId !== buyerId), reply], status: reply.grade || r.responses?.some(v => v.buyerId !== buyerId && v.grade) ? "completed" : "pending" } : r) }));
  }}>
    <h2 className="font-bold">{productName(post.product)} · {formatQuantity(post)}</h2>
    <p>{post.farmerName} · {post.location}</p><p>{post.condition}</p><p>{post.remarks}</p>
    {post.photo && <img src={post.photo} alt="Farmer’s supporting photo" className="max-h-48"/>}
    <label>Your response<textarea className={input} required value={note} onChange={e => setNote(e.target.value)}/></label>
    <label className="block"><input type="checkbox" checked={unavailable} onChange={e => { setUnavailable(e.target.checked); if (e.target.checked) setInspected(false); }}/> Unable to take this harvest</label>
    <label className="block"><input type="checkbox" disabled={unavailable} checked={inspected} onChange={e => setInspected(e.target.checked)}/> I physically inspected a representative sample.</label>
    {inspected && <label>Preliminary grade<input className={input} required value={grade} onChange={e => setGrade(e.target.value)}/></label>}
    <Button type="submit">{previous ? "Update response" : "Send response to farmer"}</Button>
    {previous && <p role="status">Your latest response is visible to the farmer.</p>}
  </form>;
}

export function ResponseUpdates() {
  const state = useDemoState();
  const posts = state.requests.filter(r => ownsRequest(state, r) && r.responses?.some(reply => !reply.seen));
  if (!posts.length) return null;
  return <section className={box} aria-live="polite"><h2 className="font-bold">Buyer updates</h2>
    {posts.map(r => <Link key={r.id} className="block py-2 underline" to="/farmer/assessments/$requestId" params={{requestId:r.id}}>{productName(r.product)} · {r.id} · {r.responses?.filter(reply => !reply.seen).length} new buyer updates</Link>)}</section>;
}
