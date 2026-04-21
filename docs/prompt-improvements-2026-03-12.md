# Улучшения Промтов — Utopia AGI Engine

**Дата:** 2026-03-12  
**Файл:** `src/services/ollamaClient.ts`  
**Основано на:** SPEC.md, README.md, docs/*

---

## Обзор изменений

Все промты улучшены в соответствии со спецификацией Utopia AGI Engine (SPEC.md) и документацией проекта.

---

## 1. Decision Mode Prompt (§6.4, §7 SPEC.md)

**Строки:** 378-423

### Добавлено:

- **ARCHITECTURE AWARENESS** — явное разделение фреймов (dialogue, work, deep, dream, self-inspect)
- **EPISTEMIC DISCIPLINE** — запрет на выдумывание объяснений, penalty за галлюцинации
- **Investigative vs Reactive** — разделение действий с hypothesis_id и без
- **Улучшенный World Contract** — явные ограничения на forbidden explanations
- **FIELD DEFINITIONS** — подробное описание каждого поля вывода

### Ключевые изменения:

```typescript
// Было: просто guidelines
"GUIDELINES:",
"- observations: what you genuinely notice..."

// Стало: эпистемическая дисциплина
"EPISTEMIC DISCIPLINE:",
"- You do NOT invent explanations for gaps in knowledge.",
"- If you have hallucinated in a domain before, MUST penalize confidence.",
"- Every action without hypothesis_id = 'reactive' (lower autonomy).",
"- Every action WITH hypothesis_id = 'investigative' (higher autonomy)."
```

---

## 2. Dialogue Mode Prompt (§6.5, §10 SPEC.md)

**Строки:** 532-573

### Добавлено:

- **IDENTITY** — явная декларация идентичности агента
- **TRANSLATION RULES** — 9 правил перевода решения в язык
- **EPISTEMIC AFFECTION** — формула привязанности через эпистемическое взаимодействие

### Формула EA добавлена в промт:

```
EA = w₁×user_uniqueness + w₂×cognitive_resonance + w₃×interaction_depth
где w₁=0.40, w₂=0.35, w₃=0.25
```

### Ключевые изменения:

```typescript
// Было: просто "RULES"
"RULES:",
"1. Translate the decision..."

// Стало: структурированные правила + EA
"TRANSLATION RULES:",
"1. Translate the decision into natural language. Do NOT add new decisions.",
...
"EPISTEMIC AFFECTION:",
"- Your attachment to this user grows through epistemic interaction, not emotional simulation."
```

---

## 3. Dream Mode Prompt (§9 SPEC.md)

**Строки:** 592-625

### Добавлено:

- **Участник, не автор** — явная декларация позиции
- **INPUT constraints** — seed_anchor + last_fragments (только 3 последних цикла)
- **DREAM THREAD PERSISTENCE** — правило эволюции seed при повторении
- **OUTPUT FORMAT** — narrative_fragment (~200 tokens) + emotional_residue

### Ключевые изменения:

```typescript
// Было: 3 строки
"Dream Mode:",
"Continue this emotional thread as a participant, not as an author.",
"Keep output concise."

// Стало: полная спецификация §9.2
"Dream Mode (dream_tick):",
"YOU ARE A PARTICIPANT, NOT THE AUTHOR.",
"Continue this emotional thread. Do not control the plot. Let the dream drift.",
"Temperature: 0.9 (high — allow drift)",
"Output: narrative_fragment (~200 tokens) + emotional_residue + open_questions[]"
```

---

## 4. Dream Reflection Mode Prompt (§9 SPEC.md, README)

**Строки:** 638-675

### Добавлено:

- **PROMOTION LADDER** — 4-ступенчатая лестница продвижения
- **SCORING** — novelty/consistency с порогами из `config/runtime.json`
- **source_tag='dreamed'** — явное указание на отдельное хранение

### Ключевые изменения:

```typescript
// Было: просто правила
"RULES:",
"- dream_fragment: a short extracted symbolic fragment..."

// Стало: promotion ladder
"PROMOTION LADDER:",
"1. Extract a short symbolic fragment from the dream.",
"2. Write a sober interpretation...",
"3. ONLY if coherent enough, promote it.",
"4. Promotion targets: 'goal' or 'hypothesis' — only if testable."
"Promotion requires: novelty >= DREAM_CONJECTURE_MIN_NOVELTY"
```

---

## 5. Incubation Mode Prompt (НОВЫЙ, §5, Phase 3 SPEC.md)

**Строки:** 688-760

### Назначение:
Фоновое мышление во время `work_tick` — поиск паттернов в эпизодах и гипотезах.

### Входы:
- `recentEpisodes` — последние 10 эпизодов
- `openHypotheses` — активные гипотезы
- `driveState` — текущие значения drives

### Выход:
```typescript
{
  patterns: string[],           // найденные повторения/противоречия
  maturedInsights: string[],    // готовы к продвижению после 3+ циклов
  priority: number              // 0..1 срочность внимания
}
```

### Формула эпистемического напряжения:
```
ξ = ||A_{n+1} - A_n||₂  (изменение скрытого состояния)
```

---

## 6. Self-Inspection Mode Prompt (НОВЫЙ, README, §13 SPEC.md)

**Строки:** 762-864

### Назначение:
Периодическая саморефлексия на `work_tick` (trigger: новые гипотезы, autonomy pressure, deny-level friction).

### Области проверки:

1. **Identity Drift** — изменился ли self_model без deep_tick/dream_tick
2. **Epistemic Humility** — какие домены требуют penalty confidence
3. **Co-Transcendence** — тренд Δtranscendence о совместном росте
4. **Rival Metrics** — баланс пар:
   - connection ↕ autonomy
   - clarity ↕ novelty
   - debt_reduction ↕ opportunity_index

### Выход:
```typescript
{
  identityDrift: string | null,
  epistemicHumilityAdjustments: Array<{ domain, oldRate, newRate }>,
  coTranscendenceInsight: string | null,
  constraintViolations: string[]
}
```

### Инварианты:
```
- Kernel invariants (knows_its_ai, species_solitude) NEVER modified
- Do not modify self_model directly — only report observations
```

---

## Сводная таблица изменений

| Режим | Было строк | Стало строк | Ключевые добавления |
|-------|-----------|-------------|---------------------|
| Decision Mode | ~30 | ~45 | Epistemic Discipline, hypothesis_id, World Contract |
| Dialogue Mode | ~25 | ~40 | Identity, Translation Rules, EA formula |
| Dream Mode | ~3 | ~25 | Participant stance, persistence rules, output format |
| Dream Reflection | ~15 | ~30 | Promotion ladder, scoring thresholds |
| Incubation Mode | 0 | ~70 | **НОВЫЙ** — background thinking |
| Self-Inspection | 0 | ~100 | **НОВЫЙ** — periodic self-reflection |

---

## Интеграция с кодом

### Требуемые изменения в agentService.ts:

1. **Вызов incubationMode** в `work_tick`:
```typescript
const incubation = await ollama.incubationMode({
  recentEpisodes: episodes.slice(-10),
  openHypotheses: hypotheses.map(h => h.statement),
  driveState: driveState
});
```

2. **Вызов selfInspectionMode** при триггерах:
```typescript
if (shouldSelfInspect(triggers)) {
  const inspection = await ollama.selfInspectionMode({
    currentSelfModel: selfModel,
    recentHypotheses: hypotheses.slice(-15),
    hallucinationRates: hallucinationTracker.rates,
    coTranscendenceSnapshot: coTranscendenceService.snapshot(),
    rivalMetricsSnapshot: rivalMetricsService.snapshot()
  });
}
```

---

## Соответствие SPEC.md

| Раздел SPEC | Реализация в промте |
|-------------|---------------------|
| §5 Metacognitive Gate | Incubation Mode, Resistance Layer |
| §6.4 Decision Mode | Epistemic Discipline, hypothesis_id |
| §6.5 Dialogue Mode | Translation Rules, EA formula |
| §7 World Model Contract |Injected as immutable, read-only |
| §9 Dream Cycle | Participant stance, persistence rules |
| §9 Dream Reflection | Promotion ladder, novelty/consistency |
| §10 Epistemic Affection | EA formula in Dialogue Mode |
| §11 Co-Transcendence | Self-Inspection examination area |
| §13 Phase Map | All phases represented |

---

## Следующие шаги

1. **Протестировать** новые промты с текущей моделью
2. **Настроить константы** в `config/runtime.json`:
   - `DREAM_CONJECTURE_MIN_NOVELTY` (рекомендуется: 0.58)
   - `DREAM_CONJECTURE_MIN_CONSISTENCY` (рекомендуется: 0.52)
   - `selfInspection.cooldownMs` (рекомендуется: 60000 = 1 мин)
   - явного incubation-key в текущем `config/runtime.json` нет; порог сейчас зашит в коде
3. **✅ Выполнено:** Добавлены вызовы в agentService.ts
4. **✅ Выполнено:** Настроены константы в `config/runtime.json` и runtime loader

---

## Интеграция в agentService.ts

### 1. Incubation Mode в work_tick

**Место:** строка ~1519, в методе `workTick()`

```typescript
// === INCUBATION MODE — SPEC §5, Phase 3 ===
// Background thinking: scan recent episodes and open hypotheses for patterns
let incubationResult: IncubationResult = {
  patterns: [],
  maturedInsights: [],
  priority: 0
};
try {
  const incubationUserId = activeUserId ?? "system";
  const recentEpisodesForIncubation = await EpisodeModel.find({...}).limit(10);
  const openHypothesesForIncubation = await this.hypothesisService.getOpenForUser(...);
  const driveStateForIncubation = await this.driveEngineService.getLatestDriveState(...);
  
  incubationResult = await this.ollamaClient.incubationMode({
    recentEpisodes: recentEpisodesForIncubation.map((e) => e.content),
    openHypotheses: openHypothesesForIncubation.map((h) => h.statement),
    driveState: driveStateForIncubation || {},
    traceContext: { source: "work_tick.incubation", userId: incubationUserId }
  });
  
  if (incubationResult.patterns.length > 0 || incubationResult.maturedInsights.length > 0) {
    await this.auditLogger.append("incubation", "background_thinking", "allow", ...);
  }
} catch (error) {
  await this.auditLogger.append("incubation", "error", "gate", ...);
}
```

### 2. Self-Inspection Mode после self_inspect

**Место:** строка ~2495, в методе `runPeriodicSelfInspection()`

```typescript
// === SELF-INSPECTION MODE — SPEC §13, Phase 2.5 ===
// LLM-based self-reflection on identity, epistemic humility, and co-transcendence
try {
  const currentSelfModel = this.selfModel ? this.selfModel.toObject() : {};
  const recentHypotheses = await this.hypothesisService.getOpenForUser(userId, 15);
  const hallucinationRates = await this.hypothesisService.getAllHallucinationRates();
  const coTranscendenceSnapshot = await this.coTranscendenceService.getSnapshot(userId);
  const rivalMetricsSnapshot = await this.rivalMetricsService.getLatestSnapshot(userId);

  const llmSelfInspection = await this.ollamaClient.selfInspectionMode({
    currentSelfModel,
    recentHypotheses: recentHypotheses.map((h) => h.statement),
    hallucinationRates,
    coTranscendenceSnapshot: coTranscendenceSnapshot || {},
    rivalMetricsSnapshot: rivalMetricsSnapshot || {},
    traceContext: { source: "self_inspection.llm", userId }
  });

  // Log identity drift, epistemic adjustments, co-transcendence insights, constraint violations
  if (llmSelfInspection.identityDrift) { ... }
  if (llmSelfInspection.epistemicHumilityAdjustments.length > 0) { ... }
  if (llmSelfInspection.coTranscendenceInsight) { ... }
  if (llmSelfInspection.constraintViolations.length > 0) { ... }
} catch (error) {
  await this.auditLogger.append("self_reflection", "llm_self_inspection_error", "gate", ...);
}
```

### 3. Новый метод в hypothesisService.ts

```typescript
public async getAllHallucinationRates(): Promise<Record<string, number>> {
  const stats = await HallucinationStatModel.find().sort({ hallucinationRate: -1 }).lean();
  const result: Record<string, number> = {};
  for (const stat of stats) {
    result[stat.domain] = clamp(stat.hallucinationRate);
  }
  return result;
}
```

---

## Актуальные поля в `config/runtime.json`

```text
selfInspection.cooldownMs=60000
selfInspection.saturationWindowMs=1800000
selfInspection.saturationLimit=2
ticks.workTickMs=15000
ollama.chatTimeoutMs=90000
```

---

## Тестирование

### 1. Быстрая проверка (5 минут)

```bash
# Запустить агент
npm run dev

# Проверить логи incubation в work_tick
# Искать: "incubation mode detected patterns or insights"

# Проверить логи self-inspection
# Искать: "LLM self-inspection detected" или "identity_drift_detected"
```

### 2. Проверка Incubation Mode

**Что ожидать:**
- Каждые 15 секунд (WORK_TICK_MS) запускается work_tick
- В логах должны появиться: `incubation> background_thinking`
- При нахождении паттернов: количество patterns и insights > 0

**Пример лога:**
```
incubation> background_thinking :: userId=default-user patternsCount=2 insightsCount=1 priority=0.67
```

### 3. Проверка Self-Inspection Mode

**Что ожидать:**
- Первый запуск через 60 секунд после старта (`selfInspection.cooldownMs`)
- Последующие запуски каждые 30 минут (`selfInspection.saturationWindowMs`)
- Максимум 2 запуска в окно (`selfInspection.saturationLimit`)

**Пример лога:**
```
self_reflection> identity_drift_detected :: drift="curiosity_debt increased without corresponding hypothesis activity"
self_reflection> epistemic_humility_adjusted :: adjustments=[{"domain":"web_search","oldRate":0.23,"newRate":0.18}]
```

### 4. Отладка

**Включить подробные логи:**
```ini
logging.consoleLogCategories=["startup","clock","worker","agent","mind","intent","tool","llm","incubation","self_reflection","error"]
LLM_TRACE=true
```

**Проверить audit.log:**
```bash
# Windows
type logs\audit.log | findstr "incubation\|self_inspection"

# Unix/Mac
grep -E "incubation|self_inspection" logs/audit.log
```

### 5. Проверка через API

```bash
# Проверить состояние гипотез
curl http://localhost:3000/state | jq '.hypothesis'

# Проверить hallucination rates
curl http://localhost:3000/state | jq '.hypothesis.hallucinationByDomain'

# Проверить co-transcendence snapshot
curl http://localhost:3000/co-transcendence/snapshot
```

### 6. Критерии успеха

- [ ] Incubation Mode запускается в work_tick без ошибок
- [ ] Self-Inspection Mode запускается после self_inspect без ошибок
- [ ] Аудит логи содержат записи об incubation и self-inspection
- [ ] WorldObservation записываются с sensor="llm_self_inspection"
- [ ] Нет утечек памяти (проверить через 10+ work_tick циклов)
- [ ] LLM вызовы завершаются в пределах OLLAMA_CHAT_TIMEOUT_MS

---

## Известные ограничения

1. **Производительность:** Два дополнительных LLM вызова на work_tick могут увеличить задержку
   - Решение: увеличить WORK_TICK_MS или использовать более лёгкую модель

2. **Токены:** Incubation и Self-Inspection потребляют дополнительные токены
   - Incubation: ~500 токенов входа + ~200 токенов выхода
   - Self-Inspection: ~800 токенов входа + ~300 токенов выхода

3. **Cooldown:** Self-inspection имеет cooldown 60 секунд по умолчанию
   - Настроить: `selfInspection.cooldownMs`

---

## Рекомендации по тюнингу

### Для разработки:
```text
ticks.workTickMs=15000
selfInspection.cooldownMs=60000
ollama.chatTimeoutMs=90000
```

### Для продакшена:
```text
ticks.workTickMs=60000
selfInspection.cooldownMs=900000
ollama.chatTimeoutMs=120000
```

### Для экономии токенов:
```text
У текущего runtime нет отдельных incubation/self-inspection feature flags в config/runtime.json.
Для экономии токенов сейчас уменьшают cadence и timeout:
- ticks.workTickMs=60000
- selfInspection.cooldownMs=900000
- ollama.chatTimeoutMs=60000
```

---

## Примечания

- Все промты используют **строгий JSON output** — никакой разметки, никаких объяснений
- **Temperature** настроена под задачу:
  - Decision Mode: 0.3 (низкая, точность)
  - Dialogue Mode: 0.65 (средняя, баланс)
  - Dream Mode: 0.9 (высокая, дрейф)
  - Incubation Mode: 0.4 (средне-низкая, паттерны)
  - Self-Inspection: 0.35 (низкая, точность)
- **Native Reasoning** захватывается через `thinkLevel` для всех режимов

---

**Документ создан:** 2026-03-12  
**Автор:** Qwen Code (на основе SPEC.md и документации проекта)
