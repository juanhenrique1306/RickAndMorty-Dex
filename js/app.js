'use strict';

const API_URL = 'https://rickandmortyapi.com/api/character/';
const cardsContainer = document.getElementById('cards-container');
const resultsCount = document.getElementById('results-count');
const pageIndicator = document.getElementById('page-indicator');
const previousButton = document.getElementById('previous-page');
const nextButton = document.getElementById('next-page');
const nameInput = document.getElementById('name-filter');
const statusInput = document.getElementById('status-filter');
const state = { page: 1, pages: 0, name: '', status: '', loading: false };
const CACHE_TTL = 5 * 60 * 1000;
const REQUEST_DELAY = 10000;
const queryCache = new Map();
let blockedUntil = 0;
let cooldownTimer;

// Cache limitado à sessão da página: consultas repetidas não geram novos GETs.
function readCache(key) {
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt >= CACHE_TTL) {
    queryCache.delete(key);
    return null;
  }
  return entry.data;
}

function saveCache(key, data) {
  if (queryCache.size >= 30) queryCache.delete(queryCache.keys().next().value);
  queryCache.set(key, { data, createdAt: Date.now() });
}

function retryDelay(value) {
  if (!value) return 60000;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.max(1000, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? 60000 : Math.max(1000, date - Date.now());
}

function startCooldown(milliseconds, rateLimited) {
  clearInterval(cooldownTimer);
  blockedUntil = Date.now() + milliseconds;
  const refresh = () => {
    const seconds = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
    const description = seconds > 0
        ? `${rateLimited ? 'A API limitou temporariamente o acesso.' : 'Não foi possível acessar a API. O serviço pode estar indisponível ou limitando consultas.'} Aguarde um momento antes de tentar novamente.`
        : 'Você já pode tentar novamente. Nenhuma consulta será reenviada automaticamente.';
    const message = cardsContainer.querySelector('.state-message');
    if (message && message.querySelector('button')) {
      message.querySelector('p').textContent = description;
      message.querySelector('button').disabled = state.loading || seconds > 0;
    } else {
      showMessage(rateLimited ? 'Muitas consultas ao multiverso' : 'O portal está indisponível', description, true);
    }
    updatePagination();
    if (seconds === 0) clearInterval(cooldownTimer);
  };
  refresh();
  cooldownTimer = setInterval(refresh, 1000);
}

// Cada nó nasce com createElement; textContent insere texto sem interpretar HTML.
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function translateUnknown(value) {
  return value === 'unknown' ? 'Desconhecido' : value;
}

function createCharacterCard(character) {
  const card = document.createElement('article');
  card.className = 'character-card';
  const image = document.createElement('img');
  image.className = 'character-image';
  image.src = character.image;
  image.alt = `Retrato de ${character.name}`;
  image.loading = 'lazy';
  image.width = 300;
  image.height = 300;
  const body = makeElement('div', 'card-body');
  const name = makeElement('h3', '', character.name);
  const meta = makeElement('p', 'character-meta');
  const statusLabels = { Alive: 'Vivo', Dead: 'Morto', unknown: 'Desconhecido' };
  const statusClass = { Alive: 'alive', Dead: 'dead', unknown: 'unknown' };
  const badge = makeElement('span', `status-badge status-${statusClass[character.status] || 'unknown'}`, statusLabels[character.status] || 'Desconhecido');
  // appendChild conecta os nós à árvore do card, sem innerHTML.
  meta.appendChild(badge);
  meta.appendChild(makeElement('span', '', `· ${translateUnknown(character.species)}`));
  const details = makeElement('dl', 'character-details');
  const genderLabels = { Female: 'Feminino', Male: 'Masculino', Genderless: 'Sem gênero', unknown: 'Desconhecido' };
  const fields = [
    ['Gênero', genderLabels[character.gender] || character.gender],
    ['Origem', translateUnknown(character.origin.name)],
    ['Última localização', translateUnknown(character.location.name)],
    ['Episódios', `${character.episode.length} aparições`]
  ];
  fields.forEach(([label, value]) => {
    const group = document.createElement('div');
    group.appendChild(makeElement('dt', '', label));
    group.appendChild(makeElement('dd', '', value));
    details.appendChild(group);
  });
  body.appendChild(name);
  body.appendChild(meta);
  body.appendChild(details);
  card.appendChild(image);
  card.appendChild(body);
  return card;
}

function showMessage(title, description, retry = false, loading = false) {
  cardsContainer.replaceChildren();
  const message = makeElement('div', 'state-message');
  if (loading) {
    const spinner = makeElement('span', 'loading-spinner');
    spinner.setAttribute('aria-hidden', 'true');
    message.appendChild(spinner);
  }
  message.appendChild(makeElement('h3', '', title));
  if (description) message.appendChild(makeElement('p', '', description));
  if (retry) {
    const button = makeElement('button', 'button secondary', 'Tentar novamente');
    button.type = 'button';
    button.disabled = state.loading || Date.now() < blockedUntil;
    button.addEventListener('click', () => fetchCharacters(state.page, state.name, state.status));
    message.appendChild(button);
  }
  cardsContainer.appendChild(message);
}

function updatePagination() {
  const busy = state.loading || Date.now() < blockedUntil;
  document.querySelector('#filters-form button[type="submit"]').disabled = busy;
  document.getElementById('clear-filters').disabled = busy;
  previousButton.disabled = busy || state.page <= 1 || state.pages === 0;
  nextButton.disabled = busy || state.page >= state.pages;
  pageIndicator.textContent = state.pages ? `Página ${state.page} de ${state.pages}` : 'Página — de —';
}

function renderCharacters(data) {
  state.pages = data.info.pages;
  cardsContainer.replaceChildren();
  // O fragmento agrupa os cards; appendChild os insere no container inicialmente vazio.
  const fragment = document.createDocumentFragment();
  data.results.forEach(character => fragment.appendChild(createCharacterCard(character)));
  cardsContainer.appendChild(fragment);
  resultsCount.textContent = `${data.info.count.toLocaleString('pt-BR')} personagens encontrados · ${data.results.length} nesta página`;
  if (data.results.length === 0) showMessage('Nenhum personagem encontrado nesta dimensão', 'Tente outro nome ou limpe os filtros para explorar novamente.');
}

function fetchCharacters(page = 1, name = '', status = '') {
  // Bloqueia duplicatas em andamento, inclusive envios pela tecla Enter.
  if (state.loading || Date.now() < blockedUntil) return Promise.resolve();
  Object.assign(state, { page, name, status });
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  if (name) url.searchParams.set('name', name);
  if (status) url.searchParams.set('status', status);
  const key = url.toString();
  const cached = readCache(key);
  if (cached) {
    renderCharacters(cached);
    updatePagination();
    return Promise.resolve();
  }
  state.loading = true;
  cardsContainer.setAttribute('aria-busy', 'true');
  resultsCount.textContent = 'Consultando personagens…';
  showMessage('Carregando dados do multiverso...', '', false, true);
  updatePagination();

  // Aguarda 10 segundos antes de cada GET novo, sem contagem visível.
  // O estado loading bloqueia cliques repetidos durante a espera e a requisição.
  return new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
    .then(() => {
      // fetch inicia o GET assíncrono; .then verifica o HTTP e lê o JSON.
      return fetch(key);
    })
    .then(response => {
      if (response.status === 429) {
        const error = new Error('Limite de requisições da API');
        error.rateLimited = true;
        error.delay = retryDelay(response.headers.get('Retry-After'));
        throw error;
      }
      if (response.status === 404) return { info: { count: 0, pages: 0 }, results: [] };
      if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('[RickAndMorty-Dex API]:', data);
      if (!data.info || !Array.isArray(data.results)) throw new Error('Resposta inesperada da API');
      saveCache(key, data);
      renderCharacters(data);
    })
    // CORS pode esconder o status 429: falhas genéricas também recebem uma pausa.
    .catch(error => {
      state.pages = 0;
      resultsCount.textContent = error.rateLimited
        ? 'Limite temporário de consultas atingido'
        : 'Não foi possível consultar os personagens';
      startCooldown(error.rateLimited ? error.delay : 10000, Boolean(error.rateLimited));
      console.error('[RickAndMorty-Dex erro]:', error);
    })
    .finally(() => {
      state.loading = false;
      cardsContainer.setAttribute('aria-busy', 'false');
      const retry = cardsContainer.querySelector('button');
      if (retry) retry.disabled = Date.now() < blockedUntil;
      updatePagination();
    });
}

document.getElementById('filters-form').addEventListener('submit', event => {
  event.preventDefault();
  fetchCharacters(1, nameInput.value.trim(), statusInput.value);
});
document.getElementById('clear-filters').addEventListener('click', () => {
  nameInput.value = '';
  statusInput.value = '';
  fetchCharacters(1, '', '');
});
previousButton.addEventListener('click', () => {
  if (!previousButton.disabled) fetchCharacters(state.page - 1, state.name, state.status);
});
nextButton.addEventListener('click', () => {
  if (!nextButton.disabled) fetchCharacters(state.page + 1, state.name, state.status);
});
fetchCharacters(1, '', '');
