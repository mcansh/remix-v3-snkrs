"use client";

import type { Remix } from "@remix-run/dom";
import { press } from "@remix-run/events/press";
import { Button } from "@remix-run/library/button";
import confetti from "canvas-confetti";

export function Counter(this: Remix.Handle) {
  let count = 0;

  const pressIncrement = press(() => {
    count++;
    this.update();
    confetti();
  });

  return () => {
    return (
      <Button on={pressIncrement}>
        Count: <span>{count}</span>
      </Button>
    );
  };
}
