# Codex Architecture Variant: Co-Transcendence Runtime

Дата и время: `2026-03-01 20:21:19`  
Контекст: второй новый файл после аудита, предложенный вариант архитектуры для `she-is-not-alone-g`.

---

## 1) Цель архитектуры

Собрать агента, который:

1. Сохраняет непрерывную идентичность и рабочую автономию 24/7.
2. Не превращается в «автономного исследователя ради исследования».
3. Работает в режиме совместного внимания с пользователем (co-transcendence).
4. Делает измеримые полезные действия, а не имитирует активность.

Ключевая идея:

`User-first autonomy`  
Агент может исследовать мир, но приоритет и смысл действий определяются влиянием на совместный контекст с пользователем.

---

## 2) Неподвижное ядро и подвижное поведение

## 2.1 Stable Kernel (не самопереписывается)

1. `KernelOrchestrator` (тики, lifecycle, routing).
2. `SingleWriter` (единственный путь commit глобального состояния).
3. `PolicyGate` (allow/gate/deny + budgets).
4. `IdentityAnchor` (непрерывность self-model).
5. `AuditLog` (неизменяемый журнал решений и действий).

## 2.2 Mutable Behavior Pack (эволюционирует)

1. Prompt policies.
2. Heuristics инициативы и порогов вопросов.
3. Strategy templates (research/synthesis/questioning).
4. Ranking rules для памяти и источников.
5. Joint-attention patterns (как вести совместное исследование).

---

## 3) Логическая топология

1. `Perception Layer`
2. `Intent + Planning Layer`
3. `Execution Layer`
4. `Memory Layer`
5. `Human Co-Transcendence Layer`
6. `Governance + Observability Layer`

Поток:

`Signals -> Intent -> Plan -> Execute -> Validate -> Commit -> Share -> Reflect`

---

## 4) Слои и модули

## 4.1 Perception Layer

Минимально:

1. `UserChannel` (чат/WS) — главный сигнал.
2. `SystemTelemetry` — вспомогательный сигнал (нагрузка/состояние).
3. `WorldFeed` — опциональный ограниченный канал (RSS/URL fetch).

Правило:

1. Внешние сигналы не должны перехватывать приоритет у user-context без явной utility-причины.

## 4.2 Intent + Planning Layer

1. `DriveEngine` (`curiosity`, `closure`, `social_pull`, `novelty`).
2. `InitiativeGate` — решение «действовать сейчас или ждать».
3. `Planner` — строит план из атомарных шагов.
4. `QuestionEngine` — формирует вопросы только высокой ценности.

## 4.3 Execution Layer

1. `ToolRouter` с ограниченным набором инструментов.
2. `LaneWorkers` (параллельные исполняющие lanes).
3. `Validator` (проверка результата до записи в память и ответа).

## 4.4 Memory Layer

1. `EpisodicStore` — события диалога и действий.
2. `SemanticStore` — RAG-контекст.
3. `ThreadStore` — unresolved/shared threads.
4. `StateStore` — heartbeat, runtime state, counters.
5. `JointAttentionStore` — объекты совместного внимания.

## 4.5 Human Co-Transcendence Layer

Новый обязательный слой:

1. `JointAttentionEngine`
2. `AdviceImpactTracker`
3. `SharedContextSynthesizer`

Функция:

1. Делать не «просто ответы», а совместное мышление над одним объектом/вопросом.

## 4.6 Governance + Observability Layer

1. `SingleWriter`-инварианты.
2. Utility ledger (`expected` vs `realized`).
3. Heartbeat status («что делаю», «почему», «чего жду от пользователя»).
4. Incident журнал + graceful recovery.

---

## 5) Тики runtime

## 5.1 Fast Tick (10–20s)

1. Intake сигналов.
2. Быстрый triage.
3. Обновление drive state.
4. Решение об инициативе (без тяжелых действий).

## 5.2 Work Tick (45–90s)

1. Выполнение активных work items.
2. Tool actions + validation.
3. Формирование пользовательских сообщений/вопросов.
4. Commit результатов через `SingleWriter`.

## 5.3 Deep Tick (3–10m)

1. Синтез по эпизодам и shared threads.
2. Ревизия приоритетов.
3. Обновление joint-attention карты.
4. Коррекция behavior pack параметров (не ядра).

## 5.4 Dream/Incubation Tick (idle window)

1. Консолидация, не roleplay.
2. Генерация гипотез для последующего обсуждения с пользователем.
3. Запрет на «автономное действие наружу» без перехода через обычный planning/validation pipeline.

---

## 6) Совместное внимание (core differentiator)

Добавить сущность:

`SharedFocusItem`

Поля:

1. `focus_id`
2. `source` (user / agent / external)
3. `object_type` (topic / article / decision / plan)
4. `state` (proposed / active / discussed / concluded / archived)
5. `user_position`
6. `agent_position`
7. `next_joint_step`
8. `impact_score`

Поведение:

1. Агент может предложить объект внимания.
2. Пока объект `active`, ответы и вопросы приоритизируются по нему.
3. Завершение через общий вывод, а не через «ответ-одиночка».

---

## 7) SingleWriter инварианты (обязательно)

Любое изменение глобального состояния делается только через commit с типом:

1. `memory_append`
2. `thread_update`
3. `question_state_change`
4. `advice_outcome`
5. `heartbeat_update`
6. `goal_priority_update`

Инварианты:

1. Нет прямых write-path в обход `SingleWriter`.
2. Каждый commit имеет `reason`, `origin_module`, `correlation_id`.
3. Ошибка commit не теряется: retry/abort фиксируется в audit log.

---

## 8) Минимальный toolset (user-centric)

Оставить:

1. `web_search`
2. `fetch_url`
3. `read_local_context` (ограниченные папки проекта)

Не расширять пока:

1. Arbitrary shell execution.
2. Агрессивные внешние сенсоры без пользовательской ценности.

Правило приоритета:

1. Tool call допустим, если повышает качество решения в текущем `SharedFocusItem` или закрывает критичный thread.

---

## 9) Метрики архитектуры

Системные:

1. `useful_actions_per_hour`
2. `wasted_actions_ratio`
3. `commit_conflict_rate`
4. `recovery_success_rate`

Совместности:

1. `shared_focus_completion_rate`
2. `decision_lift_from_advice`
3. `question_precision`
4. `unresolved_shared_threads_age`

Идентичности:

1. `self_anchor_alerts`
2. `identity_drift_rate`

---

## 10) План миграции от текущего кода

## Шаг 1 (малый, без перелома)

1. Ввести `SharedFocusItem` и связать с `QuestionEngine`.
2. Добавить `AdviceImpactTracker`.
3. Ужесточить commit-контур `SingleWriter`.

## Шаг 2 (средний)

1. Перевести proactive messages в режим user-context-first.
2. Добавить explicit validation stage перед user output.
3. Расширить интеграционные тесты на сквозные сценарии.

## Шаг 3 (глубокий)

1. Формализовать behavior packs.
2. Добавить controlled adaptation (threshold/prompt/ranking tuning).
3. Включить full utility-ledger для всех proactive действий.

---

## 11) Что не делать

1. Не переносить legacy-монолиты в текущий код.
2. Не увеличивать число сенсоров ради «эффекта живости».
3. Не строить self-modifying code path в ядре.
4. Не подменять co-transcendence автономным «инфо-спамом».

---

## 12) Резюме

Этот вариант архитектуры сохраняет сильные стороны текущего проекта (тиковый runtime, drives, память, tools), но смещает центр тяжести:

с `agent does things`  
на  
`agent and user build meaning together`.

Это дает живость, непрерывность и развитие без потери главной цели проекта.

