export async function fetchWithRetry(url: string, options: any, retries = 3): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (!res.ok && retries > 0) throw new Error(res.statusText);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}
