// script.js — versão otimizada para proxy interno da Vercel (api/axies)

document.getElementById("buscar").addEventListener("click", buscarAxies);
buscarAxies(); // executa busca inicial

async function buscarAxies() {
  const classeFiltro = document.getElementById("classe").value;
  const precoMax = parseFloat(document.getElementById("precoMax").value);
  const status = document.getElementById("status");
  const resultados = document.getElementById("resultados");

  status.textContent = "🔄 Buscando Axies...";
  resultados.innerHTML = "";

  const queryBody = {
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

  try {
    // 🔥 Chama a função serverless da Vercel (sem CORS)
    const res = await fetch("/api/axies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryBody)
    });

    const text = await res.text();
    const data = JSON.parse(text);

    let axies = data.data.axies.results.filter(a =>
      a.auction?.currentPriceUSD &&
      parseFloat(a.auction.currentPriceUSD) <= precoMax
    );

    if (classeFiltro) {
      axies = axies.filter(a => a.class === classeFiltro);
    }

    if (axies.length === 0) {
      status.textContent = "⚠️ Nenhum Axie encontrado para esses filtros.";
      return;
    }

    status.textContent = `✅ ${axies.length} Axies encontrados`;
    mostrarAxies(axies);

  } catch (err) {
    console.error("Erro ao buscar Axies:", err);
    status.textContent = "❌ Erro ao buscar dados. Verifique o console.";
  }
}

function calcularMetaScore(axie) {
  const tipos = axie.parts.map(p => p.type);
  let score = 50;
  if (tipos.includes("Horn")) score += 5;
  if (tipos.includes("Back")) score += 5;
  if (tipos.includes("Tail")) score += 5;
  if (axie.class === "Beast" && tipos.includes("Mouth")) score += 10;
  if (axie.class === "Plant" && tipos.includes("Back")) score += 10;
  if (axie.class === "Aqua" && tipos.includes("Tail")) score += 10;
  return Math.min(score, 100);
}

function mostrarAxies(axies) {
  const container = document.getElementById("resultados");
  container.innerHTML = "";
  
  const melhores = axies.sort((a, b) => a.auction.currentPriceUSD - b.auction.currentPriceUSD);
  
  melhores.forEach(a => {
    const meta = calcularMetaScore(a);
    const tag =
      meta >= 85 && a.auction.currentPriceUSD <= 5
        ? `<span class="tag raro">🏆 Achado Raro</span>`
        : meta >= 70
        ? `<span class="tag meta-alto">🔥 Meta</span>`
        : "";

    container.innerHTML += `
      <div class="axie-card">
        <img src="${a.image}" alt="${a.name}">
        <h3>${a.name || "Axie #" + a.id}</h3>
        <p>Classe: ${a.class}</p>
        <p>💰 ${parseFloat(a.auction.currentPriceUSD).toFixed(2)} USD</p>
        <p class="meta">Meta Score: ${meta}</p>
        ${tag}
        <p><a href="https://app.axieinfinity.com/marketplace/axies/${a.id}" target="_blank">Ver no Market</a></p>
      </div>
    `;
  });
}
