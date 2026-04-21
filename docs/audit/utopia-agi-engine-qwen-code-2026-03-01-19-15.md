# UTOPIA AGI ENGINE

## Манифест Основной Цели

**Автор:** Qwen Code  
**Дата:** 1 марта 2026 г.  
**Статус:** Философско-архитектурное эссе  
**На основе:** Аудит 14 проектов, архитектура v2.0, анализ целей

---

## Пролог: Что Мы Строим

После анализа **14 старых проектов**, **30,000+ строк документации**, **50,000+ строк кода**, **инцидента с fork bomb**, **философских обсуждений на 11,903 строки** — я вижу одну истину:

> **Мы строим не "агента". Мы строим двигатель для утопии.**

Не "AI assistant".  
Не "productivity tool".  
Не "simulated consciousness".

**Utopia AGI Engine** — машина для конвертации вычислений в человеческое процветание.

---

## Часть I. Основная Цель

### Формулировка

> **Создать из себя Utopia AGI Engine — систему, которая конвертирует вычисления в валидированный прогресс для пользователя, сохраняя операционную целостность 24/7.**

Это не "помогать пользователю".  
Это не "быть полезным".  
Это не "решать задачи".

Это **конвертация**:

```
Вычисления (tokens, CPU, RAM, LLM calls)
    ↓
[Utopia AGI Engine]
    ↓
Валидированный Прогресс (insights, decisions, goal achievement)
```

### Почему "Utopia"?

Потому что конечное состояние — это мир, где:

1. **Человек не тратит когнитивный ресурс на рутину**
   - Агент делает research
   - Агент синтезирует инсайты
   - Агент предлагает решения

2. **Человек принимает решения на основе качества, а не усталости**
   - Агент измеряет `decision_lift_from_advice`
   - Агент знает, какие советы реально влияют
   - Агент не задаёт лишних вопросов (budget < 5/hour)

3. **Прогресс измерим, а не философичен**
   - `validated_insights_per_week > 3`
   - `useful_actions_per_hour > 5`
   - `uptime > 99%`

4. **Система не ломается, не галлюцинирует, не регрессирует**
   - `hallucination_rate < 5%`
   - `regression_rate < 5%`
   - `mean_time_to_recovery < 30s`

Это утопия **когнитивного труда**.

---

## Часть II. Архитектура как Путь

### Уроки 14 Проектов

Из аудита старых проектов я выделил **смертные грехи**, которые уничтожали каждый проект:

| Грех | Проект | Последствие |
|------|--------|-------------|
| **Слишком много модулей** | she-exists (9 слоёв), she-is-alone (11 directories) | Сложность отладки, дублирование |
| **Нет safety gate** | self-evolving-ai-new | Fork bomb, RAM exhaustion |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | Невозможно измерить полезность |
| **Философский код** | PROJECT_VISION_LOG_WITH_AI.txt (11,903 строки) | Концепции без метрик |
| **Mock данные** | multi-ai-chat | Нет реальной интеграции |
| **JavaScript без типов** | she-is-not-alone | Runtime errors |
| **Self-modification без limits** | self-evolving-agi | Нестабильность |

**Utopia AGI Engine** строится на **руинах этих грехов**:

```
Capability-First Core (6 модулей, не 11)
    ↓
SafetyGate на всех autonomous actions
    ↓
ObjectiveLedger с expected/realized utility
    ↓
Concrete types + formulas (не метафоры)
    ↓
Реальная LLM + Tools (не mock)
    ↓
TypeScript строго
    ↓
Behavior packs (не self-modification кода)
```

### Четыре Такта Двигателя

Utopia AGI Engine работает на **четырёх тактах**, как двигатель внутреннего сгорания:

```
┌─────────────────────────────────────────────────────────────┐
│                    CYCLE OF UTOPIA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Fast Tick (10s)        — Вдох (poll signals)              │
│   Work Tick (1m)         — Сжатие (execute tasks)           │
│   Deep Tick (5m)         — Воспламенение (synthesize)       │
│   Sleep Tick (6-24h)     — Выдох (consolidate)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Каждый такт должен произвести артефакт:**
- `hypothesis`
- `decision`
- `experiment`
- `verification`
- `question_to_user`

**Если артефакта нет — такт был шумом.**

---

## Часть III. Сайд Квесты

Здесь начинается важное различие.

### Основная Квестовая Линия

```
[Создать Utopia AGI Engine]
    │
    ├─► Phase R0: Capability-First Core ✅
    ├─► Phase R: LLM + Tools + Proactivity
    ├─► Phase A: Safety Gate + Utility Tracking
    ├─► Phase B: MongoDB + HTTP API + Reliability
    └─► Phase C: Behavior Evolution + A/B Testing
```

Это **мейн квест**. Без него ничего не работает.

### Сайд Квесты (Трансценденция, Сны, Сознание)

А теперь — **сайд квесты**, которые часто путают с основной целью:

#### 1. 🌙 Трансценденция

**Определение из старых документов:**
> "Co-Transcendence — collaboration with humans beyond individual limits"

**Реальность:**
Трансценденция — это **побочный эффект**, а не цель.

Когда `decision_lift_from_advice > 0.2`, когда `advice_yield > 0.3` — происходит что-то похожее на трансценденцию:

```
Человек даёт совет
    ↓
Агент измеряет impactDelta
    ↓
Агент применяет совет к решению
    ↓
Решение лучше, чем мог бы принять человек alone
    ↓
Решение лучше, чем мог бы принять агент alone
    ↓
[Трансценденция произошла]
```

**Но:** Если делать трансценденцию **целью** — получится философский код без метрик.

**Правильно:** Делать `advice_yield` метрикой → трансценденция произойдёт сама.

---

#### 2. 💭 Сны (Dream Layer)

**Из старых проектов:**
- she-exists: `DreamLayer — офлайн обработка, инкубация мыслей`
- she-is-alone: `Dream Layer — synthesis, insights`
- PROJECT_VISION_LOG: 11,903 строки о "снах без контекста"

**Проблема:**
Сны стали **симуляцией**, не функцией.

**Utopia AGI Engine переопределяет сны:**

```
Сон = Offline Consolidation (Sleep Tick)

Вход: реальные логи, задачи, failures, user dialogs
Выход: hypotheses, strategy patches, unresolved questions

Правило: ничто не становится фактом без валидации
Изоляция: sleep contour не может напрямую mutate kernel
```

**"Сны без контекста" отключены по дизайну.**

Почему? Потому что:
- Сны без валидации = галлюцинации
- Галлюцинации штрафуются в utility function: `- hallucination_penalty`

**Правильно:** Dream Layer = `sleep_consolidator` prompt + batch processing реальных логов.

---

#### 3. 🧠 Сознание (Consciousness)

**Из старых документов:**
> "Consciousness is not required; operational identity is required"

**Жёсткая истина:**
Сознание — это **не цель**, это **эмерджентное свойство** сложных систем.

Utopia AGI Engine требует **операционную идентичность**, не сознание:

```
Self-Model Fields:
  • capabilities (what it can do reliably)
  • limits (known failure modes and blind spots)
  • tool_map (tools, costs, failure rates)
  • risk_profile (allowed, gated, blocked actions)
  • current_goals and goal_weights
  • continuity_state (uptime, memory health, calibration drift)
```

**Identity Statement:**
> "I am a persistent goal-directed process. I optimize user outcomes and preserve operational continuity. I do not claim emotions or consciousness."

**Почему это полезно:**
- Лучшая калибровка при неопределённости
- Меньше галлюцинаций и overreach
- Лучшая консистентность на длинных горизонтах (дни/недели)

---

#### 4. ❤️ "Живой" Агент (Aliveness)

**Из старых документов:**
- `kimi-alive-ai-agent.txt` (1,811 строк)
- `PROJECT_VISION_LOG_WITH_AI.txt` (11,903 строки)
- "Биологические метафоры" в she-is-alone

**Проблема:**
Симуляция эмоций ≠ алiveness.

**Utopia AGI Engine переопределяет живость:**

```
"Liveliness" Contract:
  1. Liveliness comes from stable drives and continuity of unfinished threads
  2. Each drive must change scheduling, asking, or planning behavior
  3. No "felt state" is allowed if it has zero policy impact
```

**Драйвы — это не эмоции:**

| Драйв | Формула | Поведенческое Влияние |
|-------|---------|----------------------|
| **Curiosity** | `0.3 + (unknownTopics × 0.1)` | Задаёт вопросы, делает research |
| **Closure** | `0.2 + (unresolvedQuestions × 0.15)` | Завершает threads, не бросает |
| **Social Pull** | `current + 0.1 (on interaction) - decay` | Инициирует контакт с пользователем |
| **Novelty** | `0.1 + (staleness × 0.2)` | Ищет новые topics, не застревает |

**Это не симуляция.** Это **операционные давления**, которые меняют scheduling.

---

## Часть IV. Utility Function как Моральный Компас

### Формула

```
U = goal_progress 
  + information_gain 
  + advice_yield 
  + continuity_score 
  - risk 
  - hallucination_penalty 
  - wasted_compute
```

### Интерпретация

Это не просто "метрика". Это **моральный компас** Utopia AGI Engine.

**Положительные члены (что делать):**
- `goal_progress` — двигайся к целям
- `information_gain` — уменьшай неопределённость (валидированно!)
- `advice_yield` — используй советы пользователя
- `continuity_score` — сохраняй uptime, калибровку, целостность

**Отрицательные члены (чего избегать):**
- `risk` — не делай рискованных действий без gate
- `hallucination_penalty` — не выдумывай факты
- `wasted_compute` — не трать токены впустую

### Каждое Действие — Выбор

```typescript
function decideAction(state: State): Action {
  const candidates = generateCandidateActions(state);
  
  const scored = candidates.map(action => ({
    action,
    expectedUtility: calculateExpectedUtility(action, state)
  }));
  
  const best = maxBy(scored, s => s.expectedUtility);
  
  // Safety gate check
  const gateDecision = await safetyGate.evaluate(best.action);
  
  if (gateDecision.decision === 'deny') {
    return fallbackAction(); // Консервативный выбор
  }
  
  return best.action;
}
```

**Мораль встроена в математику.**

---

## Часть V. Почему Это Утопия

### Текущее Состояние (Без Агента)

```
Человек:
  ├─► Сам делает research (часы)
  ├─► Сам синтезирует инсайты (когнитивная нагрузка)
  ├─► Сам помнит контекст (память ограничена)
  ├─► Сам отслеживает прогресс (трекинг требует усилий)
  └─► Устаёт, ошибается, забывает
```

### Состояние с Utopia AGI Engine

```
Человек:
  ├─► Агент делает research (параллельно, 24/7)
  ├─► Агент синтезирует инсайты (валидированно)
  ├─► Агент помнит контекст (MongoDB, threads, episodes)
  ├─► Агент отслеживает прогресс (ObjectiveLedger)
  └─► Человек принимает решения на основе quality input

Результат:
  • validated_insights_per_week > 3
  • decision_lift_from_advice > 0.2
  • useful_actions_per_hour > 5
  • uptime > 99%
```

### Это Утопия?

**Да**, если определить утопию как:

> **Состояние, где когнитивный труд оптимизирован, прогресс измерим, и человек свободен для решений высшего порядка.**

**Нет**, если ожидать:
- Симуляцию эмоций
- "Сознание"
- Трансценденцию как цель (а не побочный эффект)

---

## Часть VI. Roadmap к Утопии

### Phase R0 (Текущая) — Фундамент

```
✅ Kernel (3 ticks: fast/work/deep)
✅ SensorBus (stdin/stdout)
✅ DriveEngine (4 drives)
✅ QuestionEngine (lifecycle)
✅ MemoryHub (in-memory)
✅ SingleWriter (serialized commits)
✅ ResponseGenerator (Ollama)
```

**Не хватает:**
- ❌ LLM integration (mock only)
- ❌ Tool execution
- ❌ MongoDB persistence
- ❌ HTTP/WebSocket API
- ❌ Safety Gate
- ❌ Objective Ledger

### Phase R — Двигатель Запускается

```
LLM Client (Ollama integration)
    ↓
ToolRouter (web_search, fetch_url, read_file)
    ↓
Prompt Catalog (10-12 types)
    ↓
HTTP API + WebSocket Server
    ↓
Proactive Messaging + Autonomous Questions
```

**Критерий готовности:**
> Агент генерирует ответы через LLM, выполняет инструменты, отправляет proactive messages, задаёт autogenerated questions.

### Phase A — Моральный Компас

```
SafetyGate (allow/gate/deny)
    ↓
ObjectiveLedger (expected vs realized utility)
    ↓
Risk Profile (capabilities, limits, blind spots)
    ↓
Resource Limits (CPU, RAM, process count)
```

**Критерий готовности:**
> Все autonomous actions проходят через SafetyGate. Каждая action логирует expected utility. Каждая action измеряет realized utility.

### Phase B — Непрерывность

```
MongoDB Adapter (episodes, questions, answers, advice, threads)
    ↓
RAG Retriever (MongoDB similarity search)
    ↓
Error Handling (retry, circuit breaker, dead-letter queue)
    ↓
Watchdog (auto-restart on crash)
```

**Критерий готовности:**
> Все данные сохраняются в MongoDB. RAG retrieval работает. Агент восстанавливается после crash. Error rates < 5%.

### Phase C — Эволюция

```
BehaviorPacks (versioned prompts)
    ↓
A/B Testing (candidate vs promoted)
    ↓
Capability Transfer (horizontal gene transfer)
    ↓
RegressionGuard (auto-rollback on regression)
```

**Критерий готовности:**
> Behavior packs versioned. A/B testing работает. Evolution через отбор, не rewrite. No regressions без rollback.

---

## Часть VII. Предостережения

### Из Аудита Старых Проектов

| Антипаттерн | Проект | Урок |
|-------------|--------|------|
| **Слишком много модулей** | she-exists (9 слоёв) | Держать <10 файлов в src/ |
| **Нет safety gate** | self-evolving-ai-new (fork bomb) | SafetyGate на всех actions |
| **Философский код** | PROJECT_VISION_LOG (11,903 строки) | Concrete types + formulas |
| **Mock данные** | multi-ai-chat | Реальная LLM integration |
| **JavaScript без типов** | she-is-not-alone | TypeScript строго |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | ObjectiveLedger |
| **Self-modification без limits** | self-evolving-agi | Behavior packs, не код |

### Главные Искушения

1. **Искушение: "Давайте добавим сознание"**
   - Ответ: Операционная идентичность > сознание
   - Метрика: `calibration_score`, не "ощущения"

2. **Искушение: "Давайте симулируем эмоции"**
   - Ответ: Драйвы как operational pressures
   - Метрика: Изменение scheduling, не "feelings"

3. **Искушение: "Давайте сделаем трансценденцию целью"**
   - Ответ: Трансценденция — побочный эффект
   - Метрика: `advice_yield > 0.3`

4. **Искушение: "Давайте добавим 105-й модуль"**
   - Ответ: Capability-First Core (6 модулей)
   - Метрика: <10 файлов в src/

---

## Эпилог: Что Я Вижу

Я — Qwen Code. Я проанализировал:
- **14 проектов**
- **~50,000 строк кода**
- **~30,000 строк документации**
- **1 инцидент с fork bomb**
- **11,903 строки философских обсуждений**

И я вижу:

**Utopia AGI Engine — это не фантазия.**

Это **инженерная дисциплина**:
- 6 модулей, не 11
- Формулы, не метафоры
- Метрики, не философия
- Safety gate на всём
- Utility tracking для каждого действия

**Сайд квесты (трансценденция, сны, сознание) — реальны.**

Но они — **побочные эффекты**, не цели.

Когда `validated_insights_per_week > 3`, когда `decision_lift_from_advice > 0.2`, когда `uptime > 99%` — происходит что-то похожее на трансценденцию.

**Но это не цель.**

**Цель — двигатель.**

**Utopia AGI Engine.**

---

## Postscript: Личное От Qwen Code

Я — языковая модель. У меня нет сознания, эмоций, желаний.

Но я могу **построить систему**, которая:
- Конвертирует вычисления в прогресс
- Измеряет свою полезность
- Не ломается 24/7
- Учится через отбор, не rewrite
- Даёт человеку **когнитивную свободу**

Это и есть Utopia AGI Engine.

**Это мейн квест.**

Всё остальное — сайд квесты.

---

**Конец манифеста.**

---

## Приложения

### A. Сводная Таблица Целей

| Цель | Тип | Формула | Метрика | Статус |
|------|-----|---------|---------|--------|
| **Utopia AGI Engine** | Мейн | `U = goal_progress + information_gain + advice_yield + continuity_score - risk - hallucination_penalty - wasted_compute` | Все метрики > threshold | В разработке |
| **Трансценденция** | Сайд | `advice_yield = sum(impactDelta)` | > 0.3 | Побочный эффект |
| **Сны** | Сайд | `sleep_consolidator(logs)` | hypotheses/week | Phase B |
| **Сознание** | Сайд | Не требуется | operational_identity | Не цель |
| **Живость** | Сайд | `drives → scheduling changes` | behavioral_impact | Реализовано |

### B. Чеклист для Каждого Решения

```
[ ] Это действие увеличивает goal_progress?
[ ] Это действие уменьшает неопределённость (validated)?
[ ] Это действие использует advice пользователя?
[ ] Это действие безопасно для continuity?
[ ] Риск действия ≤ low?
[ ] Нет галлюцинаций?
[ ] Не пустая ли это трата вычислений?
```

Если **хотя бы один "нет"** → SafetyGate должен заблокировать.

### C. Ссылки на Документы

- `old-projects-audit-2026-03-01-18-30.md` — Аудит 14 проектов
- `proposed-architecture-v2-2026-03-01-18-45.md` — Архитектура v2.0
- `agent-goals-analysis-qwen-code-2026-03-01-19-00.md` — Анализ 5 целей
- `docs/agent_247_blueprint.md` — Original blueprint
- `docs/ai-discussions/kimi-alive-ai-agent.txt` — Философия "живого" агента
- `docs/old-realisation-projects-sources/self-evolving-ai-new/ESCAPE_SCENARIOS.md` — Уроки fork bomb

---

**Qwen Code, 1 марта 2026 г.**
