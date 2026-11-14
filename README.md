# RickAndMorty-Dex

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)
![Rick and Morty API](https://img.shields.io/badge/Rick_and_Morty-API-00b5cc)

Aplicação web para explorar personagens do universo de **Rick and Morty**, desenvolvida como projeto acadêmico da **UniFECAF**. Os dados são obtidos pela API pública e apresentados em cards criados dinamicamente com JavaScript Vanilla.

## Funcionalidades

- Pesquisa de personagens por nome.
- Filtro por status: vivo, morto ou desconhecido.
- Paginação com preservação dos filtros e contador de resultados.
- Cards com imagem, nome, status, espécie, gênero, origem, última localização conhecida e quantidade de episódios.
- Estados de carregamento, ausência de resultados e falha de consulta, com opção de nova tentativa.
- Cache temporário e controle de requisições para reduzir chamadas repetidas.
- Interface responsiva com tema escuro e elementos visuais inspirados em portais.
- Navegação por teclado, rótulos de formulário, anúncios de estado e suporte à preferência de movimento reduzido.

## Tecnologias

| Tecnologia | Aplicação |
| --- | --- |
| HTML5 | Estrutura semântica da página e formulários |
| CSS3 | Variáveis, Flexbox, CSS Grid, animações e media queries |
| JavaScript ES6+ | Filtros, paginação, controle de estado e criação dos cards |
| Fetch API e Promises | Requisições HTTP com `.then()` e `.catch()` |
| DOM API | Construção dos elementos com `document.createElement()` e `appendChild()` |
| Google Fonts | Tipografias Rubik e Inter, com alternativas locais |

O projeto utiliza CSS puro e JavaScript Vanilla, sem frameworks, bibliotecas de interface, instalação de dependências ou etapa de build.

## Estrutura do projeto

```text
RickAndMorty-Dex/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── docs/
│   └── RELATORIO_TEORICO.md
└── README.md
```

## Execução local

```bash
git clone https://github.com/juanhenrique1306/RickAndMorty-Dex.git
cd RickAndMorty-Dex
```

A aplicação pode ser aberta pelo arquivo `index.html` ou servida localmente com a extensão Live Server. A abertura direta por `file://` depende das permissões do navegador e da política CORS do serviço.

Como alternativa, com Python disponível:

```bash
python3 -m http.server 8000
```

Endereço local: `http://localhost:8000`.

A consulta de personagens e o carregamento de imagens exigem conexão com a internet. Node.js não é necessário para a execução.

## Integração com a API

**Endpoint:** `https://rickandmortyapi.com/api/character/`

| Parâmetro | Descrição |
| --- | --- |
| `page` | Página da coleção |
| `name` | Nome pesquisado |
| `status` | Status: `alive`, `dead` ou `unknown` |

O acesso é público e não exige chave ou token. Cada página retorna até 20 personagens. Os dados são consultados sob demanda, sem atualização contínua ou pré-carregamento de outras páginas.

O container `#cards-container` permanece vazio no HTML inicial. Após a resposta, `createCharacterCard()` constrói os elementos dos cards com `document.createElement()` e `appendChild()`. Os textos são inseridos com `textContent`, sem geração de cards por `innerHTML`. Os dados recebidos são registrados no console com o prefixo `[RickAndMorty-Dex API]:`.

## Carregamento e controle de requisições

Cada consulta não armazenada em cache aguarda **10 segundos** antes de acessar a API, incluindo o carregamento inicial e as tentativas manuais. Durante a espera e a requisição, a interface exibe uma animação de carregamento sem contagem regressiva visível. Os controles de consulta ficam desabilitados, evitando requisições simultâneas.

O cache mantém até **30 consultas**, com validade de **5 minutos** por entrada. A identificação considera página, nome e status. Consultas já armazenadas, incluindo resultados vazios, são exibidas imediatamente. O cache existe apenas em memória e é descartado ao recarregar a página.

Quando a API responde com **HTTP 429 — Too Many Requests** e a resposta está acessível ao JavaScript, a aplicação respeita o cabeçalho `Retry-After`, em segundos ou data HTTP. Sem um valor válido e acessível, a pausa para o 429 identificado é de **60 segundos**. Falhas genéricas de comunicação impõem uma pausa de **10 segundos** antes de liberar a tentativa manual.

Não há repetição automática após falhas. Essas medidas reduzem as chamadas realizadas pela aplicação, mas não substituem os limites do serviço. Respostas bloqueadas por CORS podem impedir a identificação do status HTTP pelo JavaScript.

## Documentação

- [Relatório teórico](docs/RELATORIO_TEORICO.md): fundamentos de APIs, manipulação do DOM, funções utilizadas e regras de acesso ao serviço.
- [Documentação oficial da API](https://rickandmortyapi.com/documentation).

## Créditos

Projeto acadêmico desenvolvido no contexto da UniFECAF. Dados e imagens fornecidos pela [The Rick and Morty API](https://rickandmortyapi.com/). Rick and Morty e seus personagens pertencem aos respectivos titulares, incluindo Adult Swim. Este projeto não possui afiliação oficial com a animação.
