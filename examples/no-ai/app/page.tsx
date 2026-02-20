"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  ValidationProvider,
} from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry, actionHandlers, onConfetti } from "@/lib/render/registry";
import { examples } from "@/lib/examples";

function SpecRenderer({ spec }: { spec: Spec }): ReactNode {
  return (
    <StateProvider initialState={spec.state ?? {}}>
      <VisibilityProvider>
        <ActionProvider handlers={actionHandlers}>
          <ValidationProvider>
            <Renderer spec={spec} registry={registry} />
          </ValidationProvider>
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}

export default function Page() {
  const [selectedIndex] = useState(0);
  const selected = examples[selectedIndex]!;
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  const fireConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
    setConfettiActive(true);
  }, []);

  useEffect(() => onConfetti(fireConfetti), [fireConfetti]);

  return (
    <div className="h-screen flex items-center justify-center bg-muted/30">
      <div
        className="relative bg-background border rounded-lg shadow-sm"
        style={{ width: 960, height: 1080 }}
      >
        {confettiActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <ConfettiExplosion
              key={confettiKey}
              portal={false}
              force={0.8}
              duration={3500}
              particleCount={400}
              particleSize={8}
              colors={["#00F0FF", "#7B61FF", "#FF3DFF", "#00FF94", "#FFE14D"]}
              width={1600}
              height="200vh"
              zIndex={1}
              onComplete={() => setConfettiActive(false)}
            />
          </div>
        )}
        <div className="h-full overflow-auto p-6 flex items-center justify-center relative z-10">
          <SpecRenderer key={selectedIndex} spec={selected.spec} />
        </div>
      </div>
    </div>
  );
}
