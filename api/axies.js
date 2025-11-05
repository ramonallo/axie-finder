// api/axies.js
export default async function handler(req, res) {
  try {
    const body = req.body && Object.keys(req.body).length ? req.body : {
      query: `{
        axies(from:0, size:100, sort:PriceAsc) {
          results {
            id
            name
            class
            image
            auction { currentPriceUSD }
            parts { name class type }
          }
        }
      }`
    };

    const response = await fetch("https://graphql-gateway.axieinfinity.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    res.status(response.status).send(data);
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro no proxy", details: String(err) });
  }
}
