export async function generateImage(prompt: string): Promise<string> {
  const resp = await fetch(`https://api.limewire.com/api/image/generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Version": "v1",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.LIMEWIRE_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      aspect_ratio: "1:1",
    }),
  });

  const data = await resp.json();
  return data[0]?.asset_url;
}
