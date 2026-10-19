// Arranque Aybar para OpenCode: al crear una sesion corre
// `bash .agents/scripts/arranque.sh --hook opencode` (entorno, paquete Definir
// de docs/ y explorador al dia) y deja su informe en la sesion como contexto, sin pedir respuesta.
// Es el mismo script que llaman los hooks de Claude Code, Cursor, Gemini CLI,
// Codex y Copilot: aqui no se decide nada, solo se entrega su salida.
//
// API de plugins de OpenCode 2 (paquete @opencode/plugin, verificado contra la
// v2.0.22): el modulo exporta por defecto { id, setup }; los ficheros de
// .opencode/plugins/ se cargan solos. El evento "session.created" trae
// data.sessionID y data.parentID; session.synthetic con resume: false anade el
// texto a la sesion sin arrancar el bucle del agente (no gasta modelo).
// Sin imports de @opencode/*: el servicio no instala dependencias para esto.
//
// Nunca bloquea la sesion: si el script falla, se registra y se sigue.
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

const SCRIPT = ".agents/scripts/arranque.sh"

type Evento = { type: string; data?: { sessionID?: string; parentID?: string } }

type Contexto = {
  location: { directory: string; project?: { directory: string } }
  event: { subscribe: (opciones?: { signal?: AbortSignal }) => AsyncIterable<Evento> }
  session: {
    synthetic: (entrada: { sessionID: string; text: string; description?: string; resume?: boolean }) => Promise<unknown>
  }
}

function raizDelServicio(ctx: Contexto): string | undefined {
  const candidatas = [ctx.location.directory, ctx.location.project?.directory]
  return candidatas.find((dir): dir is string => !!dir && existsSync(path.join(dir, SCRIPT)))
}

function correrArranque(raiz: string): Promise<string> {
  return new Promise((resolver) => {
    execFile("bash", [path.join(raiz, SCRIPT), "--hook", "opencode"], { cwd: raiz, timeout: 30_000 }, (error, salida) => {
      if (error) console.warn(`[aybar-arranque] arranque.sh no pudo correr: ${error.message}`)
      resolver(String(salida ?? ""))
    })
  })
}

export default {
  id: "aybar-arranque",
  setup: async (ctx: Contexto) => {
    const raiz = raizDelServicio(ctx)
    if (!raiz) return
    const parar = new AbortController()
    void (async () => {
      for await (const evento of ctx.event.subscribe({ signal: parar.signal })) {
        if (evento.type !== "session.created" || !evento.data?.sessionID) continue
        // Las sesiones hijas (subagentes) heredan el contexto de la principal.
        if (evento.data.parentID) continue
        const sesion = evento.data.sessionID
        try {
          const informe = await correrArranque(raiz)
          if (!informe.trim()) continue
          await ctx.session.synthetic({
            sessionID: sesion,
            text: informe,
            description: "Arranque Aybar",
            resume: false,
          })
        } catch (error) {
          console.warn(`[aybar-arranque] no se pudo dejar el informe en la sesion ${sesion}: ${error}`)
        }
      }
    })().catch((error) => {
      if (!parar.signal.aborted) console.warn(`[aybar-arranque] suscripcion a eventos cerrada: ${error}`)
    })
    return () => parar.abort()
  },
}
