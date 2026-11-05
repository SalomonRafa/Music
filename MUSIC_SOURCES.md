# Referência de afinação

A afinação brasileira utilizada pelo projeto, da 4ª à 1ª corda, é **D4–G4–B4–D5** (MIDI 62, 67, 71, 74). A referência Lá4 é 440 Hz, em temperamento igual:

| Corda | Nota | Frequência |
|---|---|---|
| 4ª | Ré4 | 293,664768 Hz |
| 3ª | Sol4 | 391,995436 Hz |
| 2ª | Si4 | 493,883301 Hz |
| 1ª | Ré5 | 587,329536 Hz |

Fonte consultada: [MuseScore, definição de instrumento cavaquinho, branch 3.x](https://github.com/musescore/MuseScore/blob/3.x/share/instruments/instruments.xml#L10260), `StringData` com 62, 67, 71, 74. Consultada em 05/11/2026. Essas alturas foram também confrontadas com os quatro grupos de notas presentes na amostra fornecida pelo usuário, sem presumir afinação perfeita da amostra.

As versões anteriores do projeto usaram **incorretamente** D4–G3–B3–D4. A versão 0.5.0 corrige as referências, os diagramas e o perfil armazenado com esse padrão. A definição única está em `src/instrument.js`. Não abaixe as cordas uma oitava para se adequar ao padrão antigo.

Os diagramas são posições calculadas pelas classes de altura, ainda sem revisão de técnica ou conforto por professor. A gravação pessoal usada na investigação não é incluída no repositório.
