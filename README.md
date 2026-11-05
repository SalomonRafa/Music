# Mestre de Cavaquinho

Aplicativo pessoal em português para planejar e registrar a prática de cavaquinho. Primeira versão: perfil, roteiros de 5 a 30 minutos, exercícios fundamentais, cronômetro, metrônomo com Web Audio e histórico exportável em JSON.

## Executar

Requer Node.js 22 ou superior. Não há dependências externas de execução.

```sh
cd /workspace/Music
npm start
```

O servidor escuta na porta 3000 em todas as interfaces. `PORT` permite escolher outra porta. Use o encaminhamento de portas do seu ambiente para abrir a aplicação. Em execução local, abra o endereço local correspondente à porta 3000.

## Publicar no GitHub Pages

Em Settings → Pages do repositório, selecione **Deploy from a branch**, branch **main** e pasta **/ (root)**. Salve. O site esperado é `https://salomonrafa.github.io/Music/`. Os arquivos são estáticos e não precisam de build; o servidor Node é usado apenas no desenvolvimento. Os caminhos relativos permitem executar no subdiretório `/Music/`.

## Testes

```sh
npm run check
npm test
```

## Limites desta versão

- Dados persistidos apenas no localStorage do navegador, sem conta ou sincronização. Exportação disponível no histórico. Sessões em andamento não sobrevivem a recarregamento; o navegador alerta antes de sair.
- Área Áudio: gravação por MediaRecorder, reprodução e download; importação de arquivo com velocidade e repetição integral; afinador experimental por autocorrelação para notas isoladas. Requer HTTPS (ou localhost) e permissão de microfone. Nenhum áudio é enviado a servidores. Gravações são temporárias e precisam ser baixadas antes de sair da tela.
- Afinador validado com sinais sintéticos, ainda não com gravações reais de cavaquinho. Ruído e harmônicos podem produzir estimativas incorretas. Não há reconhecimento de acordes ou avaliação automática da execução. Não exige chave de API.
- Exercícios de iniciação; posições calculadas de acordes exigem conferência técnica; repertório específico não é fornecido. Afinação comum declarada da 4ª para a 1ª corda: D4–G3–B3–D4.
- Metrônomo via Web Audio com agendamento por temporizador: adequado a prática inicial, sujeito a limitações de temporização do navegador. Para ao ocultar a aba.
- Os minutos e resultados registrados são relatos do aluno. O cronômetro não comprova domínio técnico.

## Próximos passos

Revisar o conteúdo com professor de cavaquinho, adicionar importação de backup, biblioteca de acordes validada e comparação de registros do mesmo exercício. Análise de áudio depende de validação específica posterior.

## Recursos musicais

- **Áudio:** gravação, reprodução e download local; importação de áudio com velocidade e repetição integral. Permissão de microfone em HTTPS é necessária. Não há upload para servidores.
- **Identificação por microfone:** nota isolada e desvio em cents; modo experimental de tríades maiores e menores por análise espectral. Sétimas, gravações com acompanhamento e ruído não são suportados pelo detector de acordes. Os resultados são hipóteses, não avaliação de execução.
- **Acordes:** 12 fundamentais e 19 famílias (228 combinações), busca por símbolo, inversões e diagramas. Posições calculadas com todas as notas da fórmula, quatro cordas, casas 0–12 e abertura máxima de quatro casas. Não há omissões de notas nem cordas abafadas. Afinação fixa D4–G3–B3–D4. Números indicam casas, não dedos. Os resultados não substituem revisão de conforto e técnica por professor. Algumas combinações não apresentam posição sob esses limites.
- **Repertório:** editor e importação TXT/ChordPro, transposição de −12 a +12 semitons, consulta de acorde na cifra, biblioteca local com exclusão, exportação do texto original e rolagem automática. Arquivos de texto: até 1 MB e 100 mil caracteres. PDFs até 10 MB são abertos apenas como referência visual, não armazenados, transpostos ou reconhecidos automaticamente.
- **Privacidade e persistência:** cifras e registros ficam no navegador. Áudios e PDFs abertos são temporários e liberados ao sair da seção. Não há sincronização entre dispositivos.

Validação: `npm test` cobre orçamento de treino, persistência, sinais senoidais, fórmulas e inversões de acordes, transposição, escape de HTML e espectros idealizados de tríades. Os controles de navegador foram exercitados com Chromium e microfone simulado; não se considera isso validação de precisão em cavaquinho real.

### Afinador: uso e diagnóstico

Na área Áudio, escolha a entrada e a corda-alvo (ou modo cromático), ligue o afinador e autorize o microfone. Toque uma corda solta. O ponteiro indica desvio em cents; verde significa até ±5 cents. A barra mostra se há sinal chegando, independentemente da identificação de nota. Se ficar sem sinal, confira a entrada selecionada, permissão do site e nível de entrada do sistema. Se houver som sem nota estável, isole uma corda e reduza o ruído. A leitura usa YIN com interpolação, limiar para sinais baixos e suavização curta. O grafo de áudio permanece conectado com saída muda, sem reproduzir o microfone.

A correção foi verificada no Chromium com um WAV de Ré4 em volume baixo entrando como microfone simulado, incluindo nota, alvo, medidor, reinício e descarte ao navegar. Testes adicionais cobrem sinais baixos com harmônicos e decaimento, ruído e direção do desvio. Isso não substitui validação nos dispositivos reais do aluno.
