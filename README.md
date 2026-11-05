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
- Dicionário de 228 combinações, com posições calculadas, inversões e diagramas. Quatro cordas, casas 0–12 e extensão máxima de quatro casas; todas as notas da fórmula, sem omissões. Exige conferência de conforto por professor.
- Repertório: TXT e ChordPro, edição, transposição ±12 semitons, consulta de acordes, biblioteca local, exportação e rolagem. PDF até 10 MB apenas para consulta visual, sem reconhecimento de notas. Texto limitado a 1 MB e 100 mil caracteres.

## Afinador 0.5.0

A nota captada é distinta da nota-alvo. A referência usa `440 * 2 ** ((MIDI - 69) / 12)`; desvio em cents: `1200 * log2(captada / referência)`. Abaixo pede mais agudo; acima, mais grave. Não ajuste por uma leitura muito distante sem conferir a corda e a nota captada.

O modo cavaquinho usa picos espectrais interpolados e suporte harmônico na região das cordas soltas (250–850 Hz), além da análise temporal. Isso evita selecionar automaticamente o pico mais forte quando ele é um harmônico. O modo cromático usa periodicidade YIN com checagem de correlação. Ambos têm limites em ambientes ruidosos. Não há garantia de precisão universal: resultados devem ser confrontados com gravações e referências externas.

Verde depende de sequência de leituras estáveis; um valor isolado não confirma afinação. Após perda de sinal, **Última leitura** conserva o ponteiro por até 2,5 segundos e depois o limpa. Diagnóstico técnico exportável inclui estado, nível, frequências estimadas e alvo; não contém áudio ou nomes de dispositivos. Microfone exige HTTPS (ou localhost) e permissão do usuário. Nenhum áudio é enviado a servidores. Gravações são temporárias: baixe antes de sair da seção.

## Validação

`npm test` cobre fórmulas, referências MIDI independentes, migração, posições de acordes, direção e desvio em notas detunadas, retenção, ruído e harmônicos. `npm run check` verifica sintaxe.

Com Playwright Python e Chromium disponíveis, inicie o app e rode `python test/audio_browser.py`. `APP_URL` escolhe outro endereço de teste local. O roteiro gera áudio temporário para testar microfone compartilhado, nota, palhetada com decaimento, erro de permissão e direção do ajuste. A versão 0.5.0 também foi confrontada localmente com a gravação fornecida pelo usuário; essa gravação não é distribuída.
