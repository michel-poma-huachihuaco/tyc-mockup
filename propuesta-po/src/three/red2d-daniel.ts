// Vista «Grafo 2D» de la Consulta 360 de la rama de Daniel (origin/prototipo-polar › vista-c360.ts: iniciarLoopCanvas,
// dibujarRedNeuronal, alMoverMouseCanvas, alSalirMouseCanvas y alClickCanvas), sacada del componente Angular a una función que
// monta el bucle sobre un <canvas>. El dibujo es el mismo, línea por línea; el estado llega por una referencia que la página
// actualiza en cada render (cliente, nodo elegido, fuentes caídas y estado de cada nodo según el rol).

export interface Fuente2D {
  readonly id: string
  readonly nombre: string
}
export interface Nodo2D {
  readonly id: string
  readonly nombre: string
  readonly fuentes: readonly string[]
  /** ok · locked (restringido para el rol) · down (alguna fuente caída) */
  readonly codigo: 'ok' | 'locked' | 'down'
}
export interface Estado2D {
  readonly fuentes: readonly Fuente2D[]
  readonly nodos: readonly Nodo2D[]
  readonly sel: string
  readonly caidas: readonly string[]
  readonly cliente: { readonly iniciales: string; readonly lotes: readonly string[] }
}
export interface OptsRed2D {
  canvas: HTMLCanvasElement
  estado: { current: Estado2D | null }
  alClickNodo: (id: string) => void
  alClickFuente: (id: string) => void
  alClickCliente: () => void
}

interface NodoCanvasPos {
  readonly kind: 'cli' | 'src' | 'node'
  readonly x: number
  readonly y: number
  readonly r: number
  readonly s?: Fuente2D
  readonly n?: Nodo2D
}

// readColor de @aybarcorp/tokens/apariencia: el valor calculado del token en :root
const readColor = (token: string): string => getComputedStyle(document.documentElement).getPropertyValue(token).trim()

export function montarRed2D(o: OptsRed2D): () => void {
  const { canvas } = o
  let hitTargets: NodoCanvasPos[] = []
  let hoverTarget: NodoCanvasPos | null = null
  let rafId = 0

  const alMoverMouseCanvas = (ev: MouseEvent): void => {
    const rect = canvas.getBoundingClientRect()
    const mx = ev.clientX - rect.left
    const my = ev.clientY - rect.top
    let hallado: NodoCanvasPos | null = null
    for (const h of hitTargets) {
      if (Math.hypot(mx - h.x, my - h.y) <= h.r + 5) {
        hallado = h
        break
      }
    }
    hoverTarget = hallado
    canvas.style.cursor = hallado ? 'pointer' : 'default'
  }
  const alSalirMouseCanvas = (): void => {
    hoverTarget = null
  }
  const alClickCanvas = (): void => {
    const h = hoverTarget
    if (!h) return
    if (h.kind === 'node' && h.n) o.alClickNodo(h.n.id)
    else if (h.kind === 'src' && h.s) o.alClickFuente(h.s.id)
    else if (h.kind === 'cli') o.alClickCliente()
  }

  const dibujarRedNeuronal = (ts: number): void => {
    const e = o.estado.current
    if (!e) return
    const W = canvas.clientWidth
    const H = canvas.clientHeight || 560
    if (!W) return
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== Math.floor(W * dpr) || canvas.height !== Math.floor(H * dpr)) {
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.scale(dpr, dpr)

    const tealOscuro = readColor('--aybar-color-primary-900') || '#012B33'
    const tealBase = readColor('--aybar-color-primary-700') || '#02424E'
    const naranja = readColor('--aybar-color-secondary-400') || '#FFA726'
    const verde = readColor('--aybar-color-success-500') || '#36A558'
    const ambar = readColor('--aybar-color-warning-500') || '#B88100'
    const rojo = readColor('--aybar-color-danger-500') || '#D63D4A'
    const blanco = readColor('--aybar-color-neutral-0') || '#FFFFFF'

    ctx.fillStyle = tealOscuro
    ctx.fillRect(0, 0, W, H)

    const cx = W * 0.5
    const cy = H * 0.51
    const m = Math.min(W, H)
    const rSrc = m * 0.24
    const rNode = m * 0.41

    ;[rSrc * 0.52, rSrc, rNode].forEach((r, idx) => {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = idx === 1 ? 'rgba(255, 167, 38, 0.20)' : 'rgba(255, 255, 255, 0.08)'
      ctx.setLineDash(idx === 2 ? [3, 6] : [])
      ctx.lineWidth = 1
      ctx.stroke()
    })
    ctx.setLineDash([])

    const posFuentes: Record<string, NodoCanvasPos> = {}
    e.fuentes.forEach((s, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / e.fuentes.length
      posFuentes[s.id] = { kind: 'src', s, x: cx + Math.cos(a) * rSrc, y: cy + Math.sin(a) * rSrc, r: 16 }
    })

    const posNodos: Record<string, NodoCanvasPos> = {}
    e.nodos.forEach((n, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / e.nodos.length
      posNodos[n.id] = { kind: 'node', n, x: cx + Math.cos(a) * rNode, y: cy + Math.sin(a) * rNode, r: 13 }
    })

    const foco = hoverTarget
    const selId = e.sel
    const caidas = e.caidas
    const t = ts * 0.001

    const bezierPt = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, u: number): [number, number] => {
      const v = 1 - u
      return [v * v * x0 + 2 * v * u * x1 + u * u * x2, v * v * y0 + 2 * v * u * y1 + u * u * y2]
    }

    e.nodos.forEach((n, idx) => {
      const np = posNodos[n.id]!
      const st = n.codigo
      n.fuentes.forEach((sid, j) => {
        const sp = posFuentes[sid]
        if (!sp) return
        const sDown = caidas.includes(sid)
        const activo = selId === n.id || (foco?.kind === 'node' && foco.n?.id === n.id) || (foco?.kind === 'src' && foco.s?.id === sid)
        const cpx = (sp.x + np.x) * 0.5 + (cx - (sp.x + np.x) * 0.5) * 0.18
        const cpy = (sp.y + np.y) * 0.5 + (cy - (sp.y + np.y) * 0.5) * 0.18

        ctx.beginPath()
        ctx.moveTo(sp.x, sp.y)
        ctx.quadraticCurveTo(cpx, cpy, np.x, np.y)
        ctx.strokeStyle = sDown
          ? 'rgba(214, 61, 74, 0.42)'
          : activo
            ? 'rgba(255, 167, 38, 0.90)'
            : st === 'locked'
              ? 'rgba(184, 129, 0, 0.32)'
              : 'rgba(255, 255, 255, 0.18)'
        ctx.lineWidth = activo ? 2.2 : 1.1
        ctx.stroke()

        if (!sDown && st === 'ok') {
          const u = (t * 0.42 + idx * 0.07 + j * 0.19) % 1
          const [px, py] = bezierPt(sp.x, sp.y, cpx, cpy, np.x, np.y, u)
          ctx.beginPath()
          ctx.arc(px, py, activo ? 3.2 : 2.1, 0, Math.PI * 2)
          ctx.fillStyle = activo ? naranja : 'rgba(255, 255, 255, 0.78)'
          ctx.fill()
        }
      })
    })

    e.fuentes.forEach((s, idx) => {
      const sp = posFuentes[s.id]!
      const down = caidas.includes(s.id)
      const activo = foco?.kind === 'src' && foco.s?.id === s.id
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(sp.x, sp.y)
      ctx.strokeStyle = down ? 'rgba(214, 61, 74, 0.48)' : activo ? 'rgba(255, 167, 38, 0.85)' : 'rgba(255, 255, 255, 0.22)'
      ctx.lineWidth = activo ? 2 : 1.15
      ctx.stroke()

      if (!down) {
        const u = (t * 0.55 + idx * 0.13) % 1
        const px = cx + (sp.x - cx) * u
        const py = cy + (sp.y - cy) * u
        ctx.beginPath()
        ctx.arc(px, py, 2.3, 0, Math.PI * 2)
        ctx.fillStyle = naranja
        ctx.fill()
      }
    })

    hitTargets = []

    e.fuentes.forEach((s) => {
      const p = posFuentes[s.id]!
      hitTargets.push(p)
      const down = caidas.includes(s.id)
      const isHover = foco?.kind === 'src' && foco.s?.id === s.id

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r + (isHover ? 3 : 0), 0, Math.PI * 2)
      ctx.fillStyle = down ? 'rgba(214, 61, 74, 0.28)' : 'rgba(255, 167, 38, 0.20)'
      ctx.fill()
      ctx.lineWidth = isHover ? 2.4 : 1.6
      ctx.strokeStyle = down ? rojo : naranja
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = down ? rojo : naranja
      ctx.fill()

      ctx.font = '600 10px Inter, system-ui, sans-serif'
      ctx.fillStyle = blanco
      ctx.textAlign = 'center'
      ctx.fillText(s.nombre, p.x, p.y + p.r + 13)
    })

    e.nodos.forEach((n) => {
      const p = posNodos[n.id]!
      hitTargets.push(p)
      const st = n.codigo
      const isSel = selId === n.id
      const isHover = foco?.kind === 'node' && foco.n?.id === n.id
      const col = st === 'ok' ? verde : st === 'locked' ? ambar : rojo

      if (isSel || isHover) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 167, 38, 0.24)'
        ctx.fill()
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = isSel ? tealBase : 'rgba(2, 66, 78, 0.92)'
      ctx.fill()
      ctx.lineWidth = isSel || isHover ? 2.5 : 1.6
      ctx.strokeStyle = isSel ? naranja : col
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = col
      ctx.fill()

      const ang = Math.atan2(p.y - cy, p.x - cx)
      const lx = p.x + Math.cos(ang) * (p.r + 10)
      const ly = p.y + Math.sin(ang) * (p.r + 10)
      ctx.font = `${isSel ? '700' : '600'} 10.5px Inter, system-ui, sans-serif`
      ctx.fillStyle = st === 'locked' ? 'rgba(255, 255, 255, 0.60)' : blanco
      ctx.textAlign = Math.cos(ang) > 0.22 ? 'left' : Math.cos(ang) < -0.22 ? 'right' : 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(n.nombre, lx, ly)
    })

    const cli = e.cliente
    const pulso = 34 + Math.sin(t * 2.6) * 2.5
    ctx.beginPath()
    ctx.arc(cx, cy, pulso + 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 167, 38, 0.16)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, 32, 0, Math.PI * 2)
    ctx.fillStyle = tealBase
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = naranja
    ctx.stroke()

    ctx.fillStyle = blanco
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 15px Inter, system-ui, sans-serif'
    ctx.fillText(cli.iniciales, cx, cy - 4)
    ctx.font = '600 9.5px Inter, system-ui, sans-serif'
    ctx.fillStyle = naranja
    ctx.fillText(cli.lotes.join(' · '), cx, cy + 12)

    hitTargets.push({ kind: 'cli', x: cx, y: cy, r: 32 })
    ctx.restore()
  }

  // iniciarLoopCanvas: dibuja solo mientras el lienzo se ve (en 3D queda oculto y su ancho es 0)
  let avisado = false
  const renderizar = (ts: number): void => {
    try {
      dibujarRedNeuronal(ts)
    } catch (err) {
      if (!avisado) {
        avisado = true
        console.error('[grafo 2D]', err)
      }
    }
    rafId = requestAnimationFrame(renderizar)
  }
  rafId = requestAnimationFrame(renderizar)
  canvas.addEventListener('mousemove', alMoverMouseCanvas)
  canvas.addEventListener('mouseleave', alSalirMouseCanvas)
  canvas.addEventListener('click', alClickCanvas)
  return () => {
    cancelAnimationFrame(rafId)
    canvas.removeEventListener('mousemove', alMoverMouseCanvas)
    canvas.removeEventListener('mouseleave', alSalirMouseCanvas)
    canvas.removeEventListener('click', alClickCanvas)
  }
}
