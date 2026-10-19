// Generado por build.mjs — NO editar a mano. La fuente es src/apariencia-arranque.js.
/*
 * @aybarcorp/tokens/apariencia/arranque — aplica la apariencia recordada antes del primer
 * pintado. Va en el <head>, antes de las hojas de estilo, como <script src> o pegado en línea:
 *
 *   <script src="/apariencia-arranque.js"></script>
 *   <script src="/apariencia-arranque.js" data-storage-key="mi-app:apariencia"></script>
 *
 * Sin él, la página se pinta primero con la apariencia por defecto y cambia cuando arranca la
 * aplicación: un parpadeo de tema y de paleta en cada recarga. Por eso no importa nada y está
 * escrito en el JavaScript más antiguo posible: corre antes de que cargue el resto.
 *
 * Guarda, además, lo que la página declaraba en <html> antes de tocarlo: el núcleo
 * (@aybarcorp/tokens/apariencia) lo usa como el punto al que se vuelve al restablecer.
 */
;(function () {
  // Lo rellena build.mjs desde src/apariencia.json: atributo, valor por defecto y valores de cada eje.
  var EJES = {"theme":{"atributo":"data-theme","porDefecto":"system","valores":["system","light","dark"]},"density":{"atributo":"data-density","porDefecto":"comfortable","valores":["comfortable","compact"]},"palette":{"atributo":"data-palette","porDefecto":"petroleo","valores":["petroleo","oceano","jade","grafito"]},"accent":{"atributo":"data-accent","porDefecto":"mandarina","valores":["mandarina","monocromo"]},"neutral":{"atributo":"data-neutral","porDefecto":"neutro","valores":["neutro","calido","frio"]},"radius":{"atributo":"data-radius","porDefecto":"suave","valores":["suave","recto","redondo"]},"font":{"atributo":"data-font","porDefecto":"marca","valores":["marca","sistema"]},"depth":{"atributo":"data-depth","porDefecto":"profundo","valores":["profundo","plano"]},"style":{"atributo":"data-style","porDefecto":"estandar","valores":["estandar","sobrio"]}}
  var VERSION = 1
  try {
    var raiz = document.documentElement
    var script = document.currentScript
    var clave = (script && script.getAttribute('data-storage-key')) || 'aybar:apariencia'
    var declarado = {}
    var eje
    for (eje in EJES) declarado[eje] = raiz.getAttribute(EJES[eje].atributo)
    Object.defineProperty(document, Symbol.for('aybar.apariencia.declarado'), { value: declarado, configurable: true })

    var crudo = window.localStorage.getItem(clave)
    if (!crudo) return
    var datos = JSON.parse(crudo)
    if (!datos || datos.v !== VERSION) return
    for (eje in EJES) {
      var valor = datos[eje]
      var definicion = EJES[eje]
      if (typeof valor !== 'string' || definicion.valores.indexOf(valor) < 0) continue
      // El valor por defecto no lleva atributo, igual que en el núcleo.
      if (valor === definicion.porDefecto) raiz.removeAttribute(definicion.atributo)
      else raiz.setAttribute(definicion.atributo, valor)
    }
  } catch (error) {
    // localStorage bloqueado o un valor corrupto: se ve la apariencia por defecto, sin más.
  }
})()
