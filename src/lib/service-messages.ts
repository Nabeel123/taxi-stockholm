/** Maps SERVICE id (`airport-pickup`) to next-intl message keys (`airport_pickup`). */
export function serviceIdToMessageKey(id: string): string {
  return id.replace(/-/g, "_");
}
