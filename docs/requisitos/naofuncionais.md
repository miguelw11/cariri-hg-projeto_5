# Requisitos Não Funcionais

Este documento apresenta os requisitos não funcionais do Sistema de Monitoramento de Perdas da Esteira E1.

Os requisitos descrevem características relacionadas ao funcionamento, desempenho, confiabilidade, usabilidade, manutenção e operação do sistema.

---

## RNF01 — Atualização em tempo próximo do real

Eventos registrados pelos sensores ou pelo totem deverão ser disponibilizados para visualização no sistema em poucos segundos quando os dispositivos estiverem conectados normalmente à rede.

Não existe necessidade de atualização em escala de milissegundos para o dashboard.

---

## RNF02 — Operação em rede local

As principais funcionalidades deverão ser capazes de operar através de uma rede local.

A disponibilidade de acesso à internet externa não deverá ser obrigatória para:

- contagem dos sensores;
- registro dos descartes;
- armazenamento local;
- funcionamento do backend;
- consulta ao dashboard dentro da rede.

---

## RNF03 — Disponibilidade do servidor

Durante a operação da solução, o notebook responsável pelo servidor deverá permanecer:

- ligado;
- conectado à alimentação;
- conectado à rede local;
- com suspensão automática desativada.

---

## RNF04 — Persistência dos dados

Eventos já armazenados no banco de dados não deverão ser perdidos após reinicializações normais da aplicação.

---

## RNF05 — Integridade das contagens

Um mesmo evento de sensor não deverá incrementar a contagem mais de uma vez.

---

## RNF06 — Rastreabilidade dos registros

Os registros armazenados deverão possuir informações suficientes para identificar quando ocorreram e a qual produção estão relacionados.

---

## RNF07 — Separação das fontes de perda

O sistema deverá manter claramente separadas:

- perdas registradas manualmente durante a triagem;
- perdas calculadas entre entrada e saída da E1.

Essa separação deverá existir tanto no armazenamento quanto na apresentação das informações.

---

## RNF08 — Facilidade de uso do totem

A interface utilizada pela funcionária deverá exigir poucas interações para realizar um registro de descarte.

As opções principais deverão ser facilmente identificáveis e adequadas ao uso repetitivo durante a operação.

---

## RNF09 — Responsividade

A interface do totem deverá funcionar adequadamente em telas de dispositivos como:

- tablet;
- notebook;
- computador.

---

## RNF10 — Clareza do dashboard

Os principais indicadores deverão ser apresentados de maneira visualmente clara e permitir que o usuário diferencie facilmente:

- produção em andamento;
- produção finalizada;
- entrada;
- saída;
- descartes da triagem;
- perdas da E1.

---

## RNF11 — Não apresentar diferença momentânea como perda definitiva

Durante uma produção ativa, a interface deverá deixar claro que a diferença entre entrada e saída é apenas momentânea.

A classificação como perda da E1 deverá ocorrer somente após o encerramento da produção.

---

## RNF12 — Modularidade

Os componentes de hardware e software deverão possuir responsabilidades separadas.

Exemplo:

- ESP32: aquisição e transmissão;
- backend: processamento;
- banco: persistência;
- totem: registro manual;
- dashboard: visualização.

Essa separação deverá permitir manutenção e evolução independentes dos componentes.

---

## RNF13 — Extensibilidade

A arquitetura deverá permitir futuras expansões sem exigir reconstrução completa da solução.

Exemplos:

- novos sensores;
- outras esteiras;
- novos indicadores;
- outros dispositivos de registro;
- novas visualizações.

---

## RNF14 — Manutenibilidade

O código deverá ser organizado em módulos e armazenado em um sistema de controle de versão Git.

---

## RNF15 — Documentação

Os principais componentes da solução deverão possuir documentação no repositório.

A documentação deverá incluir, quando aplicável:

- configuração;
- instalação;
- arquitetura;
- hardware;
- testes;
- uso.

---

## RNF16 — Identificação dos dispositivos

Cada dispositivo utilizado na solução deverá possuir um identificador próprio.

Exemplos:

```text
sensor-entrada-e1
sensor-saida-e1
```

---

## RNF17 — Monitoramento de comunicação

Os dispositivos de sensoriamento deverão enviar informações suficientes para que o sistema determine se continuam conectados e operacionais.

---

## RNF18 — Segurança elétrica

A ligação entre os sensores e os ESP32 deverá respeitar os níveis de tensão suportados pelos componentes.

Nenhum sinal acima do limite suportado pelos GPIOs do ESP32 deverá ser conectado diretamente ao microcontrolador.

---

## RNF19 — Proteção física

Em uma instalação piloto na empresa, circuitos eletrônicos não deverão permanecer expostos em protoboards.

Os componentes deverão ser instalados em invólucros ou estruturas adequadas ao ambiente de operação.

---

## RNF20 — Fixação dos sensores

Os sensores deverão possuir fixação capaz de manter sua posição e calibração durante a utilização.

---

## RNF21 — Validação com produtos reais

O E18-D80NK deverá ser testado utilizando amostras reais dos produtos da empresa antes da adoção definitiva.

Os testes deverão contemplar variações relevantes, como:

- cores;
- acabamento;
- posicionamento;
- distância;
- velocidade de passagem.

---

## RNF22 — Precisão da contagem

A precisão mínima aceitável dos sensores deverá ser definida após os testes de bancada e a validação junto à empresa.

Até essa validação, o projeto não deverá assumir uma taxa de precisão industrial sem evidências experimentais.

---

## RNF23 — Recuperação de falhas

Falhas de um componente deverão ser identificáveis sem serem confundidas automaticamente com ausência de produção.

Por exemplo, um sensor offline não deverá ser interpretado simplesmente como contagem igual a zero.

---

## RNF24 — Comunicação padronizada

A comunicação entre ESP32 e servidor deverá utilizar um formato padronizado de mensagens.

Cada evento deverá possuir campos previamente definidos para facilitar integração e manutenção.

---

## RNF25 — Baixo custo

A solução deverá priorizar componentes e tecnologias de custo compatível com um projeto piloto, evitando equipamentos industriais de alto valor quando uma alternativa mais econômica puder cumprir os requisitos validados.

---

## RNF26 — Tecnologias abertas ou gratuitas

Sempre que possível, deverão ser priorizadas ferramentas gratuitas ou de código aberto.

A arquitetura inicialmente prevista utiliza:

- Eclipse Mosquitto;
- FastAPI;
- PostgreSQL;
- Grafana;
- Git.

---

## RNF27 — Independência entre hardware e dashboard

A lógica de cálculo e armazenamento não deverá depender diretamente da interface utilizada para visualização.

Dessa forma, o Grafana poderá futuramente ser substituído por outro dashboard sem exigir alteração significativa no firmware dos sensores.

---

## RNF28 — Histórico

Os dados de produções encerradas deverão permanecer disponíveis para consultas posteriores, respeitando a política de retenção que vier a ser definida com a empresa.

---

## RNF29 — Consistência das unidades

Toda contagem apresentada para a produção deverá utilizar a mesma unidade adotada pelo projeto.

Inicialmente:

```text
1 unidade = 1 par de solados
```

Qualquer alteração futura nessa regra deverá ser documentada.

---

## RNF30 — Testabilidade

Os componentes deverão permitir testes independentes.

Por exemplo:

- backend utilizando eventos simulados;
- dashboard utilizando dados fictícios;
- ESP32 sendo testado sem o dashboard;
- totem sendo testado através de uma API de desenvolvimento.

Isso permitirá que diferentes integrantes da equipe desenvolvam suas partes em paralelo.

---

# Resumo

Os requisitos não funcionais podem ser agrupados em:

| Categoria | Requisitos |
|---|---|
| Desempenho e operação | RNF01 a RNF05 |
| Dados e consistência | RNF06, RNF07, RNF24, RNF28, RNF29 |
| Usabilidade | RNF08 a RNF11 |
| Arquitetura e manutenção | RNF12 a RNF17, RNF27, RNF30 |
| Hardware | RNF18 a RNF23 |
| Custos e tecnologias | RNF25, RNF26 |

Os valores quantitativos ainda não definidos, principalmente os relacionados à precisão dos sensores, deverão ser estabelecidos com base nos testes experimentais realizados durante o desenvolvimento.