# Mestre de Cavaquinho

Aplicativo pessoal em português para planejar e registrar a prática de cavaquinho. Node.js 22+ para desenvolvimento; aplicação estática, sem dependências externas de execução.

```sh
npm start
npm test
npm run check
```

Servidor na porta 3000 em todas as interfaces; `PORT` altera a porta. No GitHub Pages, use Settings → Pages → Deploy from a branch → main → / (root). Endereço esperado: https://salomonrafa.github.io/Music/ . Publicar no GitHub não confirma que o deploy já terminou. Arquivos usam versão na URL para evitar mistura de módulos antigos no cache.

## Funcionalidades

- Perfil, roteiros de 5 a 30 minutos, cronômetro e metrônomo.
- Histórico local com exportação JSON. Sem conta ou sincronização entre dispositivos.
- Áudio: gravação e download, reprodução, importação com velocidade e repetição integral. Microfone compartilhado entre gravador e afinador. Use **Desligar microfone** ou saia da seção para liberar a entrada.
- Afinador cromático ou de cordas soltas de cavaquinho. Referências **D4–G4–B4–D5**, da 4ª à 1ª; veja [fontes e correção das versões anteriores](MUSIC_SOURCES.md). Perfil com o padrão incorreto antigo é migrado sem apagar sessões.
- Identificação experimental de tríades maiores/menores, sem avaliação de técnica.
- Dicionário com interpretação de cifras, posições calculadas, inversões e diagramas. Casas 0–19 por padrão (configuráveis até 24), extensão de mão ajustável, cordas abafadas opcionais e omissões explícitas para acordes com mais de quatro notas. Exige conferência de conforto por professor.
- Repertório: TXT e ChordPro, edição, transposição ±12 semitons, consulta de acordes, biblioteca local, exportação e rolagem. PDF até 10 MB apenas para consulta visual, sem reconhecimento de notas. Texto limitado a 1 MB e 100 mil caracteres.

## Afinador 0.5.0

A nota captada é distinta da nota-alvo. A referência usa `440 * 2 ** ((MIDI - 69) / 12)`; desvio em cents: `1200 * log2(captada / referência)`. Abaixo pede mais agudo; acima, mais grave. Não ajuste por uma leitura muito distante sem conferir a corda e a nota captada.

O modo cavaquinho usa picos espectrais interpolados e suporte harmônico na região das cordas soltas (250–850 Hz), além da análise temporal. Isso evita selecionar automaticamente o pico mais forte quando ele é um harmônico. O modo cromático usa periodicidade YIN com checagem de correlação. Ambos têm limites em ambientes ruidosos. Não há garantia de precisão universal: resultados devem ser confrontados com gravações e referências externas.

Verde depende de sequência de leituras estáveis; um valor isolado não confirma afinação. Após perda de sinal, **Última leitura** conserva o ponteiro por até 2,5 segundos e depois o limpa. Diagnóstico técnico exportável inclui estado, nível, frequências estimadas e alvo; não contém áudio ou nomes de dispositivos. Microfone exige HTTPS (ou localhost) e permissão do usuário. Nenhum áudio é enviado a servidores. Gravações são temporárias: baixe antes de sair da seção.

## Validação

`npm test` cobre fórmulas, referências MIDI independentes, migração, posições de acordes, direção e desvio em notas detunadas, retenção, ruído e harmônicos. `npm run check` verifica sintaxe.

Com Playwright Python e Chromium disponíveis, inicie o app e rode `python test/audio_browser.py`. `APP_URL` escolhe outro endereço de teste local. O roteiro gera áudio temporário para testar microfone compartilhado, nota, palhetada com decaimento, erro de permissão e direção do ajuste. A versão 0.5.0 também foi confrontada localmente com a gravação fornecida pelo usuário; essa gravação não é distribuída.

## Dicionário 0.6.0

A busca deixa de depender apenas de uma lista fechada de famílias. Entende extensões até 13ª, alterações, suspensões, add, no/omit e baixo após /. Aceita grafias brasileiras e equivalentes como `A7(9)`/`A9`, `C7M(9)`/`Cmaj9`, `Bm7(b5)`/`Bm7b5`, `A7/9` e notas por nome (por exemplo, `Lá7(9)`). `7+` é interpretado como sétima maior na convenção brasileira; `+` isolado significa aumentado. Termos ambíguos como `alt` precisam ter as alterações escritas. O buscador não tenta adivinhar símbolos desconhecidos.

O gerador apresenta o total de resultados e permite paginação, faixa de casas, extensão de mão e cordas abafadas. Em acordes com mais de quatro alturas, pode omitir quinta justa e, em extensões superiores, 11ª/9ª naturais, sem eliminar a extensão mais alta que define o acorde nem tensões alteradas. A fundamental só pode ser omitida com opção explícita. Cada omissão é mostrada; uma adaptação de quatro notas não é descrita como acorde completo. Se a seleção ainda requer mais de quatro alturas, a ferramenta explica esse limite em vez de inventar uma posição.

Exemplo validado: **A7(9) = A9 = A–C#–E–G–B**. A posição **7–6–8–9**, da 4ª à 1ª corda em D4–G4–B4–D5, toca **A–C#–G–B**, sem a quinta E. Os números do diagrama representam casas, não dedos.

Não se afirma que o catálogo contém toda nomenclatura ou digitação existente. As posições são candidatas sob os filtros declarados, não uma avaliação de conforto ou uma edição musical revisada. Teste de navegador opcional: `python test/chords_browser.py`, com `APP_URL` se necessário. O mesmo interpretador é usado nas cifras importadas para consulta e transposição.
