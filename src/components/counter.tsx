"use client";

import type { Remix } from "@remix-run/dom";
import { press } from "@remix-run/events/press";
import { Button } from "@remix-run/library/button";

export function Counter(this: Remix.Handle) {
  let count = 0;

  const pressIncrement = press(() => {
    count++;
    this.update();
  });

  return () => {
    return (
      <Button on={pressIncrement}>
        Count: <span>{count}</span>
      </Button>
    );
  };
}
