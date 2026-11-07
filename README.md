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
- Dicionário com interpretação de cifras, posições calculadas, inversões e diagramas. Instrumento de Rafael com 12 trastes, conforme informação explícita: todas as buscas limitadas às casas 0–12, extensão de mão ajustável, cordas abafadas opcionais e omissões explícitas para acordes com mais de quatro notas. Exige conferência de conforto por professor.
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

Exemplo validado: **A7(9) = A9 = A–C#–E–G–B**. A posição **7–6–8–9**, da 4ª à 1ª corda em D4–G4–B4–D5, toca **A–C#–G–B**, sem a quinta E. A sequência Casas representa posições no braço; os círculos mostram dedos sugeridos por padrão, com modo alternativo para casas.

Não se afirma que o catálogo contém toda nomenclatura ou digitação existente. As posições são candidatas sob os filtros declarados, não uma avaliação de conforto ou uma edição musical revisada. Teste de navegador opcional: `python test/chords_browser.py`, com `APP_URL` se necessário. O mesmo interpretador é usado nas cifras importadas para consulta e transposição.

## Diagramas e pestanas · versão 0.7.0

A representação e a ordenação foram revistas de forma geral. O modelo de digitação procura cobrir as notas com até quatro dedos, incluindo pestanas completas ou parciais, sem passar por cordas que precisam soar soltas ou estão abafadas. A ordenação combina número de contatos, extensão da mão, cordas abafadas, região do braço e presença da fundamental no grave. Não representa estatística de uso nem uma revisão de conforto por professor.

Por padrão, círculos mostram **dedos sugeridos (1–4)**; a barra mostra a pestana. O seletor permite voltar aos números das casas. A casa inicial fica à esquerda, e a sequência **Casas**, da 4ª à 1ª, permanece explícita em ambos os modos. Isso também vale para os diagramas consultados dentro do repertório.

Regressão de referência: **Am7, casas 7–5–5–5**, produz A–C–E–G. A sugestão é pestana na casa 5 e dedo 3 na casa 7 da 4ª corda. Essa posição já era gerada na versão anterior, mas não tinha a pestana desenhada e aparecia depois da inversão 5–5–5–7. A auditoria percorre todas as 12 fundamentais e famílias do catálogo, conferindo contatos, notas e pestanas. Não se rotulam resultados como “mais usados” sem referência musical independente.

## Organização 0.8.0

A pesquisa exibe o símbolo canônico, a família por extenso e as notas com grafia harmônica (por exemplo, D# em Bmaj7). **Bm7** é B–D–F#–A; **BM7** é uma grafia de Bmaj7, B–D#–F#–A#. A entrada desabilita capitalização automática e a segunda grafia recebe uma explicação e botão para consultar Bm7, sem converter silenciosamente um acorde em outro.

A forma aberta de Bm7 **4–2–0–0** aparece primeiro na ordenação simples, com dois dedos. A ordenação considera simplicidade antes da fundamental no grave. “Forma simples” tem critério explícito: até dois contatos de dedos, nenhuma corda abafada, abertura até três casas. Isso não equivale a afirmar tradição ou conforto revisado por professor.

Há seletores de **mais grave** e **mais agudo**. Usam a nota mais aguda da posição e a altura média para desempate, não apenas o número da casa. Cada posição exibe intervalo de registro com oitavas, cordas soltas/pestana, dedos, notas e estado fundamental/inversão. O acorde permanece o mesmo: muda a disposição das vozes, não sua tonalidade.

As famílias estão agrupadas em tríades/suspensos, sétimas, sextas/notas adicionadas, extensões e alterados. Há consulta explícita para m7(11), maj7(#11), 7(b9,#11), 7(#9,b13) e 13(b9), além das fórmulas já interpretadas. Combinações que não cabem nas quatro cordas recebem explicação e opções de omissão, não notas inventadas. Posições passam a uma grade responsiva para evitar esconder todas as variantes em uma faixa horizontal.

O usuário confirmou que **seu instrumento tem 12 trastes**. Esse limite está em `src/instrument.js` e é aplicado no gerador, nos campos de filtro e nas consultas dentro do repertório. Mesmo uma chamada com `maxFret: 24` é limitada a 12 para este instrumento. A configuração não pretende descrever todos os cavaquinhos existentes. Não são geradas posições na 14ª ou 16ª casa.

## Adaptações alternativas · 0.9.0

A revisão anterior escolhia uma única redução (quinta antes da fundamental), o que excluía formas válidas do repertório. O gerador agora enumera combinações alternativas das omissões permitidas, mantendo terça, sétima, alterações e extensão principal. Para acordes com mais de quatro alturas, as alternativas sem fundamental são incluídas por padrão e podem ser desativadas. A omissão aparece em **cada cartão**, porque não é igual em todas as posições. Um voicing sem fundamental depende do contexto harmônico e não é descrito como fórmula completa.

O alcance padrão da mão passa de quatro para **cinco casas consecutivas**; continua ajustável e não altera o limite de **12 trastes** do instrumento. São exibidas até 12 posições por página.

Referência testada: **C7(13)** tem C–E–G–Bb–A. A forma **5–3–5–7**, da 4ª à 1ª, toca **G–Bb–E–A**, omitindo C, com sugestão de dedos **2–1–3–4**. Essa forma abrangia cinco casas e era excluída por duas restrições anteriores. A correção é geral: para cada fundamental, o motor considera tanto alternativas sem quinta quanto sem fundamental, quando as opções permitem. As verificações de notas percorrem todos os resultados, não apenas os primeiros seis.

A referência enviada para **Em7(9)** é **2–0–3–4**: E–G–D–F#, sem a quinta B. Ela não é uma forma de Bm7(9), cujo conjunto é B–D–F#–A–C#. A forma **9–7–10–11** de Bm9 contém B–D–A–C#, sem a quinta F#. Ambas têm testes próprios. Na ordem de partida, formas com fundamental presente vêm antes das alternativas sem fundamental; o modo de registro permanece independente desse agrupamento.
