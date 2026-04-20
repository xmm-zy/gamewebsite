const STORAGE_KEY = "yume_arcade_games";

const defaultGames = [
  {
    title: "星愿咖啡馆",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/game-1"
  },
  {
    title: "樱花弹幕试炼",
    cover: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=800&q=80",
    url: "https://example.com/game-2"
  }
];

function loadGames() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGames));
    return defaultGames;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return defaultGames;
  }
}

function saveGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function gameCardTemplate(game, index) {
  return `
    <a class="game-card panel" href="./game-detail.html?id=${index}">
      <img class="game-cover" src="${game.cover}" alt="${game.title}" />
      <div class="game-info">
        <h3 class="game-title">${game.title}</h3>
        <p class="game-tip">点击封面查看详情</p>
      </div>
    </a>
  `;
}
