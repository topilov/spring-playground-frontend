export function getQueryParamValue(search: string, name: string): string | null {
  const query = search.startsWith('?') ? search.slice(1) : search;

  if (!query) {
    return null;
  }

  for (const entry of query.split('&')) {
    if (!entry) {
      continue;
    }

    const separatorIndex = entry.indexOf('=');
    const rawKey = separatorIndex >= 0 ? entry.slice(0, separatorIndex) : entry;
    const rawValue = separatorIndex >= 0 ? entry.slice(separatorIndex + 1) : '';

    if (decodeURIComponent(rawKey) !== name) {
      continue;
    }

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}
