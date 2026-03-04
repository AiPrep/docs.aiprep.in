export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type KeyValuePair = {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type AuthType = "none" | "bearer" | "api-key" | "basic"

export type AuthConfig =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | { type: "api-key"; key: string; value: string; addTo: "header" | "query" }
  | { type: "basic"; username: string; password: string }

export type ProxyRequest = {
  method: HttpMethod
  url: string
  headers: Record<string, string>
  body: string | null
  turnstileToken: string | null
}

export type ProxyResponse = {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  duration: number
  size: number
}

export type ProxyError = {
  error: string
}

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-amber-600 dark:text-amber-400",
  PATCH: "text-purple-600 dark:text-purple-400",
  DELETE: "text-red-600 dark:text-red-400",
}

export const METHOD_BG_COLORS: Record<HttpMethod, string> = {
  GET: "bg-emerald-100 dark:bg-emerald-900/30",
  POST: "bg-blue-100 dark:bg-blue-900/30",
  PUT: "bg-amber-100 dark:bg-amber-900/30",
  PATCH: "bg-purple-100 dark:bg-purple-900/30",
  DELETE: "bg-red-100 dark:bg-red-900/30",
}
