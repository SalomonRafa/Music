# Separação de voz para o Mestre de Cavaquinho

## Estado desta entrega

A interface e a API estão implementadas. O serviço NÃO está hospedado nem contratado.
O GitHub Pages continua atendendo somente a interface estática. A integração foi
testada com duas faixas WAV sintéticas e um motor de teste; isso não valida a
qualidade ou o desempenho do Demucs. O acesso aos pesos oficiais em
`dl.fbaipublicfiles.com` foi negado pelo proxy do ambiente de desenvolvimento
(HTTP 403 no CONNECT). A imagem Docker ainda não foi construída/executada.
Não anunciar a separação como disponível antes dos passos de aceitação abaixo.

Modelo: Demucs 4.0.1 / htdemucs, duas saídas `vocals` e `no_vocals`.
Referência e licença: https://github.com/facebookresearch/demucs (MIT).
Não usa nem se conecta à API do vocalremover.org. Não se promete remoção perfeita.

## Hospedagem e orçamento para decidir

Estimativas de planejamento em USD, não cotações atuais ou compromisso com provedor.
Verificar preço, região, impostos, tráfego, armazenamento e câmbio antes de contratar.
Dimensionamento inicial conservador: 2–4 vCPUs, 8 GB RAM, 10 GB disco livre.
O desempenho real e uso de memória ainda devem ser medidos; CPU pode levar minutos
por faixa. Não usar funções HTTP curtas: o worker precisa sobreviver até 30 minutos.

| Opção | Faixa para planejamento | Tradeoff |
| --- | --- | --- |
| Computador pessoal já disponível | Sem mensalidade adicional de nuvem; energia e internet | Precisa permanecer ligado; uso pelo celular exige HTTPS/rede acessível configurados |
| VPS Linux com 8 GB RAM | US$ 10–35/mês | Melhor previsibilidade para uso pessoal; exige atualizações e operação do servidor |
| Plataforma com contêiner sempre ativo e 8 GB RAM | US$ 40–100+/mês | Mais simples de operar, geralmente mais cara nessa memória |
| GPU sob demanda | US$ 0,30–1,50 por hora ativa, mais armazenamento/tráfego | Mais rápida; exige suspensão automática para limitar custo |

Apenas como cálculo: 10 horas de GPU nessa faixa seriam US$ 3–15 de processamento;
ligada 720 horas, US$ 216–1.080. NÃO é medição do tempo necessário para suas músicas.
Não há garantia de oferta gratuita permanente que comporte esse processamento.

Consultar propostas reais: [Hetzner Cloud](https://www.hetzner.com/cloud/),
[DigitalOcean](https://www.digitalocean.com/pricing/droplets),
[Render](https://render.com/pricing), [RunPod](https://www.runpod.io/pricing).
Recomendação inicial: testar em computador disponível; para acesso estável pelo
celular, avaliar VPS de 8 GB antes de contratar GPU. Nenhum custo foi autorizado.

## Subir em servidor após escolher hospedagem

1. Instalar Docker no servidor. Não criar conta paga ou recurso sem autorização.
2. Criar `.env` privado e fora do Git, com chave aleatória (não colocar segredo na URL):
   ```sh
   python -c 'import secrets; print("SEPARATOR_TOKEN=" + secrets.token_urlsafe(32))' > .env
   chmod 600 .env
   ```
   Acrescentar `SEPARATOR_ORIGINS=https://salomonrafa.github.io`.
3. Construir e executar (diretório `services/separator`):
   ```sh
   docker build -t cavaco-separator .
   docker volume create cavaco-models
   docker run -d --name cavaco-separator --restart unless-stopped \
     --env-file .env --memory 8g --cpus 4 \
     -p 127.0.0.1:8000:8000 \
     -v cavaco-models:/home/app/.cache/torch cavaco-separator
   ```
4. Terminar HTTPS em proxy reverso (Caddy/Nginx/plataforma), mantendo a porta 8000
   privada. Permitir upload de 40 MB, timeout de upload de 120 segundos, requisições
   de download de 120 segundos. A fila usa polling; não manter um POST aberto por
   todo o processamento. Não registrar o cabeçalho Authorization.
5. Liberar saída HTTPS para downloads do Torch/Demucs, incluindo
   `dl.fbaipublicfiles.com`. O modelo carrega/baixa ao iniciar; `/health` só retorna
   `ready: true` depois que isso funciona. Cache persistente evita novos downloads.
6. No app → Áudio → Separar voz e instrumental → Conexão, informar o endereço
   HTTPS e a chave pessoal. A chave fica em memória, somente enquanto a tela está
   aberta, e deve ser reinserida depois de sair. O endereço é salvo no navegador.
   Nenhum arquivo é enviado apenas por escolher o arquivo ou verificar conexão.

Alternativa local de desenvolvimento (Python 3.11 recomendado):
```sh
python3.11 -m venv .venv
. .venv/bin/activate
pip install torch==2.5.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
# Configurar SEPARATOR_TOKEN por variável de ambiente privada.
python run.py
```
Para celular/Pages, usar HTTPS acessível: loopback do computador não é loopback do celular.

## Dados, limites e operação

- Uma chave para serviço pessoal. Não é um serviço multiusuário com contas.
- Todos os endpoints requerem Bearer, exceto o preflight CORS; origens explícitas.
- Upload binário, até 40 MB; sondagem real por FFprobe; máximo 600 segundos.
- FFmpeg decodifica para WAV estéreo 44,1 kHz antes da inferência.
- Uma separação por vez, até duas tarefas ativas (incluindo upload/fila) e seis
  resultados no total. Sem fila ilimitada. CPU fixa e timeout de inferência 30 min.
- Arquivos e resultados ficam em diretório temporário por ID aleatório, não no Git
  ou em URL pública. Downloads passam por autenticação e viram URLs Blob locais.
- Cancelamento interrompe o subprocesso e solicita exclusão. Saída da tela solicita
  DELETE; se a conexão falhar, os resultados expiram 1 h após terminar, com limpeza
  a cada 30 segundos. Jobs ativos não são apagados durante leitura/processamento.
- Encerramento normal do servidor cancela tarefas e apaga resultados; não há
  retomada após reiniciar. Em produção usar disco temporário/limpeza externa para
  resíduos após falha abrupta do host. Persistir somente cache de modelos.
- WAV ocupa muito mais espaço que MP3: downloads podem ser grandes no celular.
- Voz, ecos e instrumentos podem vazar entre faixas. Não usar cancelamento estéreo
  como se fosse equivalente a separação por IA.

## Aceitação antes de ativar no app público

1. Instalar dependências exatas e carregar os pesos oficiais; `/health` ready.
2. Separar gravação própria/autorizada curta com voz + instrumentos. Ouvir as duas
   saídas e conferir duração, volume, ausência de cortes e resíduos; depois uma
   faixa de 3–5 minutos. Registrar tempo e pico de RAM/disco para precificar.
3. Testar de iPhone/Android via HTTPS: envio, fila, download, velocidade, repetição,
   cancelamento e reabertura. Verificar exclusão, falha de rede e limite de arquivo.
4. Confirmar autenticação/CORS, segredo fora do Git e orçamento escolhido.

Testes de contrato (sem carregar modelo):
```sh
pip install httpx
python -m unittest discover -v -s services/separator -p test_service.py
```
Do diretório raiz do repositório. O teste usa motor sintético; não há áudio real do usuário.
