# RickAndMorty-Dex — Relatório teórico

Projeto acadêmico de desenvolvimento front-end — UniFECAF. Implementação com HTML5, CSS3 e JavaScript Vanilla. O objetivo é demonstrar consumo de dados externos e construção dinâmica de uma interface acessível, sem frameworks, bibliotecas ou compilação. A extensão final de duas a três páginas depende da fonte, das margens e do espaçamento escolhidos na exportação para PDF.

## 1. O que é uma API e como funciona o consumo de dados em tempo real

Uma API (Application Programming Interface) é um contrato de comunicação entre sistemas. Ela define quais operações estão disponíveis, os parâmetros aceitos e o formato das respostas. Na arquitetura cliente-servidor deste projeto, o navegador é o cliente: ele apresenta a interface e solicita informações. O serviço The Rick and Morty API é o servidor responsável por disponibilizar os registros dos personagens.

Uma API REST organiza informações como recursos acessíveis por URLs e utiliza a semântica do protocolo HTTP. A consulta de personagens emprega GET, operação de leitura que não altera os registros do servidor. A URL identifica a coleção e os parâmetros de consulta selecionam uma página ou restringem os resultados. A resposta transporta dados em JSON, formato textual que representa objetos, listas e valores primitivos, independentemente da aparência final da interface.

O acesso ocorre de forma assíncrona: o navegador inicia a requisição e continua respondendo às interações enquanto aguarda o serviço. O projeto exibe uma mensagem de carregamento durante essa espera e trata falhas sem recarregar o documento inteiro. Aqui, “tempo real” significa buscar os dados disponíveis na API no momento da interação, em vez de usar cards escritos manualmente. Não há transmissão contínua, WebSocket nem atualização automática em segundo plano. Internet e disponibilidade do serviço são necessárias; o navegador também depende da política CORS do servidor para permitir a leitura entre origens, inclusive ao abrir a página por `file://`.

## 2. Conceito de DOM Manipulation e criação de elementos dinâmicos via JavaScript

O DOM (Document Object Model) representa um documento HTML como uma árvore de objetos. Cada elemento pode possuir atributos, texto e nós descendentes. JavaScript permite localizar esses objetos, criar novos elementos e estabelecer relações de parentesco entre eles. Manipular o DOM significa modificar essa representação para que o navegador atualize a interface apresentada.

No arquivo `index.html`, a seção `#cards-container` começa vazia. Depois da resposta da API, a função `createCharacterCard(character)` cria um artigo para cada registro. A imagem, o título, o status e a lista de informações são construídos individualmente. A estrutura reflete o objeto recebido e não depende de uma quantidade fixa de personagens definida no HTML.

Essa abordagem evita duplicação de marcação e permite que busca e paginação reutilizem a mesma função. O projeto utiliza `textContent` para inserir nomes e descrições como texto, sem interpretar o conteúdo recebido como HTML. Os cards são agrupados em um `DocumentFragment` antes da inserção na seção. A substituição dos resultados anteriores usa `replaceChildren()`, enquanto a montagem dos cards usa explicitamente `createElement()` e `appendChild()`.

## 3. Explicação das funções básicas utilizadas no projeto

Os trechos abaixo correspondem à implementação de `js/app.js`. A função `fetchCharacters(page, name, status)` constrói uma URL com `URL` e `searchParams`, codificando corretamente espaços e caracteres especiais. O método `fetch()` inicia a comunicação e devolve uma Promise, que representa um resultado futuro:

```js
return fetch(key);
```

A variável `key` contém a URL completa da consulta. Antes de acessar a rede, o projeto procura uma resposta em cache com validade de cinco minutos. Enquanto uma consulta está em andamento, novos envios são ignorados e os botões ficam desabilitados. Cada consulta não armazenada aguarda 10 segundos após a solicitação antes de iniciar o GET, incluindo a consulta inicial e a tentativa manual após falhas. Durante esse período e a requisição, a interface apresenta uma animação de carregamento, sem contagem regressiva visível. Isso evita sobreposição e reduz chamadas repetidas, sem prometer eliminar limites aplicados pelo servidor.

O primeiro `.then()` recebe um objeto `Response`, verifica o status HTTP e converte o corpo para JSON. O `fetch()` não rejeita automaticamente uma resposta HTTP de erro; por isso, a verificação de `response.ok` é necessária. O código distingue o status 404, tratado como ausência de personagens, dos demais erros. A leitura assíncrona do corpo é feita por:

```js
if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
return response.json();
```

O `.then()` seguinte recebe os dados interpretados, registra o objeto no console e cria os cards. Esse registro facilita a demonstração técnica e a comparação entre a resposta da rede e os elementos exibidos:

```js
console.log('[RickAndMorty-Dex API]:', data);
data.results.forEach(character => fragment.appendChild(createCharacterCard(character)));
```

O método `.catch()` trata erros de rede, HTTP e processamento. Uma busca sem resultados exibe “Nenhum personagem encontrado nesta dimensão”. Em falhas de comunicação, a interface oferece um botão para tentar novamente. Um HTTP 429 acessível ao script inicia uma espera baseada no cabeçalho `Retry-After`, em segundos ou data HTTP; sem valor válido, a pausa é de 60 segundos. Falhas genéricas geram uma pausa de 10 segundos, pois CORS pode ocultar o status real. Nenhuma consulta é reenviada automaticamente. O `.finally()` encerra o estado de carregamento e atualiza os controles de paginação.

A criação clássica de elementos fica evidente no início de cada card:

```js
const card = document.createElement('article');
card.className = 'character-card';
const image = document.createElement('img');
```

`document.createElement()` cria um nó, mas não o coloca automaticamente na página. Os atributos `src`, `alt` e `loading` configuram a imagem, enquanto `appendChild()` estabelece a hierarquia:

```js
card.appendChild(image);
card.appendChild(body);
return card;
```

O artigo retornado contém nome, badge de status, espécie, gênero, origem, última localização e número de episódios. A imagem usa carregamento tardio (`lazy`) para reduzir downloads de conteúdo fora da área visível. Os botões de navegação permanecem desabilitados durante consultas e nos limites da coleção.

## 4. Motivo da escolha da API (Rick and Morty API)

A animação Rick and Morty oferece um contexto reconhecível e um universo amplo de personagens, espécies e dimensões. Essa variedade favorece uma interface visual e torna os filtros relevantes para a exploração. O tema também justifica o uso de cores neon, fundo escuro e referências a portais, sem prejudicar a legibilidade das informações.

Tecnicamente, a API fornece registros estruturados e imagens, permitindo demonstrar texto, atributos de imagem e listas de informações no DOM. O acesso público dispensa um token privado no código do navegador. A paginação e os filtros nativos evitam baixar toda a coleção para executar buscas simples. A resposta inclui metadados úteis, como total de registros e número de páginas, que alimentam os indicadores da interface. Assim, a escolha atende simultaneamente ao objetivo didático e à experiência de uso.

## 5. Regras de acesso e documentação da API utilizada

O endpoint REST da coleção é `https://rickandmortyapi.com/api/character`. A aplicação utiliza sua forma com barra final e parâmetros de consulta. Uma consulta ilustrativa é `https://rickandmortyapi.com/api/character/?page=1&name=Rick&status=alive`. O parâmetro `page` seleciona a página, `name` filtra pelo nome e `status` aceita `alive`, `dead` ou `unknown`. Parâmetros de filtro vazios são omitidos. A documentação também descreve outros filtros, mas eles não são necessários para o fluxo implementado.

O acesso é público, sem chave ou token. As respostas da coleção são paginadas, com até 20 registros por página. O objeto `info` informa `count`, `pages`, `next` e `prev`; a lista `results` contém os personagens. O exemplo a seguir é um recorte ilustrativo do formato, não uma promessa de totais atuais:

```json
{
  "info": { "count": 1, "pages": 1, "next": null, "prev": null },
  "results": [
    {
      "id": 1,
      "name": "Rick Sanchez",
      "status": "Alive",
      "species": "Human",
      "gender": "Male",
      "origin": { "name": "Earth (C-137)", "url": "https://rickandmortyapi.com/api/location/1" },
      "location": { "name": "Citadel of Ricks", "url": "https://rickandmortyapi.com/api/location/3" },
      "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      "episode": ["https://rickandmortyapi.com/api/episode/1"]
    }
  ]
}
```

Não se estabelece neste relatório uma cota numérica de requisições por minuto: limites operacionais e políticas podem mudar e devem ser conferidos na documentação oficial. Paginação não equivale a limite de frequência. O projeto evita consultas a cada tecla digitada, realiza buscas por envio do formulário e não implementa repetição automática em caso de falha. Serviços públicos devem ser utilizados com moderação, e a ausência de autenticação não garante disponibilidade ilimitada. A verificação da documentação online e da API real foi bloqueada pela política de rede do ambiente durante esta entrega; não se apresenta essa consulta como realizada.

Referência oficial: [The Rick and Morty API — Documentation](https://rickandmortyapi.com/documentation). A documentação é a fonte para conferir parâmetros, formatos e eventuais alterações das regras de acesso.
