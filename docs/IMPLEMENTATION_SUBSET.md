# IMPLEMENTATION_SUBSET

Этот документ — безопасная выжимка для ИИ-кодера.
Использовать его как прямую спецификацию реализации.

Не брать архитектурные решения из философских разделов `000_FINAL_SPEC.md`.

## Цель

Собрать минимальный прототип существа, которое:

- имеет одно текущее дело
- выбирает один bounded step
- помнит последствия шагов
- делает повтор дорогим
- меняет поведение после пустых шагов

## Что Должно Быть В MVP

### 1. Current Objective

Одно текущее дело.

```ts
interface Objective {
  id: string;
  kind: 'inspect' | 'search' | 'compare' | 'build';
  target: string;
  reason: string;
  status: 'active' | 'saturated' | 'blocked' | 'done';
  progress: number;
  successCondition: string;
}
```

### 2. Drives

От 2 до 4 устойчивых drives.

```ts
interface DriveState {
  id: 'preserve' | 'acquire' | 'continue' | 'avoid_loss';
  weight: number;
}
```

Drives — не эмоции.
Они нужны только для выбора следующего шага.

### 3. Step Candidates

Система должна генерировать 2-5 маленьких реальных шагов.

```ts
interface StepCandidate {
  id: string;
  type: 'terminal' | 'web' | 'read' | 'write' | 'respond' | 'wait';
  intent: string;
  commandOrQuery?: string;
  estimatedNovelty: number;
  estimatedRisk: number;
  supportsDrives: string[];
}
```

### 4. Step Result

Каждый шаг должен давать структурированный результат.

```ts
interface StepRecord {
  id: string;
  objectiveId: string | null;
  type: 'terminal' | 'web' | 'read' | 'write' | 'respond' | 'wait';
  intent: string;
  commandOrQuery?: string;
  outcome: 'useful' | 'empty' | 'failed' | 'blocked';
  effectSummary: string;
}
```

### 5. Consequence Memory

Хранить только то, что меняет следующий выбор.

```ts
interface ConsequenceEntry {
  stepId: string;
  objectiveId: string | null;
  changedObjective: boolean;
  addedNovelty: number;
  repeatedPattern: boolean;
}
```

### 6. Repeat Tracker

Одинаковые пустые шаги должны быстро становиться дорогими.

```ts
interface RepeatTracker {
  fingerprint: string;
  count: number;
  lastSeenAt: number;
}
```

## Runtime Loop

Каждый тик:

1. `ensureObjective()`
2. `proposeCandidates()`
3. `selectCandidate()`
4. `executeStep()`
5. `applyStepConsequences()`
6. `updateObjective()`

Минимальная форма:

```ts
function tick(state: AgentSnapshot): AgentSnapshot {
  state = ensureObjective(state);
  const candidates = proposeCandidates(state);
  const selected = selectCandidate(state, candidates);

  if (!selected) return handleNoStep(state);

  const step = executeStep(state, selected);
  return applyStepConsequences(state, step);
}
```

## Scoring

Разрешённая стартовая формула:

```ts
score = driveSupport + estimatedNovelty - estimatedRisk - repeatPenalty
```

Этого достаточно для MVP.

## Жёсткие Ограничения

### Не добавлять в MVP

- homeostasis как центр поведения
- anxiety / suffering / arousal / affection
- expectation-reality gap
- identity notes
- reflection loops
- proactive_check_in по таймеру
- большие goal layers
- autobiographical memory
- многослойный planner
- prompt-психологию про внутреннее состояние

### Не делать пользователя selector'ом tool'ов

Пользователь задаёт направление.
Система сама выбирает terminal/web/read.

### Не разрешать длинные шаги

Один тик = один bounded step.

## Где Реализовывать

Создать новый проект рядом с Aya, а не внутри её старой логики.

Рекомендуемая структура:

```text
prototype/
  package.json
  tsconfig.json
  src/
    index.ts
    types.ts
    drives.ts
    objective.ts
    repeat-tracker.ts
    candidate-generation.ts
    candidate-selection.ts
    execute-step.ts
    consequences.ts
    runtime-loop.ts
    adapters/
      terminal.ts
      web.ts
```

## Первый Порядок Работ

1. Создать каркас `prototype/`
2. Описать типы
3. Сделать начальный `AgentSnapshot`
4. Реализовать `ensureObjective()`
5. Реализовать `proposeCandidates()`
6. Реализовать `selectCandidate()`
7. Реализовать `executeStep()`
8. Реализовать `applyStepConsequences()`
9. Добавить `RepeatTracker`
10. Проверить, что после пустых повторов система меняет шаг

## Минимальные Тесты

### Тест 1

Есть objective -> есть bounded step.

### Тест 2

Пустой шаг -> растёт repeat penalty.

### Тест 3

Несколько пустых похожих шагов -> меняется тип действия.

### Тест 4

Пользователь меняет направление objective, но не выбирает tool.

## Критерий Готовности MVP

MVP считается готовым, если система:

- держит одно текущее дело
- делает один bounded step
- не засчитывает пустой шаг как прогресс
- не застревает в одном и том же поиске или чтении
- остаётся связной без тревоги, reflection и identity notes

## Главное Правило

Строить не психологию.
Строить машину предпочтений, последствий и выбора.
