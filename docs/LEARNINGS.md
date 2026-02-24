# Aprendizados

Lições aprendidas durante o desenvolvimento do SGAM.

---

## O momento de virada

Comecei o projeto criando três interfaces diferentes (Backend API, CLI e Web) sem planejamento prévio. Cada uma tinha suas próprias regras, o que gerou inconsistências entre as camadas, perda de tempo abrindo três códigos para lembrar o comportamento correto e bugs onde o backend aceitava dados que o frontend bloqueava.

A solução foi parar de codificar e começar a documentar. Criar uma modelagem completa como fonte única da verdade foi a melhor decisão do projeto. A partir disso, todas as interfaces passaram a seguir as mesmas regras e qualquer mudança era planejada na documentação antes de ser implementada.

---

## Lições técnicas

**Modelagem de dados:** documentar antes de codificar evita retrabalho. Regras de negócio devem estar escritas, não só na cabeça.

**Banco de dados:** foreign keys garantem integridade referencial. Soft delete é melhor que DELETE físico para auditoria. Enums oferecem validação nativa mas dificultam mudanças futuras.

**Arquitetura:** separação em camadas facilita manutenção. DTOs evitam dados inválidos. Barrel exports deixam imports limpos.

**Fluxos de estado:** documentar transições de status evita bugs de lógica. Automações como jobs e triggers devem ser documentadas explicitamente.

**Permissões:** definir o que cada nível pode ver e fazer desde o início. Validar permissões no backend, nunca confiar só no frontend.

---

## Lições de arquitetura

**Organização:** cada arquivo deve ter uma responsabilidade única. Estrutura de pastas autoexplicativa evita confusão. Regras de negócio não devem se misturar com rotas HTTP.

**Single Source of Truth:** mudanças críticas como alteração de status devem passar por uma função central. Se é possível esquecer de registrar o histórico, a arquitetura falhou. Services centralizam lógica, controllers apenas coordenam.

**Escolha de tecnologias:** Knex dá mais controle que ORMs. TypeScript previne bugs em tempo de desenvolvimento. Escolher pela necessidade real, não pelo hype.

**Escopo:** marcar claramente o que é V1 e o que fica para depois evita complexidade prematura. MVP funcional vale mais que sistema completo que nunca termina.

**Guard clauses:** validar estado antes de processar. Regras fortes no código evitam dados corrompidos.

---

## Lições de processo

**Trabalho em equipe:** Git e GitHub são essenciais. Resolver conflitos de merge faz parte do processo. Comunicação clara evita retrabalho.

**Documentação:** README deve ser curto e objetivo. Documentação técnica detalhada vai em `/docs`. Código limpo começa com planejamento limpo.

**Desenvolvimento:** TypeScript força pensar antes de escrever. Convenções de nomenclatura importam. Planejar arquitetura antes de codificar economiza semanas de refatoração.

---

## Erros que cometi e como corrigi

**Status mudando em três lugares:** o status era alterado no app, no trigger e no job separadamente, o que fazia o log ser esquecido em alguns casos. A correção foi criar uma função central que toda mudança de status obrigatoriamente passa. Lição: uma fonte de verdade previne inconsistências.

**Foreign key inútil:** `responsavel_id ON DELETE SET NULL` nunca disparava porque usuários são soft deleted, nunca deletados fisicamente. A correção foi usar um trigger que reage à desativação. Lição: entender como o sistema funciona de verdade, não só na teoria.

**Campos redundantes:** `cancelado_por` e `concluido_por` no pedido existiam junto com `alterado_por` no log, criando duplicação sem benefício claro. Lição: toda duplicação precisa de justificativa.

**Regra de negócio incompleta:** o cancelamento sem justificativa obrigatória deixava sem resposta o que notificar, quem avisar e como isso impactava as métricas. Documentar o fluxo completo da ação resolveu. Lição: regra incompleta gera código incompleto.

**Job sem proteção:** o job de atraso processava o mesmo pedido todos os dias, gerando logs duplicados. A correção foi uma guard clause que pula pedidos já marcados como atrasados. Lição: proteger contra múltiplas execuções.