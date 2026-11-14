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
let activeController;
let requestId = 0;

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

function showMessage(title, description, retry = false) {
  cardsContainer.replaceChildren();
  const message = makeElement('div', 'state-message');
  message.appendChild(makeElement('h3', '', title));
  if (description) message.appendChild(makeElement('p', '', description));
  if (retry) {
    const button = makeElement('button', 'button secondary', 'Tentar novamente');
    button.type = 'button';
    button.addEventListener('click', () => fetchCharacters(state.page, state.name, state.status));
    message.appendChild(button);
  }
  cardsContainer.appendChild(message);
}

function updatePagination() {
  previousButton.disabled = state.loading || state.page <= 1 || state.pages === 0;
  nextButton.disabled = state.loading || state.page >= state.pages;
  pageIndicator.textContent = state.pages ? `Página ${state.page} de ${state.pages}` : 'Página — de —';
}

function fetchCharacters(page = 1, name = '', status = '') {
  // Cancela requisições antigas: uma busca lenta não deve sobrescrever a mais recente.
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const currentRequest = ++requestId;
  Object.assign(state, { page, name, status, loading: true });
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  if (name) url.searchParams.set('name', name);
  if (status) url.searchParams.set('status', status);
  cardsContainer.setAttribute('aria-busy', 'true');
  resultsCount.textContent = 'Consultando personagens…';
  showMessage('Carregando dados do multiverso...');
  updatePagination();

  // fetch inicia o GET assíncrono. O primeiro .then verifica o HTTP e lê o JSON.
  return fetch(url.toString(), { signal: activeController.signal })
    .then(response => {
      if (response.status === 404) {
        const error = new Error('Nenhum resultado');
        error.empty = true;
        throw error;
      }
      if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (currentRequest !== requestId) return;
      console.log('[RickAndMorty-Dex API]:', data);
      if (!data.info || !Array.isArray(data.results)) throw new Error('Resposta inesperada da API');
      state.pages = data.info.pages;
      cardsContainer.replaceChildren();
      // O fragmento agrupa os cards; appendChild os insere no container inicialmente vazio.
      const fragment = document.createDocumentFragment();
      data.results.forEach(character => fragment.appendChild(createCharacterCard(character)));
      cardsContainer.appendChild(fragment);
      resultsCount.textContent = `${data.info.count.toLocaleString('pt-BR')} personagens encontrados · ${data.results.length} nesta página`;
      if (data.results.length === 0) showMessage('Nenhum personagem encontrado nesta dimensão');
    })
    // .catch distingue ausência de resultados de falhas de rede ou do serviço.
    .catch(error => {
      if (currentRequest !== requestId || error.name === 'AbortError') return;
      state.pages = 0;
      if (error.empty) {
        resultsCount.textContent = '0 personagens encontrados';
        showMessage('Nenhum personagem encontrado nesta dimensão', 'Tente outro nome ou limpe os filtros para explorar novamente.');
      } else {
        resultsCount.textContent = 'Não foi possível consultar os personagens';
        showMessage('O portal está indisponível', 'Verifique sua conexão com a internet e tente novamente.', true);
        console.error('[RickAndMorty-Dex erro]:', error);
      }
    })
    .finally(() => {
      if (currentRequest !== requestId) return;
      state.loading = false;
      cardsContainer.setAttribute('aria-busy', 'false');
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
