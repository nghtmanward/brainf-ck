# BRAINF*CK
### A Developer Horror Puzzle Game

> Started with flowers. Ended in assembly. Sanity unconfirmed.

---

## What is this?

BRAINF*CK is a developer horror puzzle game built in Electron where each zone
is a different programming language. You upload a selfie at the start. It gets
corrupted a little more with every zone you complete. By the time you reach
Assembly, you won't recognize yourself.

The world starts beautiful. It doesn't stay that way.

---

## Zones

| Zone | Language | Runtime | Puzzles | World State |
|------|----------|---------|---------|-------------|
| 1 | Python | Pyodide (WASM) | 3 | Perfect. Suspicious. |
| 2 | Lua | Fengari (WASM) | 4 | First cracks appear |
| 3 | SQL | sql.js (WASM) | 4 | Rows of reality go missing |
| 4 | Rust | Simulated | 5 | Things get taken away |
| 5 | C++ | Simulated | 5 | Memory leaks. World deteriorates. |
| 6 | Brainf*ck | JS Interpreter | ? | Absolute chaos |
| 7 | Assembly | JS x86 | 1 | Black void. Just registers. |

---

## How it works

- Each zone runs a real language interpreter in the browser via WASM
- Puzzles are sourced from real technical interviews
- Your selfie is manipulated via HTML Canvas — differently per zone
- Solve everything. Restore the world. See what's left of your face.

---

## Tech Stack

- Electron
- Pyodide v0.27.0 (Python WASM)
- Fengari (Lua WASM) — in progress
- sql.js (SQL WASM) — in progress
- HTML Canvas (selfie corruption)
- Web Audio API (horror soundtrack) — in progress
- No backend. All client-side.

---

## Current Status

- [x] Electron shell
- [x] Title screen + selfie upload
- [x] Python zone (real Python via Pyodide)
- [x] Sanity + corruption system
- [x] World scene reactions
- [ ] Lua zone
- [ ] SQL zone
- [ ] Rust zone
- [ ] C++ zone
- [ ] Brainf*ck zone
- [ ] Assembly zone
- [ ] Horror soundtrack
- [ ] End screen (original vs corrupted selfie)

---

## Contributing

The game needs:
- **Puzzle writers** — real interview-style puzzles for each language zone
- **UI/UX** — the world scene needs more horror as zones progress
- **Audio** — Web Audio API soundtrack that degrades with each zone
- **Corruption artists** — selfie manipulation algorithms per zone

Each zone is self-contained. Pick a language you know, find the zone file,
build it out.

### Getting Started

```bash
git clone https://github.com/nghtmanward/brainf-ck.git
cd brainf-ck
npm install
npm start
```

### Zone file structure
Each zone lives in `/zones` written in its own language as reference.
Puzzle logic lives in `renderer.js` in the matching PUZZLES array.

---

## The Resume Line

> BRAINF*CK — A developer horror puzzle game. Built across every major
> programming language. Started with flowers. Ended in assembly.
> Lost [X] months of my life. Sanity unconfirmed.

---

## License

MIT — do whatever you want with it. Just don't blame us for the nightmares.