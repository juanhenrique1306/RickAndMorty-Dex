# Roteiro de vídeo pitch — RickAndMorty-Dex

Duração planejada: **3 minutos e 45 segundos**, dentro do limite de 4 minutos. Antes de gravar, use uma conexão com acesso à API, abra `index.html` no navegador e deixe os arquivos no editor. Ajuste o zoom para que a interface e o código fiquem legíveis. Feche abas e informações pessoais. Faça uma consulta prévia para conferir a disponibilidade; não apresente dados simulados como respostas reais.

## 1. Demonstração em tempo real — 0:00 a 1:00

- **0:00–0:15:** apresente o título e diga: “Este é o RickAndMorty-Dex, um projeto acadêmico UniFECAF feito com HTML, CSS e JavaScript puro. Os personagens são consultados na API pública.” Recarregue e mostre a mensagem de carregamento e os cards.
- **0:15–0:30:** destaque em um card a imagem, nome, status, espécie, gênero, origem, localização e quantidade de episódios.
- **0:30–0:45:** digite `Rick`, selecione `Vivo (Alive)` e clique em **Buscar**. Mostre o contador e os resultados filtrados.
- **0:45–1:00:** clique em **Próxima**, mostre o indicador de página, volte com **Anterior** e use **Limpar filtros**. Explique que os filtros são mantidos durante a paginação.

## 2. Demonstração técnica no DevTools — 1:00 a 2:00

- **1:00–1:20:** pressione `F12` (ou clique direito → **Inspecionar**). Abra **Network/Rede**, selecione **Fetch/XHR** e recarregue a página. Localize a chamada `character/?page=1`; abra-a e mostre o status **200**, o método GET e os parâmetros. Se houver falha, explique-a e regrave quando o acesso real estiver disponível.
- **1:20–1:40:** na chamada, abra **Preview/Response** para mostrar `info` e `results`. Depois abra **Console**, localize `[RickAndMorty-Dex API]:` e expanda o objeto e um personagem. Relacione os campos aos dados do card.
- **1:40–2:00:** abra **Elements/Elementos**, use `Ctrl+F` para buscar `cards-container` e expanda a seção. Mostre os artigos `.character-card` e seus nós `img`, `h3`, badge e `dl`. Explique: “Esses elementos existem no DOM após a consulta; não estão escritos no HTML inicial.”

## 3. Explicação do HTML e CSS — 2:00 a 2:45

- **2:00–2:20:** no editor, abra `index.html`. Procure `id="cards-container"` e destaque a seção vazia e o comentário imediatamente anterior. Mostre também o carregamento de `js/app.js` com `defer`, o formulário e os controles de paginação. A pesquisa por esses trechos evita depender de números de linhas que podem mudar.
- **2:20–2:45:** abra `css/style.css`, destaque `:root` e as variáveis de cores. Procure `.cards-grid` e explique `repeat(auto-fill, minmax(270px, 1fr))`. Mostre as media queries e reduza a largura do navegador para demonstrar a adaptação para celular.

## 4. Validação do Fetch e DOM dinâmico no JS — 2:45 a 3:45

- **2:45–3:10:** abra `js/app.js`, procure `function fetchCharacters` e destaque a URL e os parâmetros. Mostre `fetch()`, os dois `.then()`, o `console.log` e o `.catch()`. Explique que HTTP 404 representa ausência de resultados e outros erros oferecem nova tentativa.
- **3:10–3:30:** procure `function createCharacterCard`. Destaque `document.createElement('article')`, `document.createElement('img')`, os atributos da imagem e `card.appendChild(image)`. Mostre a criação dos detalhes e a inserção do fragmento no container.
- **3:30–3:45:** conclua: “A aplicação constrói os cards a partir do JSON, sem bibliotecas, innerHTML ou etapa de build. Pode ser aberta diretamente pelo index.html, com internet, ou pelo Live Server. O repositório inclui o relatório teórico e as instruções de execução.”

**Checklist de gravação:** tempo abaixo de 4 minutos; chamada real com 200; objeto expandido no console; container vazio no arquivo versus preenchido no DOM; funções de criação visíveis; áudio e texto legíveis. Não é necessário mostrar todo o código nem ler o relatório durante o pitch.
