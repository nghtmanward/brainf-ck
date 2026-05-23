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

// ─── pyodide ──────────────────────────────────────────────
let pyodide = null

async function initPyodide() {
  setOutput('// loading Python runtime...', '')
  pyodide = await loadPyodide()
  setOutput('// Python ready. Write your solution.', '')
  console.log('Pyodide ready')
}

initPyodide()

// ─── puzzles ──────────────────────────────────────────────
const PUZZLES = [
  {
    prompt: 'Write <code style="color:var(--green)">answer(n)</code> that returns the square root if perfect square, else <code style="color:var(--amber)">-1</code>.',
    hint: 'Input: <strong>144</strong>',
    testCall: 'answer(144)',
    check: (r) => {
      if(r === 12) return {ok:true, out:`>>> answer(144)\n12\n\n✓ correct. The world smells like fresh flowers.`}
      return {ok:false, out:`>>> answer(144)\n${r}\n\n✗ expected 12`}
    }
  },
  {
    prompt: 'Write <code style="color:var(--green)">flatten(lst)</code> that takes a nested list and returns it flat.',
    hint: 'Input: <strong>[[1,2],[3,[4,5]],6]</strong>',
    testCall: 'str(flatten([[1,2],[3,[4,5]],6]))',
    check: (r) => {
      if(r === '[1, 2, 3, 4, 5, 6]') return {ok:true, out:`>>> flatten([[1,2],[3,[4,5]],6])\n[1, 2, 3, 4, 5, 6]\n\n✓ A flower turns to look at you. That's... normal.`}
      return {ok:false, out:`>>> got: ${r}\n✗ expected [1, 2, 3, 4, 5, 6]`}
    }
  },
  {
    prompt: 'Write <code style="color:var(--green)">cipher(s,n)</code> that applies a Caesar cipher (ROT-N) to string s.',
    hint: 'cipher("hello", 13) → "uryyb"',
    testCall: 'cipher("hello", 13)',
    check: (r) => {
      if(r === 'uryyb') return {ok:true, out:`>>> cipher("hello", 13)\nuryyb\n\n✓ The bird flew into the tree and didn't come back out.`}
      return {ok:false, out:`>>> got: ${r}\n✗ expected uryyb`}
    }
  }
]

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

// ─── selfie ───────────────────────────────────────────────
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

function copyToMini() {
  if(!state.selfieData) return
  const c = document.getElementById('mini-selfie-canvas')
  const ctx = c.getContext('2d')
  const tmp = document.createElement('canvas')
  tmp.width = 120; tmp.height = 120
  const tctx = tmp.getContext('2d')
  tctx.putImageData(state.selfieData, 0, 0)
  ctx.drawImage(tmp, 0, 0, 40, 40)
}

// ─── navigation ───────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  if(!state.selfieLoaded) return
  document.getElementById('title-screen').style.display = 'none'
  const gs = document.getElementById('game-screen')
  gs.style.display = 'flex'
  updatePuzzleUI()
})

// ─── puzzle ───────────────────────────────────────────────
function updatePuzzleUI() {
  const p = PUZZLES[state.puzzle]
  if(!p) return
  document.querySelector('.puzzle-prompt').innerHTML = `${p.prompt}<div class="hint">Input: ${p.hint}</div>`
  document.getElementById('code-editor').value = ''
  document.getElementById('output-area').textContent = '// output will appear here'
  document.getElementById('output-area').className = 'output-area'
  const dots = document.querySelectorAll('.dot')
  dots.forEach((d,i) => {
    d.className = 'dot' + (i<state.puzzle?' done':i===state.puzzle?' current':'')
  })
  document.querySelector('.panel-header span:first-child').textContent = `Puzzle ${state.puzzle+1}/3`
}

// ─── router ───────────────────────────────────────────────
function runCode() {
  const zone = state.zones[state.currentZone]
  if(zone === 'python') runPython()
  else if(zone === 'lua') runLua()
  else if(zone === 'sql') runSQL()
  // etc
}

async function runPython() {
  if(!pyodide){ setOutput('// Python runtime still loading...', 'error'); return }
  const code = document.getElementById('code-editor').value.trim()
  if(!code){ setOutput('// write your function first', 'error'); return }

  const p = PUZZLES[state.puzzle]

  try {
    await pyodide.runPythonAsync(code)
    const result = await pyodide.runPythonAsync(p.testCall)
    const res = p.check(result)

    if(res.ok){
      setOutput(res.out, 'success')
      state.puzzlesSolved++
      state.corruption += 8
      setTimeout(() => {
        state.puzzle++
        if(state.puzzle < 3){
          updatePuzzleUI()
          triggerGlitch(state.puzzlesSolved)
          updateCorruption()
        } else {
          setOutput('// PYTHON ZONE COMPLETE\n// The world holds its breath.\n// Lua zone unlocked. Things will get... quieter.', 'success')
          triggerZoneComplete()
        }
      }, 1800)
    } else {
      state.wrongAttempts++
      state.sanity = Math.max(20, state.sanity-4)
      updateSanity()
      setOutput(res.out, 'error')
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
  ctx.drawImage(tmp, 0, 0, 40, 40)
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

function triggerZoneComplete() {
  const nar = document.getElementById('narrative-text')
  nar.innerHTML = 'Python zone complete. You look back. The path behind you has crumbled. <span style="color:var(--red)">There is no going back.</span> Lua awaits. It smiles with too many teeth.'
  nar.style.borderLeftColor = 'var(--red)'
  document.getElementById('el-flower2').style.opacity = '0'
  document.getElementById('el-sun').style.opacity = '0'
  document.getElementById('zone-label').textContent = 'ZONE_02 :: LUA [coming soon]'
  document.getElementById('zone-label').style.color = 'var(--amber)'
}

// ─── init ─────────────────────────────────────────────────
plantFlowers()