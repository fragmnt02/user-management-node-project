import axios from "axios";
import tzlookup from "tz-lookup";

/**
 * Fetch lat/lon (+ derive IANA timezone) from OpenWeather by zip + country
 * I prefer IANA zone (tz-lookup) for UX & portability.
 */
export async function geocodeByZip({ zipCode, country = "US" }: { zipCode: string; country?: string }) {
  const key = process.env.OPENWEATHER_API_KEY;
  const url = "https://api.openweathermap.org/data/2.5/weather";

  if (!key) {
    throw Object.assign(new Error("Missing OPENWEATHER_API_KEY"), { status: 500 });
  }

  let data: any;
  try {
    ({ data } = await axios.get(url, {
      params: { zip: `${zipCode},${country}`, appid: key },
      timeout: 8000,
    }));
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const upstreamStatus = err.response?.status;
      const errorCode = (err as any)?.code;

      if (errorCode === "ECONNABORTED") {
        throw Object.assign(new Error("OpenWeather request timed out"), { status: 504 });
      }

      if (upstreamStatus === 404) {
        throw Object.assign(new Error("Invalid zip or country"), { status: 400 });
      }

      if (upstreamStatus === 401 || upstreamStatus === 403) {
        throw Object.assign(new Error("Upstream authentication error"), { status: 502 });
      }

      if (upstreamStatus === 429) {
        throw Object.assign(new Error("Upstream rate limit exceeded"), { status: 503 });
      }

      throw Object.assign(new Error("Upstream API error"), { status: 502 });
    }

    throw Object.assign(new Error("Failed to reach OpenWeather"), { status: 502 });
  }

  const lat = data?.coord?.lat;
  const lon = data?.coord?.lon;
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw Object.assign(new Error("Failed to resolve coordinates"), { status: 422 });
  }

  // Map to IANA timezone (e.g. America/New_York)
  const timezone = tzlookup(lat, lon);

  return { lat, lon, timezone };
}
