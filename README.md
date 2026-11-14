# RickAndMorty-Dex

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)
![Rick and Morty API](https://img.shields.io/badge/Rick_and_Morty-API-00b5cc)

Explorador de personagens de **Rick and Morty**, desenvolvido como projeto acadêmico UniFECAF. Consulta a API pública e constrói todos os cards dinamicamente, com JavaScript Vanilla e manipulação clássica do DOM.

## Funcionalidades

- Busca por nome e filtro por status, aplicados pelo botão Buscar ou pela tecla Enter.
- Paginação com preservação dos filtros e indicação de limites.
- Cards com imagem, nome, status, espécie, gênero, origem, última localização e número de episódios.
- Contador, carregamento, busca sem resultados, falha de conexão e nova tentativa.
- Bloqueio de consultas simultâneas, cache temporário e espera de 10 segundos antes de consultas novas.
- Tema escuro, grid responsivo, navegação por teclado, labels e anúncios de estado.
- JSON registrado no console a cada consulta bem-sucedida.

## Tecnologias

HTML5 semântico, CSS3 com variáveis, Grid e media queries, JavaScript ES6+, Fetch API, Promises e DOM. Nenhum framework, biblioteca, gerenciador de pacotes ou build é necessário. Rubik e Inter são carregadas pelo Google Fonts; fontes locais de sistema funcionam como alternativa.

## Estrutura

```text
RickAndMorty-Dex/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── docs/
│   ├── RELATORIO_TEORICO.md
│   └── ROTEIRO_VIDEO_PITCH.md
└── README.md
```

## Executar localmente

```bash
git clone https://github.com/juanhenrique1306/RickAndMorty-Dex.git
cd RickAndMorty-Dex
```

Abra **index.html** diretamente no navegador (`file://`). O script é clássico, carregado com `defer`, sem imports ou leitura de arquivos locais via fetch. É necessária conexão à internet para consultar a API e carregar imagens. O acesso por `file://` depende de o navegador e o serviço permitirem a requisição por CORS; nenhuma configuração de segurança deve ser desativada.

Como alternativa, no VS Code instale a extensão **Live Server**, clique com o botão direito em `index.html` e escolha **Open with Live Server**. Se já houver Python instalado, também é possível usar `python3 -m http.server 8000` nesta pasta e abrir `http://localhost:8000`. Node.js não é necessário para executar o projeto.

## API e inspeção técnica

Endpoint: `https://rickandmortyapi.com/api/character/`. Parâmetros utilizados: `page`, `name` e `status` (`alive`, `dead`, `unknown`). Não é necessário token. O projeto busca dados a cada consulta, sem atualização contínua.

Abra o DevTools com `F12`. Em **Network → Fetch/XHR**, inspecione `character` e o JSON da resposta. Em **Console**, expanda `[RickAndMorty-Dex API]:`. Em **Elements**, compare os artigos de `#cards-container` com a seção vazia no arquivo HTML. A função `createCharacterCard()` usa `createElement()` e `appendChild()`; não utiliza `innerHTML`.

## Validação manual

1. Abra a página e confira cards e contador; a primeira página deve desabilitar Anterior.
2. Busque `Rick` com status Vivo e confira nome, badge e parâmetros na rede.
3. Avance e retorne uma página; os filtros devem permanecer ativos.
4. Busque um nome inexistente e confira a mensagem de nenhum resultado.
5. Limpe os filtros e confira a página 1 com a coleção completa.
6. No DevTools, ative o modo offline e faça uma busca ainda não consultada. Confira o erro e a pausa de 10 segundos; volte ao modo online e clique em Tentar novamente após a liberação.
7. Durante uma busca, confirme que Buscar, Limpar filtros e paginação ficam desabilitados. O envio por Enter também não deve gerar consultas simultâneas.
8. Confira o layout em 375 px, tablet e desktop e navegue pelo formulário usando Tab e Enter.

A validação automatizada em localhost passou para cards, busca, filtro de status, paginação, vazio, erro com nova tentativa, controle de concorrência e ausência de rolagem horizontal em 375, 768 e 1440 px, usando respostas simuladas. A checagem de sintaxe `node --check js/app.js` também passou. O teste de abertura por `file://` foi bloqueado pela política administrativa do navegador gerenciado; essa modalidade permanece sem validação neste ambiente. Isso não comprova acesso à API real: esse acesso foi bloqueado por HTTP 403 na política de rede do ambiente de desenvolvimento. A documentação e as fontes externas também dependem de liberação de rede. Não há dados simulados nem dependências de teste dentro da aplicação entregue.

## Proteção contra excesso de consultas (HTTP 429)

- Resultados são mantidos em memória por **5 minutos**, com limite de **30 consultas**. A chave inclui página, nome e status; resultados vazios também são reutilizados. Recarregar a página elimina esse cache.
- Voltar a uma página ou repetir uma busca no cache não gera um novo GET. Não há pré-carregamento de páginas.
- Cada consulta nova aguarda **10 segundos após a solicitação**, inclusive a inicial e as tentativas manuais após falhas. Durante a espera e o acesso à rede, uma animação de carregamento é exibida, sem timer visível; os botões ficam bloqueados e novos envios são ignorados. A animação respeita a preferência de movimento reduzido. Aguarde a conclusão antes de aplicar outra busca.
- Quando um HTTP 429 é acessível ao JavaScript, a aplicação respeita `Retry-After` em segundos ou data HTTP. Se ausente, inválido ou oculto por CORS, usa **60 segundos** para o 429 identificado. Esse valor é uma escolha conservadora do projeto, não uma cota oficial da API.
- Erros genéricos, incluindo respostas ocultas por CORS, impõem pausa de **10 segundos** sem afirmar que a causa é necessariamente um 429.
- Após a pausa, a tentativa manual é liberada, sem contagem regressiva visível. Não há repetição automática, e a liberação do botão não garante que o bloqueio do servidor terminou.

Testes em navegador com respostas simuladas verificaram cache, expiração, navegação sem GET repetido, espera de 10 segundos sem timer visível, bloqueio de concorrência, cache de 404, HTTP 429 com `Retry-After` em segundos e data, ausência/erro do cabeçalho, pausa após falha de rede e recuperação manual. O acesso à API real permanece sem comprovação no ambiente restrito. Essas proteções reduzem chamadas desta página; não controlam consultas de outras abas, dispositivos ou usuários do mesmo IP.

## Entrega acadêmica

Consulte o [relatório teórico](docs/RELATORIO_TEORICO.md) e o [roteiro do pitch](docs/ROTEIRO_VIDEO_PITCH.md). Para gerar PDF, abra o relatório em um editor Markdown com exportação ou impressão e ajuste a formatação para duas a três páginas. O pitch está planejado para 3min45s.

Após publicar os commits no GitHub, use **Code → Download ZIP**. Para gerar um ZIP do último commit local, execute:

```bash
git archive --format=zip --output=../RickAndMorty-Dex.zip HEAD
```

Extraia o ZIP antes de abrir `index.html`; mantenha as pastas `css` e `js` junto dele.

## Créditos

Projeto educacional UniFECAF, sem afiliação oficial à animação. Personagens e imagens pertencem aos respectivos titulares, incluindo Adult Swim. Dados fornecidos pela [The Rick and Morty API](https://rickandmortyapi.com/). Consulte a [documentação oficial](https://rickandmortyapi.com/documentation) para parâmetros e regras atualizadas.
