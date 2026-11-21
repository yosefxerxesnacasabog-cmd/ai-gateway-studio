import { useNavigate } from "@tanstack/react-router";
import { AudioLines, Loader2, Mic, MicOff, PhoneOff, Play, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useLiveVoice, type LiveEvent } from "@/hooks/use-live-voice";
import { getDemoState } from "@/lib/demo/store";
import type { ProductId } from "@/lib/demo/types";
import { buildVoiceContext } from "@/lib/demo/voice-context";
import { cn } from "@/lib/utils";

type Caption = { id: number; role: "user" | "assistant"; text: string };

type VoiceTarget = {
  page: "home" | "guide" | "buyers" | "buyer" | "request" | "assessments";
  product: ProductId | null;
  buyer_id: string | null;
};

type VoiceValue = ReturnType<typeof useLiveVoice> & {
  begin: () => void;
  captions: Caption[];
  working: boolean;
  open: boolean;
  dismiss: () => void;
};

const VoiceContext = createContext<VoiceValue | null>(null);

export function useVoiceHelper() {
  const value = useContext(VoiceContext);
  if (!value) throw new Error("useVoiceHelper must be used inside VoiceProvider");
  return value;
}

const isProduct = (v: unknown): v is ProductId => v === "corn" || v === "palay" || v === "rubber";

export function VoiceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [working, setWorking] = useState(false);
  const [open, setOpen] = useState(false);
  const nextId = useRef(1);

  const goTo = useCallback(
    (target: VoiceTarget) => {
      const product = isProduct(target.product) ? target.product : undefined;
      const buyerExists = Boolean(target.buyer_id && getDemoState().buyers.some((b) => b.id === target.buyer_id));
      const buyer = buyerExists && target.buyer_id ? target.buyer_id : undefined;
      switch (target.page) {
        case "guide":
          return navigate({ to: "/farmer/guide", search: { ...(product && { product }), ...(buyer && { buyer }) } });
        case "buyers":
          return navigate({ to: "/farmer/buyers", search: { ...(product && { product }) } });
        case "buyer":
          return buyer
            ? navigate({ to: "/farmer/buyers/$buyerId", params: { buyerId: buyer } })
            : navigate({ to: "/farmer/buyers", search: { ...(product && { product }) } });
        case "request":
          return navigate({ to: "/farmer/request", search: { ...(product && { product }), ...(buyer && { buyer }) } });
        case "assessments":
          return navigate({ to: "/farmer/assessments", search: {} });
        default:
          return navigate({ to: "/farmer" });
      }
    },
    [navigate],
  );

  const onEvent = useCallback(
    (event: LiveEvent) => {
      if (event.type === "session.input_transcript.delta" || event.type === "session.output_transcript.delta") {
        const delta = typeof event["delta"] === "string" ? event["delta"] : "";
        if (!delta) return;
        const role = event.type === "session.input_transcript.delta" ? "user" : "assistant";
        if (role === "assistant") setWorking(false);
        setCaptions((rows) => {
          const last = rows.at(-1);
          if (last && last.role === role) {
            return [...rows.slice(0, -1), { ...last, text: last.text + delta }];
          }
          return [...rows, { id: nextId.current++, role, text: delta }].slice(-8);
        });
      } else if (event.type === "app.delegation.pending") {
        setWorking(true);
      } else if (event.type === "app.navigate") {
        setWorking(false);
        const target = event["target"] as VoiceTarget | undefined;
        if (target && typeof target.page === "string") void goTo(target);
      } else if (event.type === "app.closed" || event.type === "app.stopping") {
        setWorking(false);
      }
    },
    [goTo],
  );

  const voice = useLiveVoice({ onEvent, startContext: () => buildVoiceContext(getDemoState()) });

  const begin = useCallback(() => {
    setCaptions([]);
    setWorking(false);
    setOpen(true);
    voice.start();
  }, [voice]);

  const value = useMemo<VoiceValue>(
    () => ({ ...voice, begin, captions, working, open, dismiss: () => setOpen(false) }),
    [voice, begin, captions, working, open],
  );

  return (
    <VoiceContext.Provider value={value}>
      {children}
      {/* Kept mounted for the whole visit so the call survives page changes. */}
      <audio ref={voice.audioRef} className="sr-only" aria-label="Voice helper audio" />
      <VoiceDock />
    </VoiceContext.Provider>
  );
}

function statusText(v: VoiceValue) {
  if (v.status === "connecting") return "Connecting… please allow the microphone.";
  if (v.status === "connected") return v.working ? "Looking that up…" : "Listening — speak anytime.";
  if (v.status === "stopping") return "Ending the call…";
  if (v.status === "closed") return "Call ended.";
  return "Ready.";
}

function VoiceDock() {
  const v = useVoiceHelper();
  if (!v.open) return null;
  const active = v.status === "connecting" || v.status === "connected" || v.status === "stopping";
  const recent = v.captions.slice(-3);
  return (
    <div
      role="region"
      aria-label="Voice helper"
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 md:inset-x-auto md:bottom-6 md:right-6 md:w-[24rem]"
    >
      <div className="surface-card shadow-lift p-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full",
              v.status === "connected" ? "bg-leaf-soft text-leaf-foreground" : "bg-muted text-muted-foreground",
            )}
            aria-hidden="true"
          >
            {v.status === "connecting" || v.working ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <AudioLines className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">AniSuri voice helper</p>
            <p role="status" className="text-sm text-muted-foreground">
              {statusText(v)}
            </p>
          </div>
          {!active && (
            <Button variant="ghost" size="icon" onClick={v.dismiss} aria-label="Close voice helper">
              <X />
            </Button>
          )}
        </div>

        {recent.length > 0 && (
          <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-base" aria-live="polite">
            {recent.map((c) => (
              <li key={c.id} className={cn(c.role === "user" ? "text-muted-foreground" : "text-foreground")}>
                <span className="font-bold">{c.role === "user" ? "You: " : "Helper: "}</span>
                {c.text}
              </li>
            ))}
          </ul>
        )}

        {v.error && (
          <p role="alert" className="mt-3 rounded-lg bg-status-unavailable px-3 py-2 text-sm font-semibold text-status-unavailable-foreground">
            {v.error}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {v.playbackBlocked && (
            <Button size="sm" onClick={v.resumePlayback}>
              <Play /> Play voice
            </Button>
          )}
          {active ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={v.status !== "connected"}
                onClick={() => v.setMuted(!v.muted)}
                aria-pressed={v.muted}
              >
                {v.muted ? <MicOff /> : <Mic />}
                {v.muted ? "Unmute" : "Mute"}
              </Button>
              <Button size="sm" variant="destructive" disabled={v.status === "stopping"} onClick={v.stop}>
                <PhoneOff /> End call
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={v.begin}>
              <Mic /> Talk again
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">AI voice helper. It cannot grade your harvest or promise a price.</p>
      </div>
    </div>
  );
}

export function VoiceLauncher({ className }: { className?: string }) {
  const v = useVoiceHelper();
  const active = v.status === "connecting" || v.status === "connected" || v.status === "stopping";
  return (
    <div className={cn("surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center", className)}>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-foreground" aria-hidden="true">
        <Mic className="size-6" />
      </span>
      <div className="flex-1">
        <p className="text-lg font-bold">Talk to the voice helper</p>
        <p className="text-muted-foreground">
          Speak in your own language. The helper asks if you want the grading guide or an assessment, then opens the page.
        </p>
      </div>
      <Button size="lg" onClick={v.begin} disabled={active} className="sm:shrink-0">
        <Mic /> {active ? "Call in progress" : "Start talking"}
      </Button>
    </div>
  );
}
