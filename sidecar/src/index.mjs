// Long-lived image conversion service. The Tauri app spawns this once and
// talks to it over newline-delimited JSON on stdin/stdout.
//
// Chosen over a localhost HTTP server on purpose: no TCP port means no Windows
// Defender / macOS firewall prompt on first launch, no port collisions, and no
// auth token to invent. The child also dies with the parent.
//
// RULE: stdout carries protocol frames and nothing else. Anything written there
// by accident corrupts the stream, so console.log is redirected to stderr below
// before any other module gets a chance to run.
console.log = console.error;
console.info = console.error;
console.debug = console.error;

import readline from "node:readline";
import { convert, extensionFor, versions } from "./convert.mjs";

process.title = "pixel-flow-sidecar";

/** One JSON object per line. */
function send(payload) {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

async function handle(message) {
  const { id, op } = message;

  switch (op) {
    case "ping":
      return { id, ok: true, op: "pong" };

    case "versions":
      return { id, ok: true, ...versions() };

    case "convert": {
      const result = await convert(message);
      return { id, ok: true, ...result };
    }

    case "extension":
      return { id, ok: true, extension: extensionFor(message.format) };

    default:
      throw new Error(`Unknown op: ${op}`);
  }
}

let inFlight = 0;
let stdinClosed = false;

function exitWhenDrained() {
  if (stdinClosed && inFlight === 0) process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let message;
  try {
    message = JSON.parse(trimmed);
  } catch (error) {
    send({ id: null, ok: false, error: `Bad JSON frame: ${error.message}` });
    return;
  }

  // Deliberately not awaited: several conversions run concurrently and each
  // reply carries its own id, so the app can correlate out-of-order responses.
  inFlight += 1;
  handle(message)
    .then(send)
    .catch((error) => {
      send({
        id: message.id ?? null,
        ok: false,
        error: error?.message ?? String(error),
      });
    })
    .finally(() => {
      inFlight -= 1;
      exitWhenDrained();
    });
});

// Without this the process lingers after the app quits, holding ~60 MB RSS.
// Drain first, so a one-shot `echo ... | sidecar` still gets its reply rather
// than racing the exit.
rl.on("close", () => {
  stdinClosed = true;
  exitWhenDrained();
});
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

// Announce readiness once sharp has actually loaded libvips: this line failing
// to appear is the signal that the native module could not be resolved.
try {
  send({ op: "ready", ...versions() });
} catch (error) {
  send({ op: "fatal", error: error?.message ?? String(error) });
  process.exit(1);
}
