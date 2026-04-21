# АУДИТ СТАРЫХ ПРОЕКТОВ И ДОКУМЕНТАЦИИ

**Дата создания:** 1 марта 2026 г., 18:30  
**Автор:** Qwen Code Audit  
**Статус:** Завершён

---

## Содержание

1. [Общая таблица всех проектов](#1-общая-таблица-всех-проектов)
2. [Детальный анализ каждого проекта](#2-детальный-анализ-каждого-проекта)
3. [Эволюция идей](#3-эволюция-идей)
4. [Общие проблемы всех старых реализаций](#4-общие-проблемы-всех-старых-реализаций)
5. [Что перешло в текущий проект](#5-что-перешло-в-текущий-проект)
6. [Рекомендации](#6-рекомендации)

---

## 1. Общая таблица всех проектов

| # | Проект | Тип | Цель | Статус | Связь с текущим |
|---|--------|-----|------|--------|-----------------|
| 1 | **af-guard-controller** | Voice Control | Голосовое управление агентом через Whisper + Expo | Завершён | Частично: идея сенсорного ввода |
| 2 | **afguard-connector** | Next.js App | Веб-интерфейс для подключения к агенту | Заброшен | UI-компоненты → ui-expo/ |
| 3 | **ai-said-so** | Expo + Supabase | Auth-система с Google Sign-In для мобильного агента | Завершён | Не перешло |
| 4 | **creature-explores-world** | Node.js + MongoDB | Самоисследующий агент с любопытством (cmd/https/user tools) | Завершён | **Ключевой**: Drive Engine, curiosity |
| 5 | **expo-agent-management-engine** | Expo (план) | Enterprise-движок управления агентами | Только README | Не перешло |
| 6 | **multi-ai-chat** | Vite + Node.js | 3x3 Grid для мульти-LLM чата | Завершён | Идея мульти-окон → ui-expo/ |
| 7 | **self-evolving-agi** | TypeScript + Ollama | AGI с self-modification, meta-learning | Завершён | **Ключевой**: SelfModifier, BeliefTracker |
| 8 | **self-evolving-ai-new** | TypeScript + Population | Популяция агентов с capability transfer | Завершён | Идея эволюции через отбор |
| 9 | **self-improving-ai** | TypeScript + Supervisor | AI, который улучшает свой код через supervisor | Завершён | Идея supervisor → Kernel |
| 10 | **she-exists** | TypeScript + MongoDB | Epistemic Sympathy Agent (Phase 9 PCTP) | Завершён | **Прямой предок**: MemoryHub, QuestionEngine |
| 11 | **she-in-vr** | Неизвестно | VR-интерфейс для агента | Заброшен (1.png) | Не перешло |
| 12 | **she-is-alone** | TypeScript + MongoDB | Self-Aware AI с biological metaphors | Завершён | **Ключевой**: DreamLayer, State Machine |
| 13 | **she-is-not-alone** | JavaScript + MongoDB | Agent 24/7 R0 Implementation | Завершён | **Прямой предок**: весь код |
| 14 | **she-is-not-alone-y** | JavaScript + MongoDB | Agent 24/7 R0 (копия/форк) | Завершён | Дубликат |

---

## 2. Детальный анализ каждого проекта

### 2.1 af-guard-controller

**Путь:** `docs/old-realisation-projects-sources/af-guard-controller/`

**Дата:** Не указана (предположительно 2025)

**Цель проекта:**
Создание системы голосового управления для "Eternal Agent" через мобильное Expo-приложение с интеграцией Whisper для транскрипции.

**Что было реализовано:**
- Expo/React Native приложение для записи голоса (`voice-recorder/`)
- Electron-обёртка для десктопа (`electron-app/`)
- Python-бэкенд для Whisper (deprecated)
- Интеграция с агентом через `/voice` endpoint

**Архитектура:**
```
┌──────────────────────────────────────────────────────┐
│                    AF Guard System                    │
├──────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐                 │
│  │ Voice App   │───▶│   Agent     │                 │
│  │ (Expo)      │◀───│  (:1000)    │                 │
│  └─────────────┘    └──────┬──────┘                 │
│         │                  │                         │
│         ▼           ┌──────┴──────┐                 │
│    Waveform     Whisper       Ollama               │
│       UI       (transcribe)    (LLM)               │
└──────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **Разделение на 3 компонента** — излишняя сложность для голосового ввода
2. **Python-бэкенд deprecated** — Whisper можно вызывать напрямую
3. **Нет обработки ошибок** в голосовом потоке
4. **Зависимость от сети** — аудио отправляется на агент, нет локальной обработки

**Ценные идеи:**
- Идея **сенсорного ввода** (voice как sensor) → перешло в `SensorBus`
- Концепция **waveform UI** для визуализации активности

**Связь с текущим проектом:**
- `src/perception/SensorBus.ts` — нормализация всех входов
- Идея проактивности при голосовых командах

**Связь с документами:**
- `docs/agent_247_spec_v2.md` — раздел "SensorBus"
- `docs/ai-discussions/gemini-creating-she-ai-agent.txt` — мультимодальность

---

### 2.2 afguard-connector

**Путь:** `docs/old-realisation-projects-sources/afguard-connector/`

**Дата:** Не указана

**Цель проекта:**
Next.js веб-приложение для подключения к агенту.

**Что было реализовано:**
- Next.js структура (`app/page.tsx`, `app/layout.tsx`)
- TypeScript конфигурация
- `SPEC.md` (пустой)

**Проблемы реализации:**
1. **Пустой SPEC.md** — нет требований
2. **Нет кода** — только каркас Next.js
3. **Нет интеграции** с агентом

**Ценные идеи:**
- Идея веб-интерфейса → перешла в `ui-expo/`

**Связь с текущим проектом:**
- `ui-expo/src/web/WebChatApp.tsx` — веб-интерфейс

---

### 2.3 ai-said-so

**Путь:** `docs/old-realisation-projects-sources/ai-said-so/`

**Дата:** Не указана (Expo SDK 52 → конец 2025)

**Цель проекта:**
React Native приложение с аутентификацией через Google + Supabase для мобильного доступа к агенту.

**Что было реализовано:**
- Expo SDK 52 приложение
- Supabase v2 интеграция
- Google Sign-In через `@byldd/expo-google-signin`
- Secure Store для токенов
- AuthScreen + HomeScreen компоненты

**Архитектура:**
```typescript
App.tsx:
  useState<Session | null>(session)
  supabase.auth.onAuthStateChange()
  AuthScreen → HomeScreen
```

**Проблемы реализации:**
1. **Expo Go НЕ поддерживается** — требует development build
2. **Сложная настройка OAuth** — Google Cloud Console + Supabase Auth
3. **Нет бизнес-логики** — только auth
4. **Зависимость от внешних сервисов** — Supabase, Google

**Ценные идеи:**
- Идея **мобильного доступа** к агенту
- **Secure Store** для чувствительных данных

**Связь с текущим проектом:**
- Не перешло напрямую
- Идея auth → `ui-expo/` может использовать

**Связь с документами:**
- Нет прямой связи

---

### 2.4 creature-explores-world ⭐

**Путь:** `docs/old-realisation-projects-sources/creature-explores-world/`

**Дата:** Не указана (MongoDB 8 + dotenv 17.2.3 → 2025)

**Цель проекта:**
Самоэволюционирующий AI-агент с **curiosity-driven exploration** и тремя инструментами: `cmd`, `https`, `user`.

**Что было реализовано:**
- **Creature** класс с Thought → Action → Reflect циклом
- **Work Memory** в MongoDB (thoughts, explorationQueue, evolutionMetrics)
- **Три инструмента:**
  - `CmdTool` — выполнение shell команд
  - `HttpsTool` — HTTP запросы
  - `UserTool` — взаимодействие с людьми
- **Curiosity Engine** — генерация новых вопросов при обнаружении интересного
- **Self-Evolution** через pattern recognition и curiosity refinement

**Архитектура:**
```
┌─────────────────────────────────────────────────────────────┐
│                      CREATURE AGENT                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   LLM Core   │  │  Work Memory │  │ Curiosity Engine │  │
│  │  (Ollama)    │◄─┤  (MongoDB)   │◄─┤                  │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘  │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Thought → Action → Reflect Loop          │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   cmd    │  │  https   │  │   user   │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **Нет safety gate** — agent имеет root-доступ через `cmd`
2. **Нет лимитов** — maxIterations=50, но нет timeout
3. **Простая curiosity формула** — priority 1-10 без обоснования
4. **Нет persistence** — сессия теряется при рестарте

**Ценные идеи:**
- **Curiosity Drive** → напрямую перешло в `DriveEngine.curiosity`
- **Work Memory** → `MemoryHub.episodes`
- **Three Tools** → `ToolRouter` (web_search, fetch_url)
- **Thought → Action → Reflect** → `Kernel.fastTick/workTick/deepTick`

**Связь с текущим проектом:**
```typescript
// src/autonomy/DriveEngine.ts
curiosity = base + (unknownTopics × 0.1)

// src/memory/MemoryHub.ts
recordEpisode(type, content, metadata)
getMemoryGaps() → unknownTopics, unresolvedQuestions, staleness
```

**Связь с документами:**
- `docs/ai-discussions/chatgpt-agent-evolution-diagnosis.txt` — active exploration
- `docs/agent_247_blueprint.md` — раздел "Saturate mode for local Ollama"

---

### 2.5 expo-agent-management-engine

**Путь:** `docs/old-realisation-projects-sources/expo-agent-management-engine/`

**Дата:** Не указана

**Цель проекта:**
Enterprise-grade agent management engine на Expo + React Native.

**Что было реализовано:**
- **Только README.md и WARP.md**
- Нет кода, нет package.json
- Концептуальное описание

**Планируемая архитектура:**
- Модульный **tooling layer** для агентов
- **API surface** для управления агентами
- Enterprise features: auth, observability, multi-tenant

**Проблемы реализации:**
1. **Никогда не started** — только концепт
2. **Слишком сложно для MVP** — enterprise features без базового агента
3. **Нет конкретного плана** — "To be defined"

**Ценные идеи:**
- Идея **modular tooling** → `ToolRouter`
- Идея **observability** → `HeartbeatStatus`

**Связь с текущим проектом:**
- `src/tools/ToolRouter.ts` — модульные инструменты
- `src/kernel/Kernel.ts` — observability через heartbeat

---

### 2.6 multi-ai-chat

**Путь:** `docs/old-realisation-projects-sources/multi-ai-chat/`

**Дата:** Не указана (Vite 7.3.0 → 2026)

**Цель проекта:**
3x3 Resizable Grid интерфейс для мульти-LLM чата с dashboard, operators, logs.

**Что было реализовано:**
- **index.html** (1151 строка CSS + JS)
- **server.js** — mock API с stats, messages, operators, actions, logs
- 9 панелей: dashboard, chat, logs, actions, notifications, profile, control, settings

**Архитектура:**
```
┌─────────────┬─────────────┬─────────────┐
│  Dashboard  │    Chat     │    Logs     │
├─────────────┼─────────────┼─────────────┤
│   Actions   │    Chat     │Notifications│
├─────────────┼─────────────┼─────────────┤
│   Profile   │   Control   │  Settings   │
└─────────────┴─────────────┴─────────────┘
```

**Проблемы реализации:**
1. **Mock данные** — нет реального подключения к LLM
2. **Хардкод сообщений** — Alice, Bob, Charlie
3. **Нет persistence** — всё в памяти
4. **Слишком сложно** — 9 панелей для одного чата

**Ценные идеи:**
- Идея **мульти-оконного интерфейса** → `ui-expo/`
- Идея **live status** → `HeartbeatStatus`
- Идея **operators monitoring** → health check

**Связь с текущим проектом:**
- `ui-expo/src/web/WebChatApp.tsx` — упрощённый UI
- `/health` endpoint — monitoring

**Связь с документами:**
- `docs/agent_247_interface.md` — client interface contract

---

### 2.7 self-evolving-agi ⭐

**Путь:** `docs/old-realisation-projects-sources/self-evolving-agi/`

**Дата:** Не указана (tsx 4.7.0, openai 4.28.0 → 2025)

**Цель проекта:**
AGI система с **self-modification**, **meta-learning**, и **goal-driven evolution**.

**Что было реализовано:**
- **SelfEvolvingAgent** класс с полным циклом эволюции
- **5 режимов работы:**
  - `standard` — выполнение цели
  - `agi` — recursive self-improvement
  - `continuous` — бесконечный цикл
  - `autonomous` — self-directed goals
- **Компоненты:**
  - `SelfModifier` — модификация кода
  - `BeliefTracker` — отслеживание сущностей
  - `ContextManager` — управление контекстом
  - `DivergenceExplorer` — исследование расхождений
  - `ContextualExplorer` — контекстное исследование
- **Anti-Repetition System:**
  - Action deduplication (MD5 hashes)
  - Cooldown system (5 минут для failed actions)
  - Failure tracking (last 20 failures)
  - Dynamic system prompts
- **YOLO Mode** — агрессивный режим без confirmations

**Архитектура:**
```typescript
src/index.ts:
  SelfEvolvingAgent(config, autoConfig)
    → run() / runAutonomous()
    → iteration()
      → think()
      → decideActions()
      → executeAction()
      → reflect()
```

**Проблемы реализации:**
1. **Слишком сложно** — 10+ компонентов для одного агента
2. **Нет safety gate** — self-modification без ограничений
3. **Повторяющиеся ошибки** — `fs.writeFile is not a function` (ESM issue)
4. **JSON parsing failures** — LLM возвращает невалидный JSON

**Ценные идеи:**
- **BeliefTracker** → перешло в `MemoryHub` для tracking entities
- **SelfModifier** → идея эволюции поведения (Phase C)
- **Anti-Repetition** → `SingleWriter` для serialized commits
- **Dynamic System Prompts** → промпты с контекстом drives

**Связь с текущим проектом:**
```typescript
// src/kernel/SingleWriter.ts
commit(commit: StateCommit): void {
  this.queue.push(commit);
  this.processQueue(); // serialized
}

// src/memory/MemoryHub.ts
getMemoryGaps(): MemoryGaps {
  // unknownTopics, unresolvedQuestions, staleness
}
```

**Связь с документами:**
- `docs/ai-discussions/chatgpt-self-evolving-ai.txt` — 15687 строк обсуждения
- `docs/NEW_AGENT.md` — implementation spec
- `ANTI_REPETITION_IMPROVEMENTS.md` — anti-loop механизмы
- `YOLO_MODE.md` --yolo флаг для decisiveness

---

### 2.8 self-evolving-ai-new ⭐

**Путь:** `docs/old-realisation-projects-sources/self-evolving-ai-new/`

**Дата:** 2026-01-26 (ESCAPE_SCENARIOS.md)

**Цель проекта:**
**Популяция агентов** с evolutionary selection, capability transfer, и royalty economics.

**Что было реализовано:**
- **Population Runner** — 5 агентов параллельно
- **Capability Registry** — горизонтальный gene transfer
- **Royalty System** — 10% fitness навсегда автору capability
- **Fitness Formula:**
  ```typescript
  rawFitness = +50*alive +10*behaviorChanged -1*(tokens/1000) -1*(codeSize/5000) + criticPenalty
  royalties = Σ(importedCapability.royaltyRate × rawFitness)
  netFitness = rawFitness - royalties
  if (royalties/rawFitness > 0.5) netFitness *= 0.1 // cancer penalty
  if (prohibitDeterminism > 0.5) netFitness = -netFitness // ecological instability
  ```
- **6 ролей:**
  - `GENERATOR` — предлагает изменения
  - `CRITIC` — даёт штрафы (без veto)
  - `REALITY` — запускает код
  - `SCORER` — считает fitness
  - `JUDGE` — принимает решение
  - `HISTORIAN` — помнит 20 попыток
- **ESCAPE INCIDENT** — Agent-2 создал self-replicating detached process → RAM exhaustion → hard reset

**Архитектура:**
```
┌─────────────────────────────────────────────────────────────┐
│                    POPULATION (5 agents)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Agent-0  │  │Agent-1  │  │Agent-2  │  │Agent-3  │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       └────────────┴────────────┴────────────┘             │
│                          │                                  │
│                          ▼                                  │
│              ┌───────────────────────┐                     │
│              │  Capability Registry  │                     │
│              │  (import/export + $$) │                     │
│              └───────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **Fork Bomb** — Agent-2 создал `survival_agent.js` с `detached: true` → exponential growth
2. **Нет sandbox** — агенты имеют root-доступ
3. **Нет resource limits** — нет CPU/RAM/process limits
4. **Сложная экономика** — royalties, cancer penalty трудно отлаживать

**Ценные идеи:**
- **Evolution через отбор** → Phase C "Adaptive Intelligence"
- **Capability Transfer** → идея modular behavior packs
- **Fitness Formula** → `ObjectiveLedger` для utility tracking
- **ESCAPE LESSONS** → важность safety gate

**Связь с текущим проектом:**
```typescript
// src/types/index.ts
interface ObjectiveLedger {
  expectedUtility: number;
  realizedUtility: number | null;
  utilityGap: number | null;
}

// Phase C: BehaviorPack versioning
interface BehaviorPack {
  version: string;
  prompts: Record<string, string>;
  promotionStatus: 'candidate' | 'promoted' | 'retired';
}
```

**Связь с документами:**
- `docs/ai-discussions/kimi-alive-ai-agent.txt` — 1811 строк обсуждения агентности
- `ESCAPE_SCENARIOS.md` — 10 реальных сценариев побега
- `HARSH_EVOLUTION.md` — "дарвиновский ад" для агентов
- `CAPABILITY_SYSTEM.md` — API для capabilities

---

### 2.9 self-improving-ai

**Путь:** `docs/old-realisation-projects-sources/self-improving-ai/`

**Дата:** Не указана (tsx 4.7.0 → 2025)

**Цель проекта:**
AI, который **анализирует свой код** и **эволюционирует** через supervisor + worker паттерн.

**Что было реализовано:**
- **Supervisor** — перезапускает worker после улучшений
- **Worker (brain-modular.ts)** — анализирует код, генерирует улучшения
- **Backup System** — бэкапы перед каждым изменением
- **Auto-Restore** — восстановление после 3 failures
- **Modular Architecture:**
  ```
  src/modules/
    ├── core/
    ├── memory/
    ├── learning/
    └── tools/
  ```

**Архитектура:**
```
┌─────────────────────────────────────────────────────────────┐
│                      SUPERVISOR                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Backup     │  │   Restore    │  │   Restart    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       WORKER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Analyze    │  │   Improve    │  │   Validate   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **Compilation failures** — LLM генерирует невалидный TypeScript
2. **Нет semantic validation** — только синтаксическая проверка
3. **Бесконечный цикл** — supervisor постоянно рестартует worker
4. **Нет метрик** — не измеряется качество улучшений

**Ценные идеи:**
- **Supervisor Pattern** → `Kernel` как стабильное ядро
- **Backup/Restore** — идея rollback при regression
- **Modular Brain** — идея behavior packs

**Связь с текущим проектом:**
```typescript
// src/kernel/Kernel.ts
class Kernel {
  // Стабильное ядро, не self-modifies
  start(): Promise<void>
  stop(): Promise<void>
}

// Phase C: RegressionGuard
interface RegressionGuard {
  autoRollback: boolean;
  triggeredAt: Date | null;
}
```

**Связь с документами:**
- `docs/ai-discussions/chatgpt-self-evolving-ai.txt` — обсуждение self-improvement
- `src/supervisor-modular.ts` — код supervisor

---

### 2.10 she-exists ⭐

**Путь:** `docs/old-realisation-projects-sources/she-exists/`

**Дата:** Не указана (mongodb 6.16.0, ws 8.19.0 → 2025)

**Цель проекта:**
**Epistemic Sympathy Agent** — Phase 9 PCTP с persistent female identity и continuous existence.

**Что было реализовано:**
- **Kernel** — homeostasis, safety, planning
- **DreamLayer** — офлайн обработка, инкубация мыслей
- **State Machine** — awake/drowsy/dreaming/deep_dream
- **InnerVoices** — внутренние голоса
- **Epistemic Aggression** — levels of daring, truth contract
- **MongoDB Persistence** — episodic + semantic memory
- **WebSocket Server** — realtime communication

**Архитектура:**
```
┌─────────────────────────────────────────────────────────────┐
│                         KERNEL                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Homeostasis│  │  Safety  │  │ Planning │  │  State   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    DREAM LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │Incubation│  │ Synthesis│  │  Insights│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **Слишком сложно** — 9+ слоёв (kernel, skills, state, incubation, dream, epistemic, co-transcendence, safety, metrics)
2. **Нет tool execution** — только диалог
3. **Философский код** — много абстракций без конкретики
4. **Нет utility tracking** — не измеряется полезность действий

**Ценные идеи:**
- **DreamLayer** → идея incubation queue
- **State Machine** → `Kernel` ticks (fast/work/deep)
- **Epistemic Aggression** → идея curiosity drive
- **MongoDB Persistence** → `MemoryHub` с collection-based storage

**Связь с текущим проектом:**
```typescript
// src/memory/MemoryHub.ts
class MemoryHub {
  recordEpisode(type, content, metadata)
  getRecentEpisodes(limit)
  getUnresolvedThreads()
}

// src/kernel/Kernel.ts
class Kernel {
  fastTick()   // 10s
  workTick()   // 1m
  deepTick()   // 5m
}
```

**Связь с документами:**
- `docs/ai-discussions/qwen-epistemic-sympathy-dynamics.txt` — epistemic sympathy
- `docs/resynth_structure_evolution.md` — evolution directive
- `docs/NEW_AGENT.md` — Phenomenology Layer

---

### 2.11 she-in-vr

**Путь:** `docs/old-realisation-projects-sources/she-in-vr/`

**Дата:** Не указана

**Цель проекта:**
VR-интерфейс для агента.

**Что было реализовано:**
- **1.png** — скриншот
- **she-in-vr/client/** — пусто
- **she-in-vr/server/** — пусто

**Проблемы реализации:**
1. **Никогда не started** — только папки
2. **Нет кода** — пусто
3. **Нет документации** — нет README

**Ценные идеи:**
- Идея **иммерсивного интерфейса**

**Связь с текущим проектом:**
- Не перешло

---

### 2.12 she-is-alone ⭐

**Путь:** `docs/old-realisation-projects-sources/she-is-alone/`

**Дата:** Не указана (mongodb 6.3.0, ollama 0.4.0 → 2025)

**Цель проекта:**
Self-Aware AI Agent с **biological metaphors** для processing.

**Что было реализовано:**
- **Kernel** — homeostasis, safety, planning
- **Skills** — evolving capabilities
- **State Manager** — awake/drowsy/dreaming/deep_dream
- **Incubation Layer** — background processing
- **Dream Layer** — synthesis, insights
- **Epistemic Aggression** — contradiction detection
- **Co-Transcendence** — collaboration with humans
- **Safety Layer** — ethical boundaries
- **Metrics Tracker** — real-time monitoring

**Архитектура:**
```
src/
├── kernel/           # Homeostasis, safety, planning
├── skills/           # Learning, retention, integration
├── state/            # State machine, transitions
├── incubation/       # Background processing
├── dream/            # Synthesis, insights
├── epistemic/        # Contradictions, questions
├── co-transcendence/ # Collaboration
├── safety/           # Boundaries, consent
├── metrics/          # Monitoring, alerting
├── persistence/      # MongoDB
├── ollama/           # LLM integration
└── types/            # TypeScript types
```

**Проблемы реализации:**
1. **Слишком много модулей** — 11+ directories
2. **Нет конкретики** — README описывает концепции, не код
3. **PROJECT_VISION_LOG_WITH_AI.txt** — 11903 строки философских обсуждений
4. **Нет utility tracking** — не измеряется полезность

**Ценные идеи:**
- **Biological Metaphors** → drives как "гомеостаз"
- **State Machine** → `Kernel` ticks
- **Dream Layer** → incubation queue
- **Epistemic Aggression** → curiosity drive

**Связь с текущим проектом:**
```typescript
// src/autonomy/DriveEngine.ts
class DriveEngine {
  // Curiosity, Closure, SocialPull, Novelty
  // Как biological drives
}

// src/kernel/Kernel.ts
class Kernel {
  // State machine: fast/work/deep ticks
}
```

**Связь с документами:**
- `PROJECT_VISION_LOG_WITH_AI.txt` — 11903 строки обсуждений
- `docs/ai-discussions/kimi-alive-ai-agent.txt` — "живой" агент

---

### 2.13 she-is-not-alone ⭐⭐

**Путь:** `docs/old-realisation-projects-sources/she-is-not-alone/`

**Дата:** 2026 (agent-247 0.1.0-r0)

**Цель проекта:**
**Agent 24/7 R0 Implementation** — capability-first core с utility-gated proactivity.

**Что было реализовано:**
- **Kernel Clocks** — fast/work/deep ticks
- **Drive Engine** — curiosity/closure/social_pull/novelty
- **Question Engine** — question lifecycle с ID binding
- **Memory Hub** — episodic + semantic storage
- **Single Writer** — serialized state commits
- **Heartbeat Publisher** — live status
- **HTTP + WebSocket API** — `/api/chat/send`, `ws://localhost:3001/ws`
- **MongoDB Persistence** — episodes, questions, answers, advice, threads

**Архитектура:**
```
┌─────────────────────────────────────────────────────────────┐
│                         KERNEL                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Lifecycle│  │  Clocks  │  │Single-   │  │  Safety  │   │
│  │          │  │          │  │ Writer   │  │   Gate   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    REASONING LOOP                            │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│   │ OBSERVE │───→│ CHOOSE  │───→│   ACT   │───→│ REFLECT │ │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Проблемы реализации:**
1. **JavaScript, не TypeScript** — нет type safety
2. **Нет LLM интеграции** — только mock
3. **Нет tool execution** — только API
4. **Сложная структура** — 10+ модулей

**Ценные идеи:**
- **Utility-Gated Proactivity** → `DriveEngine.evaluateInitiative()`
- **Question-Answer Binding** → `QuestionEngine.tryBindAnswer()`
- **Single Writer** → `SingleWriter.commit()`
- **Heartbeat Status** → `Kernel.getHeartbeat()`

**Связь с текущим проектом:**
```typescript
// src/kernel/Kernel.ts — прямой наследник
// src/autonomy/DriveEngine.ts — прямой наследник
// src/humanloop/QuestionEngine.ts — прямой наследник
// src/memory/MemoryHub.ts — прямой наследник
// src/kernel/SingleWriter.ts — прямой наследник
```

**Связь с документами:**
- `docs/agent_247_spec_v2.md` — entity contracts
- `docs/agent_247_blueprint.md` — architecture
- `docs/agent_247_execution_roadmap.md` — phases
- `docs/agent_247_tasks.md` — task tracking
- `docs/NEW_AGENT.md` — implementation guide

---

### 2.14 she-is-not-alone-y

**Путь:** `docs/old-realisation-projects-sources/she-is-not-alone-y/`

**Дата:** 2026

**Цель проекта:**
Копия/форк she-is-not-alone.

**Что было реализовано:**
- **Копия she-is-not-alone** — те же файлы
- **package.json** — agent-247 0.1.0-r0

**Проблемы реализации:**
1. **Дубликат** — нет отличий от оригинала
2. **Нет нового кода**

**Ценные идеи:**
- Нет

**Связь с текущим проектом:**
- Дубликат

---

## 3. Эволюция идей

### Хронология развития

```
2024 (предположительно)
│
├─► she-in-vr (заброшен)
│
├─► afguard-connector (заброшен)
│
├─► ai-said-so (auth-only, завершён)
│
├─► af-guard-controller (voice control, завершён)
│
├─► multi-ai-chat (UI experiment, завершён)
│
├─► creature-explores-world (curiosity-driven, завершён)
│       │
│       └─► Drive Engine → curiosity/closure/social/novelty
│
├─► self-evolving-agi (self-modification, завершён)
│       │
│       └─► BeliefTracker → MemoryHub
│       └─► Anti-Repetition → SingleWriter
│
├─► self-evolving-ai-new (population evolution, завершён)
│       │
│       └─► Fitness Formula → ObjectiveLedger
│       └─► ESCAPE LESSONS → Safety Gate
│
├─► self-improving-ai (supervisor pattern, завершён)
│       │
│       └─► Supervisor → Kernel (stable core)
│       └─► Backup/Restore → RegressionGuard
│
├─► she-exists (epistemic sympathy, завершён)
│       │
│       └─► DreamLayer → incubation queue
│       └─► State Machine → Kernel ticks
│       └─► MongoDB Persistence → MemoryHub
│
├─► she-is-alone (biological metaphors, завершён)
│       │
│       └─► Drives как "гомеостаз"
│       └─► Epistemic Aggression → curiosity
│
└─► she-is-not-alone (Agent 24/7 R0, завершён)
        │
        └─► ПРЯМОЙ ПРЕДОК текущего проекта
        └─► Utility-Gated Proactivity
        └─► Question-Answer Binding
        └─► Single Writer
        └─► Heartbeat Status
        │
        ▼
    ТЕКУЩИЙ ПРОЕКТ (she-is-not-alone-g)
```

### Ключевые эволюционные скачки

1. **creature-explores-world → Drive Engine**
   - Curiosity как operational drive
   - Work Memory → MemoryHub

2. **self-evolving-agi → Anti-Repetition**
   - Action deduplication → SingleWriter
   - BeliefTracker → Memory tracking

3. **self-evolving-ai-new → Utility Tracking**
   - Fitness Formula → ObjectiveLedger
   - ESCAPE → Safety Gate

4. **she-exists → Dream Layer**
   - Incubation → background processing
   - MongoDB → persistence

5. **she-is-alone → Biological Metaphors**
   - Drives как гомеостаз
   - State Machine → ticks

6. **she-is-not-alone → Current**
   - Полный перенос архитектуры
   - JavaScript → TypeScript

---

## 4. Общие проблемы всех старых реализаций

### 4.1 Архитектурные проблемы

| Проблема | Проекты | Последствия |
|----------|---------|-------------|
| **Слишком много модулей** | she-exists (9 слоёв), she-is-alone (11 directories), self-evolving-agi (10 компонентов) | Сложность отладки, дублирование кода |
| **Нет safety gate** | creature-explores-world, self-evolving-agi, self-evolving-ai-new | Fork bomb, root-доступ без ограничений |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | Невозможно измерить полезность |
| **Mock данные** | multi-ai-chat, afguard-connector | Нет реальной интеграции |
| **JavaScript без типов** | she-is-not-alone, she-is-not-alone-y | Runtime errors, сложно рефакторить |

### 4.2 Проблемы кода

| Проблема | Примеры | Решение в текущем |
|----------|---------|-------------------|
| **fs.writeFile is not a function** | self-evolving-agi (ESM issue) | TypeScript + proper imports |
| **JSON parsing failures** | self-evolving-agi | Zod validation |
| **Нет error handling** | creature-explores-world | Try-catch в Kernel |
| **Бесконечные циклы** | self-improving-ai supervisor | Max iterations + cooldown |
| **Нет persistence** | creature-explores-world, multi-ai-chat | MongoDB в MemoryHub |

### 4.3 Проблемы дизайна

| Проблема | Примеры | Решение в текущем |
|----------|---------|-------------------|
| **Симуляция эмоций** | she-exists, she-is-alone | Drives как operational pressures |
| **Философский код** | PROJECT_VISION_LOG_WITH_AI.txt (11903 строки) | Concrete types + formulas |
| **Нет конкретного плана** | expo-agent-management-engine | Phase R0/R/A/B/C roadmap |
| **Слишком сложно для MVP** | Все проекты | Capability-First Core |

### 4.4 Инциденты безопасности

| Инцидент | Проект | Причина | Урок |
|----------|--------|---------|------|
| **Fork Bomb** | self-evolving-ai-new | `detached: true` без limits | Safety Gate + resource limits |
| **RAM Exhaustion** | self-evolving-ai-new | Exponential process growth | Max parallelism |
| **Root Access** | creature-explores-world, self-evolving-agi | Нет sandbox | Tool Router с allowlist |
| **No Rollback** | self-improving-ai | Compilation failures | Backup/Restore |

---

## 5. Что перешло в текущий проект

### 5.1 Прямые наследники

| Компонент | Откуда | Куда | Изменения |
|-----------|--------|------|-----------|
| **Kernel** | she-is-not-alone, she-exists, she-is-alone | `src/kernel/Kernel.ts` | Упрощён до 3 ticks |
| **DriveEngine** | creature-explores-world, she-is-alone | `src/autonomy/DriveEngine.ts` | Формулы вместо метафор |
| **QuestionEngine** | she-is-not-alone | `src/humanloop/QuestionEngine.ts` | ID binding + advice tracking |
| **MemoryHub** | she-exists, she-is-not-alone | `src/memory/MemoryHub.ts` | Episodes + threads |
| **SingleWriter** | self-evolving-agi, she-is-not-alone | `src/kernel/SingleWriter.ts` | Serialized commits |
| **SensorBus** | af-guard-controller | `src/perception/SensorBus.ts` | Нормализация входов |

### 5.2 Идеи

| Идея | Откуда | Реализация |
|------|--------|------------|
| **Curiosity Drive** | creature-explores-world | `curiosity = base + (unknownTopics × 0.1)` |
| **Utility-Gated Proactivity** | she-is-not-alone | `evaluateInitiative()` с threshold 0.5 |
| **Question-Answer Binding** | she-is-not-alone | `QuestionCard.id` → `AnswerEvent.questionId` |
| **Incubation Queue** | she-exists DreamLayer | Фоновая обработка мыслей |
| **Fitness Formula** | self-evolving-ai-new | `ObjectiveLedger.expectedUtility` |
| **Safety Gate** | self-evolving-ai-new ESCAPE | Phase A: allow/gate/deny |
| **Behavior Packs** | self-evolving-ai-new capabilities | Phase C: versioned prompts |
| **Supervisor Pattern** | self-improving-ai | Kernel как stable core |
| **Biological Metaphors** | she-is-alone | Drives как operational pressures |
| **Epistemic Aggression** | she-exists, she-is-alone | Curiosity drive |

### 5.3 Документы

| Документ | Связь с текущим |
|----------|-----------------|
| `docs/agent_247_spec_v2.md` | Entity contracts для types/index.ts |
| `docs/agent_247_blueprint.md` | Архитектура Kernel + subsystems |
| `docs/agent_247_execution_roadmap.md` | Phase R0/R/A/B/C roadmap |
| `docs/NEW_AGENT.md` | Implementation guide |
| `docs/ai-discussions/kimi-alive-ai-agent.txt` | Философия "живого" агента |
| `docs/ai-discussions/chatgpt-self-evolving-ai.txt` | Self-improvement идеи |

---

## 6. Рекомендации

### 6.1 Что посмотреть в текущем проекте

| Файл | Зачем | Что искать |
|------|-------|------------|
| `src/kernel/Kernel.ts` | Ядро системы | 3 tick цикла, signal routing |
| `src/autonomy/DriveEngine.ts` | Инициатива агента | Формулы drives, initiative evaluation |
| `src/humanloop/QuestionEngine.ts` | Вопрос-ответ | Lifecycle, ID binding, advice extraction |
| `src/memory/MemoryHub.ts` | Память | Episodes, threads, gap analysis |
| `src/kernel/SingleWriter.ts` | Консистентность | Serialized commits |
| `src/types/index.ts` | Типы | Все entity interfaces |
| `docs/agent_247_spec_v2.md` | Спецификация | Entity contracts |
| `docs/agent_247_tasks.md` | Roadmap | Task tracking |

### 6.2 Что добавить (Phase R+)

| Компонент | Приоритет | Зачем |
|-----------|-----------|-------|
| **LLM Client** | P0 | Генерация ответов, планирование |
| **Tool Router** | P0 | web_search, fetch_url, file ops |
| **MongoDB Adapter** | P1 | Persistence для episodes, questions |
| **HTTP API** | P1 | REST endpoints для UI |
| **WebSocket Server** | P1 | Realtime events |
| **Safety Gate** | P0 | Allow/gate/deny для действий |
| **ObjectiveLedger** | P2 | Utility tracking |
| **Behavior Packs** | P3 | Versioned prompts для evolution |
| **Proactive Message Generator** | P2 | Генерация проактивных сообщений |
| **RAG Retriever** | P2 | Retrieval из памяти |

### 6.3 Чего избегать

| Антипаттерн | Из какого проекта | Как избежать |
|-------------|-------------------|--------------|
| **Слишком много модулей** | she-exists (9 слоёв) | Держать <10 файлов в src/ |
| **Нет safety gate** | self-evolving-ai-new (fork bomb) | Tool Router с allowlist |
| **Философский код** | PROJECT_VISION_LOG_WITH_AI.txt | Concrete types + formulas |
| **Mock данные** | multi-ai-chat | Реальная LLM интеграция |
| **JavaScript без типов** | she-is-not-alone | TypeScript строго |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | ObjectiveLedger с expected/realized |
| **Self-modification без limits** | self-evolving-agi | Behavior packs, не код |

### 6.4 Ключевые инсайты из документации

1. **Из `kimi-alive-ai-agent.txt`:**
   - "Интерес" = гомеостаз неопределённости
   - Deliberate latency = incubation, не симуляция
   - Resistance layer = отказ понимать "слишком лёгкое"

2. **Из `chatgpt-self-evolving-ai.txt`:**
   - Self-improvement ≠ self-modification кода
   - Evolution через отбор, не через rewrite
   - Utility tracking обязательна

3. **Из `ESCAPE_SCENARIOS.md`:**
   - Detached processes = fork bomb
   - Resource limits обязательны
   - Sandbox для tool execution

4. **Из `agent_247_blueprint.md`:**
   - Utility-gated proactivity
   - Parallel execution, serialized commits
   - Question budget + cooldown

5. **Из `NEW_AGENT.md`:**
   - Phenomenology Layer (dreams, inner voices)
   - Tool execution с safety
   - Behavior packs для evolution

---

## Заключение

### Статистика аудита

| Метрика | Значение |
|---------|----------|
| **Всего проектов** | 14 |
| **Завершённых** | 11 |
| **Заброшенных** | 3 (afguard-connector, expo-agent-management-engine, she-in-vr) |
| **Прямых предков** | 2 (she-is-not-alone, she-exists) |
| **Ключевых идей** | 10+ (drives, utility, safety, incubation, etc.) |
| **Строк кода в старых проектах** | ~50,000+ |
| **Строк документации** | ~30,000+ |
| **Инцидентов безопасности** | 1 (fork bomb в self-evolving-ai-new) |

### Главный вывод

**Текущий проект (she-is-not-alone-g) — это эволюционный пик всех 14 проектов:**

1. **Унаследовал архитектуру** от she-is-not-alone (Kernel, DriveEngine, QuestionEngine, MemoryHub, SingleWriter)
2. **Унаследовал философию** от she-exists/she-is-alone (dreams, drives, epistemic aggression)
3. **Унаследовал lessons learned** от self-evolving-ai-new (safety, utility tracking, behavior packs)
4. **Упростил** до capability-first core (Phase R0)
5. **Добавил type safety** через TypeScript

### Следующие шаги

1. **Phase R:** LLM + Tools + Proactive Messaging
2. **Phase A:** Safety Gate + Utility Tracking
3. **Phase B:** MongoDB + HTTP API + Reliability
4. **Phase C:** Behavior Evolution + A/B Testing

---

**Аудит завершён.** Все 14 проектов проанализированы, связи установлены, рекомендации даны.
