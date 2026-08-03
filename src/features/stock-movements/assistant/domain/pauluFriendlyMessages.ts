/**
 * Friendly, psychology-aware copy for exceptions (no blame, next step + examples).
 */

export const PAULU_STOCK_OFF_TOPIC = `Entiendo tu curiosidad, y está bien preguntar. En este espacio mi enfoque es acompañarte solo con movimientos de stock e inventario relacionado, para que la información sea clara y útil.

No puedo ayudarte con ese tema aquí, pero sí puedo ayudarte con consultas como estas:

- «Muéstrame los últimos movimientos de stock»
- «Lista los productos con stock bajo»
- «¿Qué entradas se registraron recientemente?»
- «Resume los despachos de esta semana»
- «¿Cuáles son las ventas relacionadas con inventario?»

Cuando quieras, reformula tu pregunta por ese lado y seguimos con calma.`

export const PAULU_STOCK_REQUEST_EXAMPLES = `Ejemplos de peticiones que sí puedo realizar:

1. «Muéstrame los movimientos de stock (tipo, cantidad y costo)»
2. «Lista los productos y su cantidad disponible»
3. «¿Cuáles son las entradas recientes con número y total?»
4. «Resume los despachos con número y estado»
5. «¿Qué ventas hay relacionadas con inventario?»`

export function pauluOllamaNotReadyMessage(technicalHint: string): string {
  return `Ahora mismo no pude conectar con el modelo para responderte. No es algo que hayas hecho mal: a veces el servicio local necesita un momento.

Cuando esté listo, podré atender tus consultas de inventario. Mientras tanto, puedes intentar de nuevo con algo como:

- «Muéstrame los movimientos de stock»
- «Lista los productos del inventario»

Detalle técnico (por si te ayuda a revisarlo): ${technicalHint}`
}

export function pauluModelErrorMessage(): string {
  return `Tuve un tropiezo al preparar la respuesta. Tranquilo: no perdiste nada y tu inventario sigue igual.

Intenta de nuevo en un momento. Si quieres, usa una petición concreta, por ejemplo:

- «Muéstrame los movimientos de stock»
- «¿Cuáles son las entradas recientes?»

Estoy aquí para ayudarte a mantener el orden del inventario.`
}

export function pauluContextFailureMessage(): string {
  return `No pude completar todas las consultas de datos en este momento. A veces la conexión o el servidor necesitan un respiro; no es tu culpa.

Puedes reintentar con una petición clara, por ejemplo:

- «Movimientos de stock recientes»
- «Lista de productos en inventario»
- «Entradas recientes»

Cuando los datos estén disponibles, te los presento con orden.`
}
