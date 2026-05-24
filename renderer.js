const state = {
  selfieLoaded: false,
  selfieData: null,
  sanity: 100,
  corruption: 0,
  puzzle: 0,
  glitching: false,
  puzzlesSolved: 0,
  wrongAttempts: 0,
  currentZone: 0,
  zones: ['python', 'lua', 'sql', 'rust', 'cpp', 'brainfuck', 'assembly']
}

// ─── zone data ────────────────────────────────────────────
let PUZZLES = []
let ZONE_DATA = null
let pyodide = null

// ─── zone loader ──────────────────────────────────────────
async function loadZone(zoneName) {
  const response = await fetch(`./zones/${zoneName}.json`)
  const data = await response.json()
  return data
}

function pickPuzzles(data, count) {
  const easy   = data.puzzles.filter(p => p.difficulty === 'easy')
  const medium = data.puzzles.filter(p => p.difficulty === 'medium')
  const hard   = data.puzzles.filter(p => p.difficulty === 'hard')
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const picked = []
  if(count >= 1) picked.push(pick(easy))
  if(count >= 2) picked.push(pick(medium))
  if(count >= 3) picked.push(pick(hard))
  if(count >= 4) picked.push(pick(medium))
  if(count >= 5) picked.push(pick(hard))
  return picked.filter(Boolean)
}

// ─── pyodide ──────────────────────────────────────────────
async function initPyodide() {
  setOutput('// loading Python runtime...', '')
  pyodide = await loadPyodide()
  setOutput('// Python ready. Write your solution.', '')
  console.log('Pyodide ready')
}

// ─── flowers ─────────────────────────────────────────────
function plantFlowers() {
  const fb = document.getElementById('flower-bg')
  const emojis = ['🌸','🌺','🌼','🌻','🌹','🍀','🌿']
  for(let i=0; i<20; i++){
    const f = document.createElement('div')
    f.className = 'flower'
    f.textContent = emojis[Math.floor(Math.random()*emojis.length)]
    f.style.cssText = `left:${Math.random()*95}%;top:${Math.random()*95}%;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*2}s;font-size:${16+Math.random()*20}px`
    fb.appendChild(f)
  }
}

function copyToMini() {
  if(!state.selfieData) return
  const c = document.getElementById('mini-selfie-canvas')
  const ctx = c.getContext('2d')
  const tmp = document.createElement('canvas')
  tmp.width = 120; tmp.height = 120
  const tctx = tmp.getContext('2d')
  tctx.putImageData(state.selfieData, 0, 0)
  ctx.drawImage(tmp, 0, 0, 120, 120)
}

// ─── attach listeners ─────────────────────────────────────
function attachListeners() {
  document.getElementById('file-input').addEventListener('change', e => {
    const file = e.target.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const c = document.getElementById('selfie-canvas')
        c.width = 120; c.height = 120
        const ctx = c.getContext('2d')
        const side = Math.min(img.width, img.height)
        const sx = (img.width-side)/2, sy = (img.height-side)/2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 120, 120)
        c.style.display = 'block'
        document.getElementById('selfie-icon').style.display = 'none'
        document.getElementById('selfie-hint').style.display = 'none'
        state.selfieData = ctx.getImageData(0, 0, 120, 120)
        state.selfieLoaded = true
        document.getElementById('start-btn').disabled = false
        document.getElementById('start-btn').textContent = 'ENTER THE WORLD ↗'
        copyToMini()
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })

  document.getElementById('start-btn').addEventListener('click', () => {
    if(!state.selfieLoaded) return
    document.getElementById('title-screen').style.display = 'none'
    const gs = document.getElementById('game-screen')
    gs.style.display = 'flex'
    updatePuzzleUI()
  })
}

// ─── puzzle ───────────────────────────────────────────────
function updatePuzzleUI() {
  const p = PUZZLES[state.puzzle]
  if(!p) return
  document.querySelector('.puzzle-prompt').innerHTML = `${p.prompt}<div class="hint">${p.hint}</div>`
  document.getElementById('code-editor').value = p.starter_code || ''
  document.getElementById('output-area').textContent = '// output will appear here'
  document.getElementById('output-area').className = 'output-area'
  const dots = document.querySelectorAll('.dot')
  dots.forEach((d,i) => {
    d.className = 'dot' + (i<state.puzzle?' done':i===state.puzzle?' current':'')
  })
  document.querySelector('.panel-header span:first-child').textContent = `Puzzle ${state.puzzle+1}/${PUZZLES.length}`
}

// ─── router ───────────────────────────────────────────────
function runCode() {
  const zone = state.zones[state.currentZone]
  if(zone === 'python') runPython()
  else if(zone === 'lua') runLua()
  else if(zone === 'sql') runSQL()
  else if(zone === 'rust') runRust()
  else if(zone === 'cpp') runCpp()
  else if(zone === 'brainfuck') runBrainfuck()
  else if(zone === 'assembly') runAssembly()
}

// ─── python ───────────────────────────────────────────────
async function runPython() {
  if(!pyodide){ setOutput('// Python runtime still loading...', 'error'); return }
  const code = document.getElementById('code-editor').value.trim()
  if(!code){ setOutput('// write your function first', 'error'); return }

  const p = PUZZLES[state.puzzle]
  const testExpr = p.testCall || null

  try {
    await pyodide.runPythonAsync(code)

    if(!testExpr){
      setOutput('// no testCall found in puzzle', 'error')
      return
    }

    const result = await pyodide.runPythonAsync(`str(${testExpr})`)
    const actual = String(result).trim()
    const expected = String(p.expected_output).trim()

    if(actual === expected){
      console.log('MATCH — actual:', JSON.stringify(actual), 'expected:', JSON.stringify(expected))
      setOutput(`>>> ${actual}\n\n✓ ${p.narrative}`, 'success')
      state.puzzlesSolved++
      state.corruption += ZONE_DATA.corruption_per_puzzle
      setTimeout(() => {
        state.puzzle++
        if(state.puzzle < PUZZLES.length){
          updatePuzzleUI()
          triggerGlitch(state.puzzlesSolved)
          updateCorruption()
        } else {
          setOutput('// PYTHON ZONE COMPLETE\n// The world holds its breath.\n// Lua zone unlocked. Things will get... quieter.', 'success')
          triggerZoneComplete()
        }
      }, 1800)
    } else {
      console.log('MISMATCH — actual:', JSON.stringify(actual), 'expected:', JSON.stringify(expected))
      state.wrongAttempts++
      state.sanity = Math.max(20, state.sanity-4)
      updateSanity()
      setOutput(`>>> got: ${actual}\n✗ expected: ${expected}`, 'error')
      if(state.wrongAttempts % 3 === 0) addGlitchEffect()
    }
  } catch(e) {
    state.wrongAttempts++
    state.sanity = Math.max(20, state.sanity-4)
    updateSanity()
    setOutput(`Traceback:\n${e.message}`, 'error')
    if(state.wrongAttempts % 3 === 0) addGlitchEffect()
  }
}

// ─── lua ──────────────────────────────────────────────────
function runLua() {
  const code = document.getElementById('code-editor').value.trim()
  if(!code){ setOutput('// write your solution first', 'error'); return }

  const p = PUZZLES[state.puzzle]

  try {
    const fullCode = code + '\nreturn ' + p.testCall
    const result = fengari.load(fengari.to_luastring(fullCode))()
    const actual = String(result).trim()
    const expected = String(p.expected_output).trim()

    if(actual === expected){
      console.log('MATCH — actual:', JSON.stringify(actual), 'expected:', JSON.stringify(expected))
      setOutput(`>>> ${actual}\n\n✓ ${p.narrative}`, 'success')
      state.puzzlesSolved++
      state.corruption += ZONE_DATA.corruption_per_puzzle
      setTimeout(() => {
        state.puzzle++
        if(state.puzzle < PUZZLES.length){
          updatePuzzleUI()
          triggerGlitch(state.puzzlesSolved)
          updateCorruption()
        } else {
          setOutput('// LUA ZONE COMPLETE\n// The cracks are spreading.\n// SQL awaits. Reality is missing rows.', 'success')
          triggerZoneComplete()
        }
      }, 1800)
    } else {
      console.log('MISMATCH — actual:', JSON.stringify(actual), 'expected:', JSON.stringify(expected))
      state.wrongAttempts++
      state.sanity = Math.max(20, state.sanity-4)
      updateSanity()
      setOutput(`>>> got: ${actual}\n✗ expected: ${expected}`, 'error')
      if(state.wrongAttempts % 3 === 0) addGlitchEffect()
    }
  } catch(e) {
    state.wrongAttempts++
    state.sanity = Math.max(20, state.sanity-4)
    updateSanity()
    setOutput(`Lua error:\n${e.message}`, 'error')
    if(state.wrongAttempts % 3 === 0) addGlitchEffect()
  }
}

// ─── sql / rust / cpp / brainfuck / assembly ──────────────
function runSQL() { setOutput('// SQL zone coming soon', '') }
function runRust() { setOutput('// Rust zone coming soon', '') }
function runCpp() { setOutput('// C++ zone coming soon', '') }
function runBrainfuck() { setOutput('// Brainf*ck zone coming soon', '') }
function runAssembly() { setOutput('// Assembly zone coming soon', '') }

// ─── output ───────────────────────────────────────────────
function setOutput(text, cls) {
  const el = document.getElementById('output-area')
  el.textContent = text
  el.className = 'output-area ' + (cls||'')
}

// ─── sanity ───────────────────────────────────────────────
function updateSanity() {
  const pct = state.sanity
  document.getElementById('sanity-fill').style.width = pct + '%'
  document.getElementById('sanity-pct').textContent = pct + '%'
  const col = pct>60 ? 'var(--green)' : pct>30 ? 'var(--amber)' : 'var(--red)'
  document.getElementById('sanity-fill').style.background = col
}

// ─── corruption ───────────────────────────────────────────
function updateCorruption() {
  document.getElementById('corrupt-pct').textContent = state.corruption + '%'
  if(!state.selfieData) return
  const c = document.getElementById('mini-selfie-canvas')
  const ctx = c.getContext('2d')
  const tmp = document.createElement('canvas')
  tmp.width = 120; tmp.height = 120
  const tctx = tmp.getContext('2d')
  const d = new ImageData(new Uint8ClampedArray(state.selfieData.data), 120, 120)
  const amt = state.corruption
  for(let i=0; i<d.data.length; i+=4){
    if(Math.random() < amt/200){
      d.data[i]   = Math.floor(Math.random()*255)
      d.data[i+1] = Math.floor(Math.random()*255)
      d.data[i+2] = Math.floor(Math.random()*255)
    }
  }
  tctx.putImageData(d, 0, 0)
  ctx.drawImage(tmp, 0, 0, 120, 120)
}

// ─── world ────────────────────────────────────────────────
function triggerGlitch(count) {
  const narratives = [
    'The flowers sway normally. A bird calls. Then calls again with the same exact timing.',
    "One of the flowers disappeared while you were reading this. You didn't see it go.",
    'The sun is 3 pixels lower than it was. Probably nothing.'
  ]
  const nar = document.getElementById('narrative-text')
  nar.textContent = narratives[Math.min(count-1, narratives.length-1)]
  nar.style.borderLeftColor = count>1 ? 'var(--amber)' : 'var(--green)'
  if(count >= 2){
    document.getElementById('el-flower1').style.opacity = '0'
    document.getElementById('el-flower1').style.transform = 'translateY(20px)'
  }
  if(count >= 3){
    document.getElementById('scene-sky').style.background = 'linear-gradient(to bottom,#0f2840,#050510)'
    document.getElementById('el-bird').textContent = '🦇'
  }
}

function addGlitchEffect() {
  const scene = document.getElementById('world-scene')
  scene.classList.add('glitch')
  setTimeout(() => scene.classList.remove('glitch'), 300)
}

// ─── zone complete ────────────────────────────────────────
function triggerZoneComplete() {
  const nar = document.getElementById('narrative-text')
  const currentZoneName = state.zones[state.currentZone]
  const nextZone = state.zones[state.currentZone + 1]

  const messages = {
    python: 'Python zone complete. You look back. The path behind you has crumbled. <span style="color:var(--red)">There is no going back.</span> Lua awaits. It smiles with too many teeth.',
    lua: 'Lua zone complete. The world is quieter now. Quieter in the wrong way. <span style="color:var(--red)">SQL awaits. Reality is missing rows.</span>',
    sql: 'SQL zone complete. Some rows never came back. <span style="color:var(--red)">Rust awaits. It will take things from you.</span>',
    rust: 'Rust zone complete. The borrow checker is satisfied. <span style="color:var(--red)">You are not. C++ awaits.</span>',
    cpp: 'C++ zone complete. You deleted something you needed. <span style="color:var(--red)">Brainf*ck awaits. There is no syntax highlighting in the void.</span>',
    brainfuck: 'Brainf*ck zone complete. You understand nothing and everything. <span style="color:var(--red)">Assembly awaits. One last thing.</span>'
  }

  nar.innerHTML = messages[currentZoneName] || 'Zone complete.'
  nar.style.borderLeftColor = 'var(--red)'

  if(nextZone){
    setTimeout(() => {
      enterZone(nextZone)
    }, 3000)
  }
}

// ─── zone transition ──────────────────────────────────────
async function enterZone(zoneName) {
  ZONE_DATA = await loadZone(zoneName)
  PUZZLES = pickPuzzles(ZONE_DATA, ZONE_DATA.puzzle_count)
  state.puzzle = 0
  state.currentZone = state.zones.indexOf(zoneName)
  console.log('Zone loaded:', ZONE_DATA.label, '— puzzles:', PUZZLES.length)
  updatePuzzleUI()
  updateHUD()
}

function updateHUD() {
  document.getElementById('zone-label').textContent = ZONE_DATA.label
  document.getElementById('zone-label').style.color = 'var(--green)'
  document.querySelector('.lang-badge').textContent = ZONE_DATA.badge
}

// ─── init ─────────────────────────────────────────────────
async function init() {
  await initPyodide()
  ZONE_DATA = await loadZone('python')
  PUZZLES = pickPuzzles(ZONE_DATA, ZONE_DATA.puzzle_count)
  console.log('Zone loaded:', ZONE_DATA.label, '— puzzles:', PUZZLES.length)
  plantFlowers()
  attachListeners()
}

init()