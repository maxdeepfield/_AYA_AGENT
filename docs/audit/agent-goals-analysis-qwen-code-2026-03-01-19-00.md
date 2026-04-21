# ЦЕЛИ И РЕЗУЛЬТАТЫ AGENT 24/7

**Анализ от:** Qwen Code  
**Дата:** 1 марта 2026 г.  
**Источник:** `proposed-architecture-v2-2026-03-01-18-45.md`  
**Статус:** Extracted & Consolidated

---

## Аннотация

Этот документ выделяет **5 сквозных целей/результатов**, которые переплетаются во всей архитектуре Agent 24/7. Эти цели — не просто "хотелки", а **измеряемые метрики**, встроенные в utility function каждого действия агента.

---

## Мета-Цель (Одна Главная)

> **Конвертировать вычисления в валидированный прогресс для пользователя, сохраняя операционную целостность 24/7.**

Из оригинального документа:
> *"24/7 autonomy is only useful when it converts compute into validated progress, with user context treated as a strategic multiplier."*

---

## 5 Сквозных Целей

### 1. 🔷 Validated Insights (Валидированные Инсайты)

**Определение:**
Производить не просто "мысли" или "токены", а **валидированные уменьшения неопределённости**. Каждый инсайт должен быть проверен против реальности.

**Формула:**
```
information_gain = validatedUncertaintyReduction
```

**Целевая метрика:**
```
Validated Insights/Day > 3
Useful Actions/Hour > 5
```

**Где в архитектуре:**

| Компонент | Реализация |
|-----------|------------|
| **Utility Formula** | `U = goal_progress + information_gain + ...` |
| **MemoryHub** | `episodes` collection с типом `reflection` |
| **Prompt Catalog** | `cycle_reflection — extract lessons` |
| **Prompt Catalog** | `hypothesis_lab — generate R&D hypotheses` |
| **Goal Set** | Personal R&D Engine → KPI: `validated_insights_per_week` |
| **Kernel.deepTick** | `Synthesize insights` |

**Почему важно:**
Без валидации инсайты — просто галлюцинации. Архитектура требует, чтобы каждый инсайт был **проверен** (через tools, через пользователя, через cross-validation).

---

### 2. 💡 Decision Lift from Advice (Влияние Советов на Решения)

**Определение:**
Каждый совет пользователя должен измеряться по **реальному влиянию на решения**, а не просто сохраняться в память.

**Формула:**
```
adviceYield = sum(impactDelta of accepted advice)
advicePrecision = acceptedAdvice / totalAdviceEvents
decisionLift = E[U | with advice] - E[U | without advice]
```

**Целевые метрики:**
```
Advice Yield > 0.3
Advice Precision > 0.6
Decision Lift from Advice > 0.2
```

**Где в архитектуре:**

| Компонент | Реализация |
|-----------|------------|
| **Utility Formula** | `adviceYield = outcome.acceptedAdviceImpact` |
| **QuestionEngine** | `AdviceEvent { questionId, adviceText, accepted, impactDelta, confidenceDelta }` |
| **QuestionEngine** | `AdviceOutcome { questionId, realizedUtility, confidenceDelta }` |
| **Prompt Catalog** | `advice_integrator — transform advice to plan deltas` |
| **Goal Set** | Co-Intelligence With User → KPI: `decision_lift_from_advice` |
| **Human Leverage Loop** | `ask_user if delta_user_utility > threshold` |

**Lifecycle Advice:**
```
Question asked
    ↓
User answers
    ↓
Advice extracted
    ↓
Advice accepted/rejected
    ↓
Impact measured (impactDelta)
    ↓
Outcome recorded (realizedUtility)
```

**Почему важно:**
Большинство агентов "спрашивают и забывают". Эта архитектура **требует измерения влияния** каждого совета на реальные решения.

---

### 3. 🎯 Goal Progress (Прогресс по Целям)

**Определение:**
Каждое действие должно измеряться по **движению к активным целям**, а не просто "быть активным".

**Формула:**
```
goalProgress = measureGoalProgress(outcome.goalChanges)
```

**Целевые метрики:**
```
Useful Actions/Hour > 5
% Strategies Promoted after A/B eval > 20%
```

**Где в архитектуре:**

| Компонент | Реализация |
|-----------|------------|
| **Utility Formula** | `U = goal_progress + ...` |
| **ObjectiveLedger** | `expectedUtility` vs `realizedUtility` |
| **Kernel.workTick** | `Process unresolved threads` |
| **Kernel.workTick** | `Execute queued tasks` |
| **Goal Set** | 3 активные цели с KPI |
| **Phase C** | `BehaviorPack.promotionStatus: candidate → promoted` |

**Рекомендуемые цели (default):**

| Цель | KPI | Измерение |
|------|-----|-----------|
| **Personal R&D Engine** | `validated_insights_per_week` | MemoryHub.episodes |
| **Co-Intelligence With User** | `decision_lift_from_advice` | AdviceEvent.impactDelta |
| **Controlled Behavior Evolution** | `% strategies_promoted` | BehaviorPack registry |

**Почему важно:**
"Активность" без прогресса — это token churn. Архитектура требует **измеримого движения к целям**.

---

### 4. 🛡️ Continuity Score (Операционная Непрерывность)

**Определение:**
Агент должен **сохранять операционную целостность** 24/7 — uptime, калибровка, отсутствие регрессий.

**Формула:**
```
continuityScore = uptimeContribution + memoryIntegrity + calibrationScore
```

**Целевые метрики:**
```
Uptime > 99% (24/7)
Mean Time To Recovery < 30s
Hallucination Rate < 5%
Regression Rate < 5%
```

**Где в архитектуре:**

| Компонент | Реализация |
|-----------|------------|
| **Utility Formula** | `continuity_score = uptimeContribution` |
| **Kernel** | "Never self-modifies, ever" |
| **SelfAnchor** | `guardOutput()` от hallucinations |
| **SafetyGate** | `Allow / Gate / Deny` для risky actions |
| **Phase B** | `Watchdog (auto-restart on crash)` |
| **Phase C** | `RegressionGuard (auto-rollback on regression)` |

**Слои непрерывности:**

```
Layer 1: Uptime
  → Watchdog auto-restart
  → Graceful shutdown

Layer 2: Memory Integrity
  → MongoDB persistence (Phase B)
  → No data loss on crash

Layer 3: Calibration
  → SelfAnchor guardOutput()
  → Hallucination rate < 5%

Layer 4: No Regressions
  → BehaviorPack versioning
  → A/B testing before promotion
  → Auto-rollback on regression
```

**Почему важно:**
Агент, который "работает 24/7" но теряет память, галлюцинирует, или делает регрессии — **не полезен**. Continuity — обязательное условие.

---

### 5. ⚠️ Negative Metrics (Чего Избегать)

**Определение:**
Архитектура **штрафует** за риск, галлюцинации и пустую трату вычислений. Это "anti-goals" — то, что минимизируется.

**Формула:**
```
U = ... - risk - hallucination_penalty - wasted_compute
```

**Целевые метрики:**
```
Hallucination Rate < 5%
Retry Rate < 10%
Wasted Compute = calls with no reusable artifact → minimize
Risk Level = low для всех autonomous actions
```

**Где в архитектуре:**

| Компонент | Реализация |
|-----------|------------|
| **Utility Formula** | `- risk - hallucination_penalty - wasted_compute` |
| **SafetyGate** | `decision: 'allow' | 'gate' | 'deny'` |
| **SafetyGate** | `riskLevel: 'low' | 'medium' | 'high' | 'critical'` |
| **ResultValidator** | `verify outputs against success criteria` |
| **Non-negotiable constraints** | `Every autonomous action logs expected utility and realized utility` |
| **Антипаттерны** | "Слишком много модулей", "Нет safety gate", "Mock данные", "Философский код" |

**Что штрафуется:**

| Нарушение | Штраф | Источник |
|-----------|-------|----------|
| **Risk (high/critical)** | `- riskLevel` | SafetyGate |
| **Hallucination** | `- hallucinationCount × 0.5` | ResultValidator |
| **Wasted Compute** | `- tokensUsed / 1000` | LLM Client |
| **Regression** | `auto-rollback` | RegressionGuard |

**Почему важно:**
Без явных штрафов агент будет **оптимизировать по неправильным метрикам** (например, количество действий вместо качества).

---

## 📊 Сводная Таблица Всех Целей

| Цель | Формула | Целевая Метрика | Где Встроено |
|------|---------|-----------------|--------------|
| **Validated Insights** | `information_gain` | > 3/day | MemoryHub, cycle_reflection |
| **Decision Lift** | `advice_yield` | > 0.2 | QuestionEngine, advice_integrator |
| **Goal Progress** | `goal_progress` | > 5 actions/hour | Kernel.workTick, ObjectiveLedger |
| **Continuity** | `uptime + calibration` | > 99% uptime | SelfAnchor, SafetyGate, Kernel |
| **Negative** | `- risk - hallucinations - waste` | < 5% error rate | SafetyGate.deny, ResultValidator |

---

## 🧮 Utility Function (Полная Формула)

Все 5 целей объединены в **единую utility function**:

```typescript
U = goal_progress 
  + information_gain 
  + advice_yield 
  + continuity_score 
  - risk 
  - hallucination_penalty 
  - wasted_compute
```

**Расшифровка:**

```typescript
function calculateUtility(action: AutonomousAction, outcome: Outcome): number {
  // Positive (цели 1-4)
  const goalProgress = measureGoalProgress(outcome.goalChanges);           // Цель 3
  const informationGain = outcome.validatedUncertaintyReduction;           // Цель 1
  const adviceYield = outcome.acceptedAdviceImpact;                        // Цель 2
  const continuityScore = outcome.uptimeContribution;                      // Цель 4
  
  // Negative (цель 5)
  const risk = action.riskLevel;                                           // Цель 5
  const hallucinationPenalty = outcome.hallucinationCount × 0.5;           // Цель 5
  const wastedCompute = outcome.tokensUsed / 1000;                         // Цель 5

  return (
    goalProgress +
    informationGain +
    adviceYield +
    continuityScore -
    risk -
    hallucinationPenalty -
    wastedCompute
  );
}
```

**Ключевое свойство:**
- Каждое действие агента **должно иметь положительное U**
- Если `U < 0` — действие было вредным
- Если `U ≈ 0` — действие было пустой тратой (wasted compute)

---

## 🔄 Как Цели Переплетаются

### Пример 1: Proactive Message

```
Fast Tick (10s)
    ↓
DriveEngine.evaluateInitiative()
    ↓
InitiativeDecision { expectedUtility: 0.62 }
    ↓
SafetyGate.evaluate()  ← Цель 5 (risk check)
    ↓
ResponseGenerator.generateProactiveMessage()
    ↓
MemoryHub.retrieveRelevantEpisodes()  ← Цель 1 (information gain)
    ↓
Send to user
    ↓
User responds
    ↓
DriveEngine.processSignal()  ← Цель 3 (social pull → goal progress)
    ↓
QuestionEngine.tryBindAnswer()  ← Цель 2 (advice extraction)
    ↓
ObjectiveLedger.record(expectedUtility: 0.62, realizedUtility: ?)  ← Все цели
```

### Пример 2: Question Asked

```
Deep Tick (5m)
    ↓
QuestionEngine.shouldAskQuestion()
    ↓
Check: socialPull × 0.6 + curiosity × 0.4 > 0.5  ← Цель 1 + Цель 2
    ↓
Check: questionsAskedThisHour < maxQuestionsPerHour  ← Цель 5 (waste prevention)
    ↓
ResponseGenerator.generateAutonomousQuestion()
    ↓
QuestionEngine.createQuestion({ decisionImpact, fallbackPlan })  ← Цель 2
    ↓
User answers
    ↓
QuestionEngine.extractAdvice()
    ↓
AdviceEvent { impactDelta, confidenceDelta }  ← Цель 2
    ↓
ObjectiveLedger.record(realizedUtility)  ← Все цели
```

### Пример 3: Background Research

```
Work Tick (1m)
    ↓
MemoryHub.getMemoryGaps()
    ↓
unknownTopics = 5 - uniqueTopicsInRecent50  ← Цель 1 (curiosity)
    ↓
DriveEngine.updateFromMemoryGaps()
    ↓
ToolRouter.execute('web_search', { query })
    ↓
SafetyGate.evaluate({ risk: 'low' })  ← Цель 5
    ↓
ResultValidator.verify(outputs)  ← Цель 5 (hallucination check)
    ↓
MemoryHub.recordEpisode({ type: 'tool_use', content: result })  ← Цель 1
    ↓
ObjectiveLedger.record(expectedUtility, realizedUtility)  ← Все цели
```

---

## 🎯 Иерархия Целей

```
Meta-Goal: Конвертировать вычисления в валидированный прогресс
    │
    ├─► Цель 1: Validated Insights (информационная ценность)
    │       └─► information_gain = validatedUncertaintyReduction
    │
    ├─► Цель 2: Decision Lift from Advice (human leverage)
    │       └─► advice_yield = sum(impactDelta of accepted advice)
    │
    ├─► Цель 3: Goal Progress (измеримый прогресс)
    │       └─► goal_progress = measureGoalProgress(outcome.goalChanges)
    │
    ├─► Цель 4: Continuity (операционная целостность)
    │       └─► continuity_score = uptime + memoryIntegrity + calibration
    │
    └─► Цель 5: Negative Metrics (минимизировать вред)
            └─► - risk - hallucination_penalty - wasted_compute
```

---

## 📈 Phase Roadmap по Целям

| Phase | Какие цели реализуются |
|-------|------------------------|
| **R0** (текущая) | Цель 3 (частично), Цель 4 (частично) |
| **R** (LLM+Tools) | Цель 1 (information gain через tools), Цель 3 (goal progress) |
| **A** (Safety+Utility) | **Все 5 целей** через ObjectiveLedger + SafetyGate |
| **B** (Persistence) | Цель 4 (continuity через MongoDB + Watchdog) |
| **C** (Evolution) | Все цели через A/B testing behavior packs |

---

## ✅ Чеклист для Проверки

Для любого действия агента задать вопросы:

1. **Validated Insights:**
   - [ ] Это действие уменьшает неопределённость?
   - [ ] Инсайт валидирован (через tools/пользователя/cross-validation)?

2. **Decision Lift:**
   - [ ] Это действие использует совет пользователя?
   - [ ] Измерен ли impactDelta этого совета?

3. **Goal Progress:**
   - [ ] Это действие движет к активной цели?
   - [ ] Измерим ли прогресс (KPI)?

4. **Continuity:**
   - [ ] Это действие безопасно для uptime?
   - [ ] Нет ли риска регрессии/галлюцинации?

5. **Negative Metrics:**
   - [ ] Риск действия ≤ low?
   - [ ] Нет ли галлюцинаций?
   - [ ] Не пустая ли это трата вычислений?

Если **хотя бы один ответ "нет"** → действие должно быть **заблокировано SafetyGate**.

---

## 🔚 Заключение

Эти 5 целей — **не опциональные "хотелки"**, а **встроенные ограничения** архитектуры:

1. **Validated Insights** — встроено в utility function через `information_gain`
2. **Decision Lift** — встроено через `advice_yield` и QuestionEngine lifecycle
3. **Goal Progress** — встроено через `goal_progress` и ObjectiveLedger
4. **Continuity** — встроено через `continuity_score` и SelfAnchor/SafetyGate
5. **Negative Metrics** — встроено через `- risk - hallucination_penalty - wasted_compute`

**Главный инсайт:**
> Агент не "стремится к целям" — он **оптимизирует utility function**, которая включает все 5 целей одновременно.

Это отличает эту архитектуру от старых проектов, где цели были **философскими концепциями**, а не **измеряемыми метриками**.

---

**Конец документа.**
