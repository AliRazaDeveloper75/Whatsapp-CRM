"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

const MESSAGES = [
  "🚫 Nice try — customer data doesn't leave this screen.",
  "🕵️ Caught you! That attempt just got logged.",
  "🙅 Copy/paste is switched off here on purpose.",
  "📋 Nothing to copy here — this is a no-copy zone.",
  "⚠️ Wrong activity recorded. Please don't do that again.",
];

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export function CopyGuard() {
  useEffect(() => {
    function report(action: "copy" | "right_click") {
      api.post("/violations/", { action, path: window.location.pathname }).catch(() => {});
    }

    function onCopy(e: ClipboardEvent) {
      e.preventDefault();
      window.alert(randomMessage());
      report("copy");
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      window.alert(randomMessage());
      report("right_click");
    }

    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  return null;
}
