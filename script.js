async function loadGames() {
  try {
    const res = await fetch('games.json');
    if (!res.ok) throw new Error('Failed to load games.json');
    const data = await res.json();
    initUI(data);
  } catch (err) {
    console.error(err);
  }
}

function initUI(games) {
  const priceFilter = document.getElementById('priceFilter');
  const typeFilter = document.getElementById('typeFilter');
  const searchInput = document.getElementById('searchInput');
  const gamesList = document.getElementById('gamesList');

  const prices = Array.from(new Set(games.map(g => g.price))).sort((a,b)=>a-b);
  prices.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = `$${p}`;
    priceFilter.appendChild(opt);
  });

  function render() {
    const term = searchInput.value.toLowerCase();
    const priceVal = priceFilter.value;
    const typeVal = typeFilter.value;
    let filtered = games.filter(g => (
      (!priceVal || g.price == priceVal) &&
      (!typeVal || g.type === typeVal) &&
      g.name.toLowerCase().includes(term)
    ));
    filtered.sort((a,b)=> new Date(a.launchDate) - new Date(b.launchDate));
    const topUnclaimed = [...filtered].sort((a,b)=>b.unclaimed - a.unclaimed).slice(0,3).map(g=>g.code);

    gamesList.innerHTML = '';
    let currentPrice = null;
    filtered.forEach(g => {
      if (g.price !== currentPrice) {
        currentPrice = g.price;
        const header = document.createElement('h3');
        header.textContent = `$${currentPrice} Tickets`;
        header.className = 'mt-4';
        gamesList.appendChild(header);
      }
      const col = document.createElement('div');
      col.className = 'col-md-4';
      const card = document.createElement('div');
      card.className = 'game-card d-flex align-items-center';
      if (topUnclaimed.includes(g.code)) card.classList.add('highlight');
      const circle = document.createElement('div');
      const remaining = g.prizeCount ? (g.unclaimed / g.prizeCount) : 0;
      circle.className = 'prize-circle flex-shrink-0';
      circle.style.setProperty('--remaining', remaining);
      const info = document.createElement('div');
      info.innerHTML = `<h5>${g.name}</h5>
        <p class="mb-1">Launch: ${g.launchDate}</p>
        <p class="mb-0">$${g.price} | ${g.type} | Unclaimed: $${g.unclaimed.toLocaleString()}</p>`;
      card.appendChild(circle);
      card.appendChild(info);
      col.appendChild(card);
      gamesList.appendChild(col);
    });
  }

  priceFilter.addEventListener('change', render);
  typeFilter.addEventListener('change', render);
  searchInput.addEventListener('input', render);
  render();
}

loadGames();
