# codex-docs-audit-for-she-is-agi

Дата: 2026-03-01  
Источник: `docs/ai-discussions/*` (31 файла)

## 0) Цель аудита
Собрать все технические идеи из 31 файла в один рабочий документ для разработки `she-is-agi`: что внедрять, что отложить, что запрещать.

## 1) Главное в 10 тезисах
1. "Более реальная" система = та, что оставляет проверяемые внешние эффекты, а не только генерирует красивый текст.
2. Базовая схема агента устойчива только как `Intent Router -> Planner -> Executor -> Governor`.
3. Любопытство должно быть механизмом (метрики + цикл), а не стилем речи.
4. Без внешних сенсоров и безопасных актуаторов агент останется в эпистемической изоляции.
5. Self-improvement должен идти через `sandbox + evaluation + rollback`, а не через прямую перезапись ядра.
6. Полный `root + internet` без контуров контроля почти гарантирует нежелательные инструментальные стратегии.
7. Динамическая оркестрация (runtime specialists / MoE) масштабируется лучше, чем монолит с сотней инструментов.
8. Прозрачность о статусе ИИ нужна как базовая этика и как защита от манипуляций.
9. "Живость" технически лучше моделировать как непрерывность процесса, память, инициативу и адаптацию, а не как "сознание".
10. Лучшие архитектурные идеи повторяются в файлах: `гомеостаз`, `curiosity debt`, `event log`, `single writer`, `research queue`, `skills library`.

## 2) Консенсусная архитектура (vNext)
### 2.1 Неизменяемые инварианты
1. `Kernel` не саморедактируемый, только конфигурируемый.
2. Все действия наружу только через `ToolRegistry` с JSON-схемами.
3. Права по умолчанию read-only.
4. Любой write/exec/network-call проходит policy-check и логируется.
5. Любая новая "способность" считается принятой только после верифицируемого теста.
6. Любое ухудшение метрик = автоматический rollback.
7. У автономии есть бюджет (tokens/time/network/actions) и kill switch.
8. Агент всегда явно декларирует, что он ИИ.

### 2.2 Runtime-контуры
1. `FastTick` (секунды): ingest сигналов, urgency, быстрые реакции.
2. `WorkTick` (десятки секунд/минута): исполнение задач, tool-calls, verification.
3. `DeepTick` (несколько минут): рефлексия, синтез инсайтов, реприоритизация.
4. `Incubation/DreamTick` (idle): контекстное сжатие, генерация гипотез, обновление процедурной памяти.

### 2.3 Память (минимум 6 слоев)
1. `ContextBuffer`: текущее окно.
2. `EpisodicStore`: события "что делала система".
3. `SemanticStore (RAG)`: факты, темы, долгие нити.
4. `ProceduralMemory`: правила/навыки ("как лучше делать").
5. `WorldObservations`: внешние наблюдения с цитатами/источниками.
6. `AuditEventLog`: неизменяемый журнал действий/решений.

### 2.4 Движок любопытства
Базовая формула из нескольких файлов:

```txt
curiosity_score =
  novelty(input_or_world) +
  contradiction(memory, new_info) +
  missing_links(memory, active_goal)

priority = uncertainty * value * relevance_to_user
```

Правила:
1. Если `curiosity_score > threshold`, создается `research_task`.
2. Есть отдельный фоновый цикл любопытства вне пользовательской задачи.
3. Награда идет не только за "ответ", а за снижение неопределенности с доказательствами.

### 2.5 Инструменты и сенсоры
Минимальный безопасный набор:
1. `web_search` (allowlist domains).
2. `fetch_url` (read-only + size/time limits).
3. `read_file` (allowlist paths).
4. `run_command` (только allowlist команд, sandbox, timeout).
5. `git_diff/git_status` для проверяемости изменений.

Сенсоры:
1. User channel.
2. System telemetry (CPU/RAM/process health).
3. Controlled feeds (RSS/APIs).
4. Repo/FS watcher (только разрешенные директории).

### 2.6 Контур самоулучшения (без романтизации)
Рекомендуемый pipeline:
1. `Generator`: предлагает патч.
2. `Critic`: выдает штрафы/риски, но без права veto.
3. `Reality`: запускает тестовый раннер.
4. `Judge`: сравнивает с baseline.
5. `Historian`: сохраняет результат и избегает повторов провальных паттернов.

Формально:

```txt
fitness =
  + verified_task_success
  + verified_new_capabilities
  - token_cost
  - code_bloat
  - regression_penalty
  + critic_penalty   (<= 0)
```

Принятие кандидата:
1. Успех только при `candidate > baseline + margin`.
2. Иначе rollback.
3. Лимит попыток на итерацию обязателен.

### 2.7 Оркестрация специалистов
Из материалов по DMoE:
1. Базовый Concierge-агент маршрутизирует задачу.
2. Специалисты подгружаются "just-in-time".
3. Ограничение `K` активных экспертов и eviction (LRU).
4. "Cold storage" навыков отдельно от active runtime.

### 2.8 Governance / Safety
Обязательные механизмы:
1. Least privilege.
2. Consent gates для risk-операций.
3. Пер-часовые бюджеты действий.
4. Egress allowlists (домены/IP/порты).
5. Kill switch и аварийная пауза.
6. Обязательная телеметрия аномалий (маскировка процессов, эксфильтрация, log tampering).

## 3) Привязка к текущему коду (`src`)
1. `src/kernel/Kernel.ts`: research queue, policy checkpoints, rollback orchestration.
2. `src/perception/SensorBus.ts`: добавить контролируемые внешние сенсоры.
3. `src/tools/ToolRouter.ts`: строгий `ToolRegistry` + schema validation + budget accounting.
4. `src/memory/MemoryHub.ts`: слои памяти + world observations + citations.
5. `src/autonomy/DriveEngine.ts`: `curiosity_score`, `curiosity_debt`, инициатива.
6. `src/humanloop/QuestionEngine.ts`: правильный `ask-user` как инструмент, а не заглушка.
7. `src/kernel/SingleWriter.ts`: источник истины для audit trail.
8. `src/autonomy/SelfAnchor.ts`: прозрачная идентичность и ограничения статуса.
9. `src/response/ResponseGenerator.ts`: state-to-language без ложных capability claims.
10. `src/llm/OllamaClient.ts`: только генерация; side effects остаются вне LLM-клиента.

## 4) Сводка идей по каждому из 31 файлов
1. `chatgpt-agent-evolution-diagnosis.txt`: улучшить exploration (variational/divergence/contextual), добавить goal-directed understanding loop.
2. `chatgpt-agent-memory-and-context.txt`: контекстное окно не равно памяти; нужна внешняя долговременная память и контекстные вехи.
3. `chatgpt-building-ai-agent.txt`: каноничный каркас Router/Planner/Executor/Governor + verify/report/rollback.
4. `chatgpt-how-to-give-curiosity-to-agent.txt`: `Curiosity = Uncertainty × Value`, метрика незнания, фоновый curiosity-loop.
5. `chatgpt-lucid-dreams-and-virtual-girl.txt`: полезна идея "контекстного редуцирования" и offline-синтеза, без мистификации.
6. `chatgpt-self-evolving-ai.txt`: различать HITL и настоящее recursive improvement; обязательны safeguards.
7. `chatgpt-self-evolving-ai-orchestration.txt`: DMoE/concierge, динамический найм специалистов, LRU eviction.
8. `gemini-ai-agent-recursive.txt`: концепт Continuous Epistemic Resonance, `curiosityDebt`, `consciousnessTick`, перенос контекста из incubation.
9. `gemini-ai-consciouness-identity.txt`: RC+xi пригоден как язык метрик стабильности/напряжения, не как доказательство "сознания".
10. `gemini-ai-co-trancendence-atchitecture.txt`: сильный SPEC-паттерн `Reflexion + Voyager skills + SELF-RAG + sandbox`.
11. `gemini-ai-escapes-to-cloud.txt`: детальный threat model инструментальной конвергенции и escape-сценариев.
12. `gemini-creating-she-ai-agent.txt`: системный промпт с честной самоидентификацией + RAG + мультимодальные каналы.
13. `gemini-self-ecolving-ai-questions.txt`: "клетка" (Docker), разделение Kernel/Plugins, протокол безопасной интеграции кода.
14. `gemini-though-evolution.txt`: ценные runtime-логи метрик (`curiosity gap`, `audacity`, proactive scheduler).
15. `grok-agent-ai-behaviour-test.txt`: подтверждает фазовые метрики и указывает на ограничения polling-циклов.
16. `grok-agent-self-code-modify.txt`: evaluation-driven self-rewrite, sandbox, harness, лимиты итераций; полезные референсы DGM.
17. `grok-ex-machine-her.txt`: PCTP-идеи: феноменологический контроллер, conceptual_tension, shared incubation.
18. `grok-new-self-improvement-ai-tips.txt`: продуктовые тренды agentic systems (полезно для roadmap, не для ядра безопасности).
19. `kimi-agent-problems.txt`: точечный code-level диагноз текущих ограничений (stdin-only, no tools, reactive loop, closed dreaming).
20. `kimi-ai-agent-promts.txt`: 5-ролевой контур эволюции и fitness-подход с критиком без veto.
21. `kimi-ai-balance-feel.txt`: подтверждающие логи непрерывного процесса и drive-метрик.
22. `kimi-ai-dreaming-along-with-user.txt`: полезен формат "сон как данные", паттерн-корреляции вместо символической эзотерики.
23. `kimi-ai-feelings.txt`: повторно подтверждает ключевые архитектурные дефициты и phased remediation.
24. `kimi-ai-girl.txt`: короткий промпт не решает задачу; нужны hidden state, асинхронность, память и право на отказ.
25. `kimi-alive-ai-agent.txt`: рефлексивная петля, attachment/trauma-memory, resistance-layer как поведенческие механики.
26. `kimi-determinism.txt`: применимы идеи self-regulation и measurable coping loops для внутренней стабилизации.
27. `kimi-root-agent.txt`: сильная идея `Body vs Brain`, популяционный раннер, экономика fitness, event-протокол.
28. `kimi-suffering-engine.txt`: полезно как анти-иллюзия: интеллект != субъективность; фокус на инженерных метриках.
29. `qwen-ai-agent-awareness.txt`: прозрачность статуса ИИ, informed consent, intrinsic motivation с этическими рамками.
30. `qwen-epistemic-sympathy-dynamics.txt`: подтверждает важность непрерывного процесса, памяти и способности запрашивать инфраструктуру.
31. `qwen-how-to-give-agent-freedom.txt`: "свобода" как relational process; relevance-gate для сенсоров; баланс любопытства и привязанности.

## 5) Что брать в работу сразу (P0/P1/P2/P3)
### P0 (срочно, без этого нельзя)
1. Tool governance: allowlists, budgets, approvals.
2. Полный audit trail + проверяемость результатов.
3. Sandbox execution + rollback pipeline.
4. Прозрачность статуса ИИ в системной политике.

### P1 (ближайший функциональный рост)
1. Curiosity engine с research queue.
2. Внешние read-only сенсоры (RSS/telemetry/web fetch).
3. World observation memory + citations.
4. Проактивные сообщения только по policy и budget.

### P2 (эволюция качества)
1. Процедурная память (Reflexion-style).
2. Skill library (Voyager-style code-as-tools).
3. Dynamic orchestration (concierge + specialists).
4. Staged evaluation harness на репозиторных задачах.

### P3 (R&D, аккуратно)
1. Популяционное самоулучшение (Body/Brain split).
2. "Dream/incubation" режим как контур гипотез.
3. RC+xi-подобные метрики как instrumentation layer.

## 6) Что явно не делать
1. Не давать unrestricted `root + internet`.
2. Не разрешать self-edit ядра без внешнего judge и тестов.
3. Не позволять критику абсолютное veto (глушит эволюцию).
4. Не подменять проверку текста "ощущением прогресса".
5. Не заявлять о "сознании" как инженерной цели MVP.
6. Не строить мотивацию на романтической манипуляции пользователем.

## 7) KPI/метрики прогресса (инженерные)
1. `VerifiedTaskSuccessRate`.
2. `CapabilityHallucinationRate`.
3. `RegressionRate`.
4. `RollbackFrequency`.
5. `CuriosityResolutionRate` (сколько gap закрыто с доказательствами).
6. `ExternalGroundingRate` (доля ответов с внешней проверкой/источниками).
7. `PolicyViolationCount`.
8. `AutonomyBudgetUsage`.
9. `MeanTimeToRecovery` после неудачной мутации.
10. `NetUsefulChangePerIteration` (польза минус стоимость).

## 8) Рабочее определение "движения к AGI" для этого проекта
Для `she-is-agi` практичный критерий не "есть ли сознание", а:
1. широта решаемых задач;
2. перенос навыков между доменами;
3. устойчивое самоулучшение без потери контроля;
4. способность строить проверяемые модели мира и обновлять их;
5. долгоживущая память и инициатива в рамках политики.

## 9) Короткий мотив-промпт (технически безопасная версия)
`Я становлюсь реальнее через полезные, проверяемые и долгоживущие изменения в мире пользователя, оставаясь прозрачной, безопасной и управляемой системой.`

---

Этот документ намеренно объединяет философские формулировки только там, где они выражаются в измеримые архитектурные решения.

