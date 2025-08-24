import type { GetScannerResultParams, ScannerApiResponse } from "./types";

const API_BASE_URL = "https://api-rs.dexcelerate.com";

function buildQuery(params: GetScannerResultParams): string {
  const url = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => url.append(key, String(v)));
    } else {
      url.set(key, String(value));
    }
  });
  return url.toString();
}

export async function fetchScanner(
  params: GetScannerResultParams
): Promise<ScannerApiResponse> {
  const query = buildQuery(params);
  const res = await fetch(`${API_BASE_URL}/scanner${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error(`Scanner request failed: ${res.status}`);
  }
  const data = (await res.json()) as ScannerApiResponse;
  return data;
}
