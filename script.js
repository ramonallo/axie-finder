const cardsContainer = document.getElementById("cards");
const searchInput = document.getElementById("search");

async function loadCards() {
  const res = await fetch("https://api.axie.tech/cards");
  const data = await res.json();
  renderCards(data);
}

function renderCards(cards) {
  cardsContainer.innerHTML = "";
  cards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.innerHTML = `
      <img src="${card.image}" alt="${card.name}">
      <h3>${card.name}</h3>
      <p>${card.class}</p>
      <p>${card.description}</p>
    `;
    cardsContainer.appendChild(cardEl);
  });
}

searchInput.addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  const res = await fetch("https://api.axie.tech/cards");
  const data = await res.json();
  const filtered = data.filter(c => c.name.toLowerCase().includes(term));
  renderCards(filtered);
});

loadCards();
