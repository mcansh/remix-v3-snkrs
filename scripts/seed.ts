import { setTimeout } from "node:timers/promises";

console.time("seeding db")

console.time("doing some work")
await setTimeout(1_000)
console.timeLog("doing some work")

console.time("doing other work")
await setTimeout(1_000)
console.timeLog("doing other work")

console.timeEnd("seeding db")
