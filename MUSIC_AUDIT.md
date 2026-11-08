# Auditoria musical do dicionário — 08/11/2026

**Estado: revisão parcial do catálogo completo, com a apostila enviada já analisada.** Veja a [revisão crítica do PDF](audit/REVISAO_APOSTILA_CAVAQUINHO.md).

## Correção comprovada nesta entrega

A imagem “Casa de Bamba” fornecida pelo usuário documenta Bbm nas casas **3–3–2–3**, dedos **2–3–1–4**, sem pestana, da 4ª à 1ª corda. Afinação brasileira usada: D4–G4–B4–D5. A disposição soa F–Bb–Db–F. O aplicativo substituía essa digitação por uma pestana calculada no dedo médio. Agora a referência explícita de dedos e pestanas é preservada em todas as telas. As transposições fechadas compatíveis também preservam os dedos; transposições que exigem dedo em corda solta são recusadas pela validação e não recebem esse selo.

A origem “Casa de Bamba” é a imagem anexada pelo usuário. Não foi localizado/consultado um endereço original dessa imagem na web, nem medida sua frequência de uso. A correção não é prova de revisão técnica de todas as outras posições. Naquela etapa, o planejador das demais famílias foi preservado. Na versão 0.18.0, a regra automática passou a permitir repetição apenas do indicador em uma pestana na menor casa pressionada; digitações documentadas prevalecem sobre esse cálculo. Isso é uma restrição conservadora, não certificação de conforto.

## Fontes externas efetivamente consultadas

1. [MuseScore — definição do cavaquinho](https://github.com/musescore/MuseScore/blob/3.x/share/instruments/instruments.xml): StringData 62, 67, 71, 74, confirmando D4–G4–B4–D5. O campo de trastes do instrumento genérico dessa fonte não substitui o limite de **12 informado pelo usuário**. Esta fonte não documenta digitações.
2. [Tonal — catálogo de fórmulas](https://github.com/tonaljs/tonal/blob/main/packages/chord-type/data.ts): comparação independente de intervalos, não de técnica de cavaquinho. Hash SHA-256 do conteúdo consultado: `daf18640a75f600e392bc8be32a144fa3528f1b2f5ce7fddb61d4dab941ef778`. O próprio arquivo identifica como origem a lista de padrões do Wikibooks; essa página do Wikibooks não foi consultada diretamente.

A comparação das 48 famílias encontrou **41 com as mesmas classes de altura**, **6 diferenças de convenção** e **1 sem equivalente localizado**. Isso não certifica as digitações nem classifica automaticamente as diferenças como erro.

## Divergências que exigem decisão musical documentada

- `11`: o app usa empilhamento com terça; Tonal omite a terça na definição de 11. Não converter automaticamente todo 11 em sus sem conferir a convenção usada no material de cavaquinho.
- `13`, `maj13`, `m13` e `13(b9)`: o app inclui a 11ª natural na fórmula teórica; a fonte consultada não a inclui nessas definições. A forma de acompanhamento precisa ser confrontada com material do instrumento.
- `7(b13)`: a fonte omite a quinta justa na fórmula; o app a admite e explicita sua omissão nas adaptações.
- `7sus2`: não foi localizado um alias correspondente nessa base. Isso não demonstra inexistência ou erro do acorde.

Não houve alteração silenciosa dessas fórmulas nesta entrega.

## Cobertura por família

A tabela abaixo cobre fórmulas genéricas, transponíveis às 12 fundamentais. A apostila enviada acrescenta referências de seis famílias, em posições específicas. As demais famílias e as posições não cobertas continuam sem revisão documental de digitação; transposições são rotuladas como derivadas.

| Família | Intervalos do app (semitons) | Comparação externa de fórmula | Revisão de digitação em material de cavaquinho |
|---|---|---|---|
| 5 | 0, 7 | Mesmas classes de altura | Pendente |
| 6 | 0, 4, 7, 9 | Mesmas classes de altura | Pendente |
| 7 | 0, 4, 7, 10 | Mesmas classes de altura | Apostila: 12/12 fundamentais, posições específicas |
| 9 | 0, 4, 7, 10, 14 | Mesmas classes de altura | Pendente |
| 11 | 0, 4, 7, 10, 14, 17 | Convenção diferente — pendente | Pendente |
| 13 | 0, 4, 7, 10, 14, 17, 21 | Convenção diferente — pendente | Pendente |
| Maior | 0, 4, 7 | Mesmas classes de altura | Apostila: 12/12 fundamentais, posições específicas |
| m | 0, 3, 7 | Mesmas classes de altura | Apostila: 11/12 fundamentais, posições específicas |
| maj7 | 0, 4, 7, 11 | Mesmas classes de altura | Apostila: 7/12 fundamentais, posições específicas |
| m7 | 0, 3, 7, 10 | Mesmas classes de altura | Apostila: 9/12 fundamentais, posições específicas |
| m6 | 0, 3, 7, 9 | Mesmas classes de altura | Pendente |
| dim | 0, 3, 6 | Mesmas classes de altura | Pendente |
| dim7 | 0, 3, 6, 9 | Mesmas classes de altura | Pendente |
| m7b5 | 0, 3, 6, 10 | Mesmas classes de altura | Apostila: 9/12 fundamentais, posições específicas |
| aug | 0, 4, 8 | Mesmas classes de altura | Pendente |
| sus2 | 0, 2, 7 | Mesmas classes de altura | Pendente |
| sus4 | 0, 5, 7 | Mesmas classes de altura | Pendente |
| 7sus4 | 0, 5, 7, 10 | Mesmas classes de altura | Pendente |
| 7sus2 | 0, 2, 7, 10 | Sem equivalente localizado | Pendente |
| 9sus4 | 0, 5, 7, 10, 14 | Mesmas classes de altura | Pendente |
| 13sus4 | 0, 5, 7, 10, 14, 21 | Mesmas classes de altura | Pendente |
| add9 | 0, 4, 7, 14 | Mesmas classes de altura | Pendente |
| madd9 | 0, 3, 7, 14 | Mesmas classes de altura | Pendente |
| mMaj7 | 0, 3, 7, 11 | Mesmas classes de altura | Pendente |
| maj7b5 | 0, 4, 6, 11 | Mesmas classes de altura | Pendente |
| maj7#5 | 0, 4, 8, 11 | Mesmas classes de altura | Pendente |
| 7b5 | 0, 4, 6, 10 | Mesmas classes de altura | Pendente |
| 7#5 | 0, 4, 8, 10 | Mesmas classes de altura | Pendente |
| maj9 | 0, 4, 7, 11, 14 | Mesmas classes de altura | Pendente |
| m9 | 0, 3, 7, 10, 14 | Mesmas classes de altura | Pendente |
| maj11 | 0, 4, 7, 11, 14, 17 | Mesmas classes de altura | Pendente |
| m11 | 0, 3, 7, 10, 14, 17 | Mesmas classes de altura | Pendente |
| 7(13) | 0, 4, 7, 10, 21 | Mesmas classes de altura | Pendente |
| maj13 | 0, 4, 7, 11, 14, 17, 21 | Convenção diferente — pendente | Pendente |
| m13 | 0, 3, 7, 10, 14, 17, 21 | Convenção diferente — pendente | Pendente |
| 6/9 | 0, 4, 7, 9, 14 | Mesmas classes de altura | Pendente |
| m6/9 | 0, 3, 7, 9, 14 | Mesmas classes de altura | Pendente |
| 7(b9) | 0, 4, 7, 10, 13 | Mesmas classes de altura | Pendente |
| 7(#9) | 0, 4, 7, 10, 15 | Mesmas classes de altura | Pendente |
| 7(#11) | 0, 4, 7, 10, 18 | Mesmas classes de altura | Pendente |
| 7(b13) | 0, 4, 7, 10, 20 | Convenção diferente — pendente | Pendente |
| 9(#11) | 0, 4, 7, 10, 14, 18 | Mesmas classes de altura | Pendente |
| 7(b9,b13) | 0, 4, 7, 10, 13, 20 | Mesmas classes de altura | Pendente |
| m7(11) | 0, 3, 7, 10, 17 | Mesmas classes de altura | Pendente |
| maj7(#11) | 0, 4, 7, 11, 18 | Mesmas classes de altura | Pendente |
| 7(b9,#11) | 0, 4, 7, 10, 13, 18 | Mesmas classes de altura | Pendente |
| 7(#9,b13) | 0, 4, 7, 10, 15, 20 | Mesmas classes de altura | Pendente |
| 13(b9) | 0, 4, 7, 10, 13, 17, 21 | Convenção diferente — pendente | Pendente |

## Bloqueio e continuação da pesquisa

O proxy retornou HTTP 403 no CONNECT para o Cifra Club. GitHub e raw.githubusercontent.com funcionaram. O ChordPro consultado oferece configurações de ukulele/guitarra, mas não foi encontrado um arquivo específico de cavaquinho no diretório consultado; não foi usado como referência de digitação. Geradores de outros instrumentos não validam os desenhos deste instrumento.

Foi salva uma proposta de liberação de rede, sem aplicar ou publicar: Cifra Club, Cifras.com.br, Descomplicando a Música, mecanismos de busca e API pública do GitHub. Para acesso efetivo, o usuário precisa revisar/salvar/publicar a alteração nas configurações do ambiente, conforme o fluxo da plataforma. Publicar o ambiente é separado de atualizar o aplicativo. Após a ativação, testar nova conexão antes de prosseguir.

A apostila do usuário foi posteriormente recebida e analisada; a continuação para as famílias ausentes exige localizar outros materiais específicos de cavaquinho, registrar autor/URL/afinação e orientação das cordas; comparar casas, notas, dedos e pestanas das formas-base; classificar divergências; incluir apenas referências rastreáveis e transposições compatíveis. Critérios de conforto e repertório não se comprovam por igualdade de notas.

## Evidência e reprodução

O registro estruturado por família está em [audit/chord-formula-review.json](audit/chord-formula-review.json). Para repetir a comparação com uma cópia do arquivo externo, execute `node scripts/audit-external-formulas.mjs caminho/tonal-chord-types.ts`. Não exige acesso à rede durante os testes. Os testes internos de cobertura e de notas continuam separados da revisão externa; sua aprovação não significa endosso por professor.

## Atualização com o PDF enviado

A leitura crítica do material de Betto Correa gerou referências com páginas e digitações explícitas e identificou divergências no próprio documento. Consulte [audit/REVISAO_APOSTILA_CAVAQUINHO.md](audit/REVISAO_APOSTILA_CAVAQUINHO.md). A base documentada não é uma alegação de que todo o catálogo ou todas as suas posições estejam certificados.
