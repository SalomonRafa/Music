# Mestre de Cavaquinho

Aplicativo pessoal em português para planejar e registrar a prática de cavaquinho. Primeira versão: perfil, roteiros de 5 a 30 minutos, exercícios fundamentais, cronômetro, metrônomo com Web Audio e histórico exportável em JSON.

## Executar

Requer Node.js 22 ou superior. Não há dependências externas de execução.

```sh
cd /workspace/Music
npm start
```

O servidor escuta na porta 3000 em todas as interfaces. `PORT` permite escolher outra porta. Use o encaminhamento de portas do seu ambiente para abrir a aplicação. Em execução local, abra o endereço local correspondente à porta 3000.

## Validar

## Publicar no GitHub Pages

Em Settings → Pages do repositório, selecione **Deploy from a branch**, branch **main** e pasta **/ (root)**. Salve. O site esperado é `https://salomonrafa.github.io/Music/`. Os arquivos são estáticos e não precisam de build; o servidor Node é usado apenas no desenvolvimento. Os caminhos relativos permitem executar no subdiretório `/Music/`.

## Testes

```sh
npm run check
npm test
```

## Limites desta versão

- Dados persistidos apenas no localStorage do navegador, sem conta ou sincronização. Exportação disponível no histórico. Sessões em andamento não sobrevivem a recarregamento; o navegador alerta antes de sair.
- Nenhuma chamada a modelos, análise de áudio ou avaliação automática da execução. Não exige chave de API.
- Exercícios de iniciação; diagramas de acordes e repertório específico aguardam revisão musical. Afinação comum declarada da 4ª para a 1ª corda: D4–G3–B3–D4.
- Metrônomo via Web Audio com agendamento por temporizador: adequado a prática inicial, sujeito a limitações de temporização do navegador. Para ao ocultar a aba.
- Os minutos e resultados registrados são relatos do aluno. O cronômetro não comprova domínio técnico.

## Próximos passos

Revisar o conteúdo com professor de cavaquinho, adicionar importação de backup, biblioteca de acordes validada e comparação de registros do mesmo exercício. Análise de áudio depende de validação específica posterior.
