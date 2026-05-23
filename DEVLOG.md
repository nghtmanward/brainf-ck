# BRAINFUCK — Developer Horror Puzzle Game
## Project Summary & Build Status

---

## Concept
A developer puzzle game where each zone is a different programming language.
The player uploads a selfie at the start which gets progressively corrupted as
they advance through zones. The world starts beautiful and perfect, slowly
descending into horror as the languages get harder, ending in a void with
Assembly as the final boss. Completing the game restores the world and shows
the player their original selfie next to the destroyed version.

---

## Current Build Status
- Electron shell: WORKING
- Title screen: WORKING
- Selfie upload + canvas: WORKING
- Zone/sanity/corruption HUD: WORKING
- Python zone (Pyodide WASM): WORKING — real Python executes
- Puzzle routing (runCode): WORKING
- World scene reactions: WORKING
- Selfie corruption per puzzle: WORKING

---

## File Structure
brainfuck-game/
zones/
python.py       ← puzzle reference (zone written in its own language)
lua.lua
sql.sql
rust.rs
cpp.cpp
brainfuck.bf
assembly.asm
index.html        ← all CSS + HTML structure
main.js           ← Electron window setup
preload.js        ← context bridge (required for Pyodide CDN)
renderer.js       ← all game logic, state, puzzle engine
package.json

---

## Zone Map

| # | Zone | Runtime | Puzzles | World State |
|---|------|---------|---------|-------------|
| 1 | Python | Pyodide (WASM) | 3 | Perfect, beautiful, suspicious |
| 2 | Lua | Fengari (WASM) | 4 | First real cracks |
| 3 | SQL | sql.js (WASM) | 4 | Rows of reality missing |
| 4 | Rust | Simulated/Playground API | 5 | Things physically taken away |
| 5 | C++ | Simulated | 5 | Memory leaking, world deteriorating |
| 6 | Brainfuck | JS interpreter (~50 lines) | ? | Absolute chaos, unknown count |
| 7 | Assembly | JS x86 interpreter | 1 | Black void, just registers |

---

## Selfie Corruption Per Zone
- Python: barely changes (~8% per puzzle, noise)
- Lua: slight fragmentation
- SQL: only certain rows of pixels return
- Rust: starts fragmenting, pieces taken away
- C++: heavy deterioration
- Brainfuck: absolute chaos, barely recognizable
- Assembly: grid of raw pixel values
- Final screen: "You have been BRAINFUCKed" — original vs final selfie

---

## Narrative Arc
- Start: Beautiful 3D world, flowers, soft music, easy puzzles
- Early signs: Things disappear when you look away, wrong notes in music
- Middle: World desaturates, glitches, crumbles, selfie corrupts
- Brainfuck: World barely recognizable, puzzles feel insane but have a pattern
- Assembly: Black void, just registers and memory addresses
- Resolution: Solve it, world snaps back, credits roll

---

## Puzzle Sourcing Plan
Solve puzzles yourself first, then paste them in.
Sources: LeetCode, HackerRank, Advent of Code, Interview Cake, GeeksforGeeks

### Puzzle count increases with difficulty:
- Python: 3 puzzles
- Lua: 4 puzzles
- SQL: 4 puzzles
- Rust: 5 puzzles
- C++: 5 puzzles
- Brainfuck: ? (unknown to player, progress dots show ???)
- Assembly: 1 (the final boss)

### Each puzzle needs:
- prompt — question shown to player
- hint — input being tested
- testCall — expression the runtime evaluates
- check — JS function that reads result and passes/fails
- narrative — world reaction text shown after solve

---

## Tech Stack
- Electron (desktop shell)
- Pyodide v0.27.0 via CDN (Python WASM)
- Fengari via CDN (Lua WASM) — NOT YET WIRED
- sql.js via CDN (SQL WASM) — NOT YET WIRED
- HTML Canvas (selfie corruption)
- Web Audio API (horror music) — NOT YET BUILT
- No backend, all client-side state

---

## Next Build Steps (in order)
1. Source and solve puzzles for each zone
2. Paste finalized Python puzzles into PUZZLES array in renderer.js
3. Wire Fengari for Lua zone + add runLua()
4. Wire sql.js for SQL zone + add runSQL()
5. Build variable puzzle count system + ??? mechanic for Brainfuck
6. Build selfie corruption algorithms per zone (row delete, fragmentation etc)
7. Add Web Audio API horror music layer
8. Build Assembly zone (black void UI, register display)
9. Build end screen (original vs corrupted selfie comparison)
10. Build Brainfuck interpreter (~50 lines JS)

---

## UI Fixes Needed
- Selfie display too small (currently 40x40 mini canvas)
- Needs to be large enough to see corruption clearly
- Consider a dedicated selfie panel on the left side of the game screen
- Show original vs current side by side in later zones

---

## Resume Line
BRAINFUCK — A developer horror puzzle game. Built across every major
programming language. Started with flowers. Ended in assembly.
Lost [X] months of my life. Sanity unconfirmed.