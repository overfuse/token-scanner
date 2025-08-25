import type { GetScannerResultParams, ScannerApiResponse } from "./types";

export class ApiCorsError extends Error {
  constructor(message: string = "CORS_BLOCKED") {
    super(message);
    this.name = "ApiCorsError";
  }
}

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
  const url = `${API_BASE_URL}/scanner${query ? `?${query}` : ""}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Scanner request failed: ${res.status}`);
    }
    const data = (await res.json()) as ScannerApiResponse;
    return data;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "";
    // In browsers, CORS/network failures typically surface as TypeError: Failed to fetch
    if (err instanceof TypeError || msg.includes("Failed to fetch")) {
      throw new ApiCorsError();
    }
    throw err as Error;
  }
}
