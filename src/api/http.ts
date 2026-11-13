export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
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
    // ProblemDetails de ASP.NET trae "title"
    const title = body && typeof body === 'object' && 'title' in body ? String(body.title) : null
    throw new ApiError(res.status, body, title ?? `Error ${res.status} en ${path}`)
  }
  return body as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
