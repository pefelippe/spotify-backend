export const buildQueryString = (params: Record<string, string>) => {
  return new URLSearchParams(params).toString()
}
