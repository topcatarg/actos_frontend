export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }

  /** Código de error del back (ej. 'ia_saturada'), si lo mandó. */
  get codigo(): string | null {
    return campo(this.body, 'codigo')
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    // fetch solo tira si no hubo respuesta (backend caído, proxy mal configurado)
    throw new ApiError(0, null, 'No se pudo conectar con el backend')
  }

  const text = await res.text()
  const body = text ? safeJson(text) : null

  if (!res.ok) {
    // ProblemDetails de ASP.NET trae "title"; nuestros errores, "error"
    const mensaje = campo(body, 'title') ?? campo(body, 'error')
    throw new ApiError(res.status, body, mensaje ?? `Error ${res.status} en ${path}`)
  }
  return body as T
}

function campo(body: unknown, nombre: string): string | null {
  return body && typeof body === 'object' && nombre in body && (body as Record<string, unknown>)[nombre] != null
    ? String((body as Record<string, unknown>)[nombre])
    : null
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
