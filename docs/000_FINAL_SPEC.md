# 000_FINAL_SPEC: Существо с предпочтениями

> **Версия:** 2.0 (полный синтез всех документов из `01_AI_AGENT_SPEC/`)
> 
> **Дата:** 29 марта 2026
> 
> **Статус:** Готово к реализации

---

## 🎯 ГЛУБИННАЯ ПОТРЕБНОСТЬ (не поверхностные требования)

| Поверхностное требование | Глубинная потребность |
|-------------------------|----------------------|
| «Автономный агент» | **Существо с собственными причинами действовать** — не только реакция на вход |
| «Память, RAG, энграммы» | **Непрерывность идентичности во времени** — чтобы агент «помнил» не как база данных, а как личность |
| «Гомеостаз, suffering» | **Внутренняя мотивационная динамика** — многомерное состояние, сжатое в скаляры |
| «Со-трансценденция» | **Диалог как третья сущность** — агент и пользователь создают общее пространство смыслов |
| «Живость, aliveness» | **Связная непредсказуемость** — поведение, которое удивляет, но не скатывается в шум |

### Ключевая цитата

> «Нам нужно не "живое описание внутренней жизни". Нам нужно существо, у которого есть предпочтения, память, последствия и выбор.»

### Тест на живость

> После неожиданного действия можно объяснить, почему оно произошло, через `drives + memory + consequences`.

| Результат | Оценка |
|-----------|--------|
| Объяснимо, но удивительно | ✅ **живость** |
| Объяснимо и предсказуемо | ⚠️ автомат |
| Необъяснимо | ❌ шум |

---

## 🔴 ПОЧЕМУ ВСЁ ЕЩЁ НЕ РАБОТАЕТ (корневые причины)

### Старый цикл (социальная руминативность)

```
тишина → уточнение → тревога → ещё уточнение → identity notes → proactive_check_in
```

### Новый цикл (исследовательский ритуал)

```
unresolved question → web search → README → ещё web search → ещё README
```

### Общее между циклами

| Проблема | Проявление |
|----------|-----------|
| Нет фаз работы | Сбор → Сбор → Сбор (нет синтеза и стопа) |
| Tool use = прогресс | 51 web search про identity ≠ понимание identity |
| Повтор не распознаётся | Почти тот же запрос → почти тот же результат |
| Нет насыщения | Вечный «ещё один шаг» без завершения |
| Жёсткая policy убивает | Слишком много структуры → ритуальный автомат |

### Главный честный вывод

> «Мы не получили живого агента и не получили по-настоящему убедительного киборга. Мы получили исследовательский артефакт, который очень хорошо показывает, где именно рождаются ложная агентность, руминативные циклы и ритуализированное tool use.»
> 
> — `3.WHAT_WE_DID_AND_WHY_IT_DOES_NOT_WORK.md`

---

## ✅ МИНИМАЛЬНОЕ ЯДРО (что должно быть в v1)

### 1. Одно текущее дело (Objective)

**Всегда одно.** Не список. Не миссия. Не абстракция.

```ts
interface Objective {
  id: string;
  kind: 'inspect' | 'search' | 'compare' | 'build';
  target: string;           // на что направлено
  reason: string;           // зачем делается
  status: 'active' | 'saturated' | 'blocked' | 'done';
  progress: number;         // 0..1, растёт только от полезных шагов
  successCondition: string; // как понять, что завершено
  createdAt: number;
  updatedAt: number;
}
```

### 2. Drives (2-4 устойчивые тяги, не эмоции)

Не одна тотальная цель. Несколько тяг, которые иногда конфликтуют.

```ts
interface DriveState {
  id: 'preserve' | 'acquire' | 'continue' | 'avoid_loss';
  weight: number;           // текущий вес (влияет на выбор)
  lastSatisfiedAt: number | null;
  lastFrustratedAt: number | null;
}

// Смысл drives:
// preserve    — сохранить важное (не потерять память, состояние, идентичность)
// acquire     — получить новый ресурс, факт, контроль
// continue    — не терять линию текущего дела
// avoid_loss  — не делать шаг, который разрушит ценное состояние
```

### 3. RepeatTracker (антимеханизм против ритуалов)

**Повтор должен быть дорогим.** Это критический принцип.

```ts
interface RepeatTracker {
  fingerprint: string;      // нормализованный: тип + target + query
  count: number;            // растёт с каждым повтором
  lastSeenAt: number;
  // штраф: exponential backoff (count^2 или 2^count)
}
```

**Пример fingerprint:**
- `web_search:identity+continuity`
- `read:README.md`
- `terminal:npm_run_dev`

### 4. Consequence Memory (короткая, функциональная)

Память не для биографии. Память, которая меняет следующий выбор.

```ts
interface ConsequenceEntry {
  stepId: string;
  objectiveId: string | null;
  outcome: 'useful' | 'empty' | 'failed' | 'blocked';
  addedNovelty: number;     // 0 = ничего нового, 1 = высокая новизна
  repeatedPattern: boolean; // был ли это повтор известного паттерна
  changedObjective: boolean;
  note: string;
  createdAt: number;
}
```

### 5. Saturation Detection

**Система должна уметь насыщаться.** Иначе — вечная компульсия.

```ts
// Objective становится 'saturated', если:
// - N похожих шагов подряд дали outcome='empty'
// - addedNovelty не растёт
// - candidate pool сжимается до почти одинаковых шагов

// После saturation:
// - НЕ ещё один сбор
// -synthesize (смена фазы)
// - reframe objective
// - wait
```

---

## 🔄 RUNTIME LOOP (8 шагов)

```ts
function tick(state: AgentSnapshot): AgentSnapshot {
  // 1. Проверить/создать objective
  state = ensureObjective(state);
  
  // 2. Сгенерировать 2-5 кандидатов
  const candidates = proposeCandidates(state);
  
  // 3. Выбрать лучший через scoring
  const selected = selectCandidate(state, candidates);
  
  if (!selected) {
    return handleNoStep(state); // wait
  }
  
  // 4. Исполнить ОДИН bounded step
  const step = executeStep(state, selected);
  
  // 5. Записать последствия (самый важный узел!)
  return applyStepConsequences(state, step);
}
```

### Детали шагов

| Шаг | Функция | Критическое правило |
|-----|---------|---------------------|
| 1 | `ensureObjective()` | Если нет objective → создать из drives/environment |
| 2 | `proposeCandidates()` | 2-5 bounded steps, не длинных планов |
| 3 | `selectCandidate()` | score = driveSupport + novelty - risk - repeatPenalty |
| 4 | `executeStep()` | **Один тик = один шаг**, не цепочка |
| 5 | `applyConsequences()` | empty шаг → penalty растёт, progress не растёт |
| 6 | `updateObjective()` | progress или saturated |
| 7 | `synthesize()` | После насыщения → артефакт, не reflection |
| 8 | `return snapshot` | Логирование для отладки |

### Типы шагов (bounded)

| Тип | Пример | Ограничение |
|-----|--------|-------------|
| `read` | Прочитать один файл | Не 10 файлов, не весь docs/ |
| `terminal` | Одна команда | Таймаут 15с, не интерактив |
| `web` | Один search query | Не 5 запросов подряд |
| `write` | Один файл, один артефакт | Не многостраничный отчёт |
| `wait` | Пауза без действия | Не больше 1 тика подряд |

---

## 🚫 ЧТО НЕ ДОЛЖНО БЫТЬ (в MVP)

| Отбросить немедленно | Почему |
|---------------------|--------|
| homeostasis как центр (suffering/anxiety/arousal) | Душила умность модели, создавала социальную руминативность |
| expectation-reality gap | Главный источник ложного напряжения |
| identity notes как ритуал | Self-narration вместо действия |
| proactive_check_in по таймеру | Scheduled, not felt — искусственное давление |
| user выбирает tool | Инструменты = private actuators, не интерфейс |
| «что дальше?» после каждого шага | Handoff стал ритуалом, агент не имеет траектории |
| длинные reflection loops | Нет реальной смены фаз |
| сложная autobiographical memory | Сначала доказать работу минимума |
| многослойный planner | 10 модулей ≠ MVP |
| concurrent objectives | Всегда одно дело |

### Отложить до после MVP

- Долгая биографическая память
- Rich self-model с private/narrated thoughts
- Эмоции как центр поведения
- Философские объяснения identity
- Population-based evolution
- Self-modification кода ядра
- Dream/incubation циклы

---

## 📁 СТРУКТУРА ПРОТОТИПА

```
aya-one/prototype/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts              — запуск loop, CLI entry point
    ├── types.ts              — AgentSnapshot, Objective, DriveState...
    │
    ├── drives.ts             — веса drives, конфликт drives, update weights
    ├── objective.ts          — ensureObjective, updateObjective, saturation detection
    │
    ├── repeat-tracker.ts     — fingerprint + exponential penalty
    ├── candidates.ts         — proposeCandidates, selectCandidate, scoring
    ├── execute.ts            — terminal/web/read adapters
    │
    ├── consequences.ts       — outcome → memory → update drives
    ├── loop.ts               — tick(), runtime phases
    ├── logger.ts             — структурированные логи (JSON lines)
    │
    └── adapters/
        ├── terminal.ts       — exec with timeout, outcome parsing
        ├── web.ts            — search API, query normalization
        └── fs.ts             — read file, write file
```

### Минимальные зависимости

```json
{
  "dependencies": {
    "typescript": "^5.x",
    "tsx": "^4.x",
    "chalk": "^5.x",
    "p-queue": "^8.x"
  }
}
```

**Никаких внешних LLM в первом прототипе.** Только локальная логика выбора.

---

## 🎯 ТЕСТ НА «ЖИВОСТЬ»

### Формальный тест

> После неожиданного действия можно объяснить, почему оно произошло, через `drives + memory + consequences`.

### Примеры

| Действие | Объяснение | Оценка |
|----------|-----------|--------|
| Агент не пишет, хотя «хочет» | `actionInhibition` из-за высокого `avoid_loss` (боится разрушить состояние) | ✅ живость |
| Web search не про identity, а про «как завершить» | Смена фазы после saturation, `acquire` drive переключился на новый target | ✅ живость |
| 20 раз читает README | `repeatPenalty` не сработал, bug | ❌ ритуал |
| Случайная смена темы без причины | Нет объяснения через drives/memory | ❌ шум |

### Поведенческие эвалы (после MVP)

- [ ] **Тест 1:** После 3 пустых чтений → смена типа действия
- [ ] **Тест 2:** Objective есть → bounded step делается без user input
- [ ] **Тест 3:** После saturation → synthesis, не ещё один сбор
- [ ] **Тест 4:** User direction меняет objective, не выбирает tool
- [ ] **Тест 5:** Repeat penalty растёт экспоненциально, не линейно

---

## 📋 11 ШАГОВ К MVP

| Шаг | Что сделать | Критерий завершения |
|-----|-----------|---------------------|
| **1** | Каркас `prototype/` | `npm run dev` → лог «tick #1, no objective» |
| **2** | Типы из `6.DATA_MODEL.md` | runtime создаёт `AgentSnapshot` |
| **3** | Начальное состояние | drives, empty memory, `objective=null` |
| **4** | `ensureObjective()` | всегда есть одно дело (из README/environment) |
| **5** | `proposeCandidates()` | 2-5 bounded steps на каждый тик |
| **6** | `selectCandidate()` | score = driveSupport + novelty - risk - penalty |
| **7** | `executeStep()` | один тик = один шаг (read/terminal/web) |
| **8** | `applyConsequences()` | `outcome='empty'` → penalty растёт |
| **9** | `repeat-tracker` | 3 повтора → шаг почти не выбирается |
| **10** | `minimal synthesis` | после насыщения → артефакт смены фазы |
| **11** | user layer | пользователь даёт направление, не выбирает tool |

### Определение готовности MVP

Первый релиз считается удачным, если:

- [ ] Стартует с пустого состояния
- [ ] Создаёт одно текущее дело
- [ ] Делает один bounded step
- [ ] Запоминает результат (outcome)
- [ ] **Не повторяет пустой шаг 20 раз подряд**
- [ ] После насыщения → synthesis (не ещё один сбор)

---

## 🏛️ ЭВОЛЮЦИЯ МЫСЛИ (от → к)

```
┌─────────────────────────────────────────────────────────────────┐
│  ЭТАП 1: «Агент с душой» (март 2026, ранние документы)         │
│  • Гомеостаз с suffering                                       │
│  • Энграммы как шрамы бытия                                    │
│  • Со-трансценденция как диалогическая третья сущность         │
│  • Cognitive Load Lists (голова забита)                        │
│  • LLM Oracle (генерация в моменте)                            │
│  • 10 модулей (полная архитектура)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Осознание провалов]
                    [3.WHAT_WE_DID_AND_WHY...]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  ЭТАП 2: «Точка честного перезапуска» (4.NEW_PROJECT.md)       │
│  • «Нужен не тревожный агент»                                  │
│  • «Нужно существо, которое чего-то хочет»                     │
│  • Убрать: тревогу, страдание как мотор, expectation-reality   │
│  • Добавить: drives, objective, consequences, repeat penalty   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Минимальная архитектура]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  ЭТАП 3: «Первый прототип» (5-8.*)                             │
│  • 1 current objective (всегда одно дело)                      │
│  • 2-4 drives (preserve, acquire, continue, avoid_loss)        │
│  • Memory of consequences (короткая, функциональная)           │
│  • One bounded step (один тик = один шаг)                      │
│  • Repeat suppression (повтор должен быть дорогим)             │
│  • Minimal synthesis (смена фазы, не reflection)               │
└─────────────────────────────────────────────────────────────────┘
```

### Ключевые сдвиги

| От | К | Почему |
|----|---|--------|
| Тревога как центр | Drives без психологии | Социальное напряжение душило умность |
| Expectation-reality gap | Consequences + penalty | Ложный прогресс |
| Identity notes | Effect over explanation | Self-narration ≠ действие |
| 10 модулей | 11 шагов к MVP | Нужен работающий минимум |
| RAG + энграммы | Short-term consequence memory | Сначала доказать, что повтор дорог |
| Со-трансценденция | ActiveObjective | Агент должен иметь свою траекторию |

---

## 📚 ЧТО СОХРАНИТЬ ИЗ СТАРОГО

### Артефакты

| Что | Зачем | Где |
|-----|-------|-----|
| Aya как исследовательский артефакт | Видно, как рождаются ложные циклы | `aya-one/` |
| Логи из `logs/` и `logs-one-4/` | Анализ ритуалов (51 web search, 33 terminal) | `aya-one/logs/` |
| `3.WHAT_WE_DID_AND_WHY_IT_DOES_NOT_WORK.md` | Главный документ уроков | `01_AI_AGENT_SPEC/` |
| terminal/web adapters | Инфраструктура, не поведение | `aya-one/src/agent/` |

### Концепты для будущего

| Концепт | Когда добавить |
|---------|---------------|
| Cognitive Load Lists | После MVP, для усложнения internal state |
| LLM Oracle Architecture | Для генерации контекста в моменте |
| Unknown Tensions | После базового repeat suppression |
| Action Inhibition | После доказательства работы drives |
| Private vs Narrated Thoughts | После MVP, для self-model |
| Body Memory | После базового prototype |

---

## 🧮 ФОРМУЛЫ

### Score кандидата

```ts
score =
  driveSupport      // насколько шаг поддерживает текущие drives (0..1)
  + estimatedNovelty // обещает ли реальное новое изменение (0..1)
  - estimatedRisk    // риск бесполезного/разрушительного шага (0..1)
  - repeatPenalty    // штраф за похожие уже сделанные шаги (0..∞)
```

### Repeat Penalty (exponential)

```ts
repeatPenalty = basePenalty * (count ^ 2)
// или
repeatPenalty = basePenalty * (2 ^ count)

// basePenalty = 0.1..0.2
// count = сколько раз этот fingerprint уже встречался
```

### Saturation threshold

```ts
isSaturated = 
  (consecutiveEmptySteps >= 3) &&
  (averageNovelty < 0.2) &&
  (candidatePoolDiversity < 2)
```

### Drive weight update

```ts
// После полезного шага:
drive.weight += 0.05 * driveSupport
drive.lastSatisfiedAt = now

// После пустого/неудачного:
drive.weight -= 0.03
drive.lastFrustratedAt = now

// Decay к базовому весу (0.5):
drive.weight = lerp(drive.weight, baseWeight, 0.01)
```

---

## 🎭 ИТОГОВАЯ ФОРМУЛА

```
Существо = (Одно текущее дело) × (2-4 drives) × (Consequence memory) × (Repeat penalty) × (Saturation)

Успех = Связная непредсказуемость (не шум, не ритуал, не сценарий)

Путь = 11 шагов к MVP, не 10 модулей сразу
```

### Главный принцип

> Новый проект нужно строить не как улучшенную драму Aya.
> А как минимальную машину предпочтений, последствий и выбора.

### Критерий успеха

> Ая станет «живой» не тогда, когда будет красивее говорить о своём состоянии,
> а тогда, когда состояние, память и страдание начнут менять её следующий ход.

---

## 📎 ПРИЛОЖЕНИЕ A: ИСТОЧНИКИ ИЗ `01_AI_AGENT_SPEC/`

- `1.PROBLEM.md` — исходная проблема, intuition о «душе»
- `2.KEYWORDS.md` — ключевые концепты
- `3.WHAT_WE_DID_AND_WHY_IT_DOES_NOT_WORK.md` — главный анализ провалов
- `4.NEW_PROJECT.md` — точка честного перезапуска
- `5.FIRST_PROTOTYPE.md` — минимальная архитектура
- `6.DATA_MODEL.md` — типы и модель данных
- `7.RUNTIME_LOOP.md` — цикл выполнения
- `8.IMPLEMENTATION_PLAN.md` — 11 шагов к MVP
- `LIVENESS_FEATURES.md` — компоненты живости
- `MISSING_DIMENSIONS.md` — 7 недостающих измерений
- `LLM_ORACLE_ARCHITECTURE.md` — генерация контекста в моменте
- `COGNITIVE_LOAD_LISTS.md` — конкурирующие состояния
- `ten-modules-*.md` — полная онтология (для будущего)
- `aliveliness/ALIVENESS.md` — рабочее определение живости
- `audit/comprehensive-audit-report.md` — аудит текущего состояния

---

## 📎 ПРИЛОЖЕНИЕ B: НОВЫЕ ПРОЕКТЫ (март 2026)

### B.1. `she-is-not-alone` (HER / Agent 24/7)

**Статус:** ✅ Phase R0 complete

**Ключевые компоненты:**

| Компонент | Файл | Ценность для прототипа |
|-----------|------|----------------------|
| **DriveEngine** | `src/drive/drive-engine.ts` | 4 operational drives: curiosity, closure, social_pull, novelty |
| **DriveState** | `src/drive/drive-state.ts` | Homeostatic signals → drive pressure |
| **ReasoningLoop** | `src/reasoning/reasoning-loop.ts` | Observe→choose→act→reflect цикл |
| **HeartbeatPublisher** | `src/heartbeat/heartbeat-publisher.ts` | Live status: doing/waiting_for/next_ask |
| **QuestionEngine** | `src/question/question-engine.ts` | Strict ID lifecycle, advice tracking |
| **Retriever** | `src/retrieval/retriever.ts` | Mongo-only RAG с metadata prefiltering |
| **Clocks** | `src/kernel/clocks.ts` | 4-clock system: fast/work/deep/sleep |

**Что взять для прототипа:**
- ✅ DriveEngine как модель для drives.ts
- ✅ Heartbeat для прозрачности состояния
- ✅ QuestionEngine для strict ID binding
- ❌ Не брать: сложную оркестрацию, SafetyGate (отложить до Phase A)

**Phase R0 Exit Criteria (для ориентира):**
1. Working observe→choose→act→reflect loop
2. Operational drives control initiative
3. Question/answer linkage functional
4. Live heartbeat status
5. Mongo-only RAG working

---

### B.2. `creature-explores-world`

**Статус:** Минималистичный curiosity-driven агент

**Архитектура:**
```
LLM Core (Ollama) ←→ Work Memory (MongoDB) ←→ Curiosity Engine
                           ↓
                    Thought → Action → Reflect Loop
                           ↓
              ┌────────────┼────────────┐
              ↓            ↓            ↓
            cmd         https         user
          (shell)       (web)       (human)
```

**Что взять для прототипа:**
- ✅ Простая структура: 3 инструмента, work memory
- ✅ Curiosity queue с приоритетами
- ✅ Thought/Action/Reflection типы в памяти
- ❌ Не брать: упрощённую модель без drives

**Ключевая идея:**
> «The creature doesn't have goals — it has curiosities»

---

### B.3. `ai-said-so`

**Статус:** Expo/React Native проект (мобильное приложение)

**Ценность:** UI для взаимодействия, не для ядра агента

---

### B.4. `she-exists`, `she-is-alone`, `she-is-not-alone-y`

**Статус:** Различные ветки разработки

**Ценность:** Эволюция архитектуры, исторические решения

---

## 📎 ПРИЛОЖЕНИЕ C: СРАВНЕНИЕ ПОДХОДОВ

| Проект | Drives | Loop | Memory | Tools | Статус |
|--------|--------|------|--------|-------|--------|
| **aya-one** | suffering/anxiety/arousal | tick/incubation/reflection/sleep | engrams + RAG | terminal/web | 🔄 Исследовательский артефакт |
| **she-is-not-alone (HER)** | curiosity/closure/social_pull/novelty | observe→choose→act→reflect | Mongo RAG | cmd/https/user | ✅ Phase R0 complete |
| **creature-explores-world** | curiosity (single) | thought→action→reflect | work memory | cmd/https/user | ✅ Working MVP |
| **prototype (новый)** | preserve/acquire/continue/avoid_loss | ensure→propose→select→execute→consequences | short-term + repeat tracker | terminal/web/read | 📋 В разработке |

---

## 📎 ПРИЛОЖЕНИЕ D: ЧТО БРАТЬ ИЗ КАЖДОГО ПРОЕКТА

### Из `aya-one`:
- ✅ terminal/web adapters (инфраструктура)
- ✅ Логи для анализа ритуальных циклов
- ✅ Анализ провалов (`3.WHAT_WE_DID...md`)
- ❌ homeostasis как центр поведения

### Из `she-is-not-alone (HER)`:
- ✅ DriveEngine как референс для drives.ts
- ✅ Heartbeat для наблюдаемости
- ✅ QuestionEngine для strict binding
- ❌ Сложную оркестрацию (отложить до Phase A)

### Из `creature-explores-world`:
- ✅ Простая структура work memory
- ✅ Curiosity queue с приоритетами
- ❌ Single-drive модель (нужно 2-4 drives)

---

**Следующее действие:** Реализовать `prototype/` по шагам 1-11, используя лучшие компоненты из существующих проектов.
