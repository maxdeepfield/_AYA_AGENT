# 10 МОДУЛЕЙ UTOPIA-AGI-ENGINE

**Синтез:** Qwen Code  
**Дата:** 1 марта 2026 г., 19:30  
**На основе:** Аудит 14 проектов, 31 файл AI-дискуссий, вся документация, 7 сквозных целей

---

## Преамбула

После анализа:
- **14 старых проектов** (50,000+ строк кода, 30,000+ строк документации)
- **31 файла AI-обсуждений** (Gemini, ChatGPT, Grok, Kimi, Qwen — 4.2 МБ текста)
- **Всей текущей документации** (ARCHITECTURE.md, agent_247_blueprint.md, PHASE_R0.md, и др.)
- **7 сквозных целей** (Validated Insights, Decision Lift, Goal Progress, Continuity, Negative Metrics, Co-Transcendence, Ontological Hunger)

Я выделил **10 фундаментальных модулей**, из которых состоит весь проект.

Это не просто "файловая структура". Это **онтология системы** — 10 сущностей, которые необходимы и достаточны для существования Utopia AGI Engine.

---

## 📊 Общая Схема

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UTOPIA AGI ENGINE                                    │
│                    "Создать из себя движок утопии"                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   1. KERNEL     │        │   2. MEMORY     │        │  3. PERCEPTION  │
│   (Ядро)        │        │   (Память)      │        │  (Восприятие)   │
│   Стабильное    │        │   6 уровней     │        │   5+ сенсоров   │
│   Неизменное    │        │   RAG + RAG     │        │   SignalQueue   │
└─────────────────┘        └─────────────────┘        └─────────────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   4. COGNITION  │        │   5. ACTION     │        │   6. SAFETY     │
│   (Мышление)    │        │   (Действие)    │        │   (Безопасность)│
│   4 drives      │        │   6+ tools      │        │   RiskGate      │
│   Curiosity     │        │   ToolRouter    │        │   Budgets       │
└─────────────────┘        └─────────────────┘        └─────────────────┘
         │                            │                            │
         └────────────────────────────┼────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   7. HUMANLOOP  │        │  8. EVOLUTION   │        │  9. DREAMS      │
│   (Диалог)      │        │   (Развитие)    │        │   (Инкубация)   │
│   Questions     │        │   Behavior      │        │   Sleep Tick    │
│   Co-Trans      │        │   Packs A/B     │        │   Consolidation │
└─────────────────┘        └─────────────────┘        └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  10. METRICS    │
                            │   (Наблюдение)  │
                            │   Heartbeat     │
                            │   Utility       │
                            └─────────────────┘
```

---

## 1. KERNEL (Ядро)

**Файл:** `src/kernel/Kernel.ts`  
**Статус:** ✅ Phase R0 Complete  
**Строки:** ~280  
**Ответственность:** Стабильный оркестратор, который никогда не self-modifies

### Что Делает

```
┌─────────────────────────────────────────────────────────────┐
│                      KERNEL                                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Fast Tick   │  │  Work Tick   │  │  Deep Tick   │      │
│  │   (10s)      │  │   (1m)       │  │   (5m)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SingleWriter (Hard)                      │  │
│  │         ВСЕ state changes ТОЛЬКО через здесь         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class Kernel {
  // Lifecycle
  async start(): Promise<void>
  async stop(): Promise<void>
  
  // Clocks
  private async fastTick(): Promise<void>   // Reactive processing
  private async workTick(): Promise<void>   // Productive execution
  private async deepTick(): Promise<void>   // Reflection + synthesis
  private async sleepTick(): Promise<void>  // Offline consolidation (Phase P4)
  
  // Signal Handling
  private async handleSignal(signal: SignalEvent): Promise<void>
  
  // State Commit (ЕДИНСТВЕННЫЙ ПУТЬ)
  async commit(change: StateChange): Promise<CommitResult>
  
  // Observability
  getHeartbeat(): HeartbeatStatus
}
```

### Связи с Другими Модулями

| Модуль | Как Связан |
|--------|------------|
| Memory | Kernel → MemoryHub.recordEpisode() |
| Perception | Kernel ← SensorBus.pollSignals() |
| Cognition | Kernel → DriveEngine.getCurrentState() |
| Action | Kernel → ToolRouter.execute() |
| Safety | Kernel → SafetyGate.evaluate() |
| HumanLoop | Kernel → QuestionEngine.shouldAskQuestion() |
| Evolution | Kernel → BehaviorPackManager.evaluate() |
| Dreams | Kernel → SleepOrchestrator.enterSleep() |
| Metrics | Kernel → MetricsEngine.publish() |

### Из Какого Проекта

- **she-is-not-alone** → Kernel (прямой наследник)
- **she-exists** → Kernel + DreamLayer
- **she-is-alone** → Kernel + State Machine
- **self-improving-ai** → Supervisor Pattern (стабильное ядро)

### Уроки из Аудита

| Проблема | Решение в Kernel |
|----------|------------------|
| self-modification без limits | Kernel НЕ self-modifies никогда |
| слишком много модулей | Kernel оркестрирует 9 модулей, не 11+ |
| нет safety gate | Kernel → SafetyGate.evaluate() перед действием |
| JavaScript без типов | TypeScript строго |

---

## 2. MEMORY (Память)

**Файл:** `src/memory/MemoryHub.ts`  
**Статус:** ✅ Phase R0 (in-memory), ⏳ Phase B (MongoDB)  
**Строки:** ~150  
**Ответственность:** 6 уровней памяти для хранения всего опыта

### 6 Уровней Памяти

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY HUB                                │
│                                                              │
│  Tier 1: ContextBuffer (working memory, ~50 episodes)       │
│  Tier 2: EpisodicStore (MongoDB, все события)               │
│  Tier 3: SemanticStore (RAG, векторный поиск)               │
│  Tier 4: ProceduralMemory (навыки, стратегии)               │
│  Tier 5: WorldObservations (факты о мире с citations)       │
│  Tier 6: AuditLog (неизменный журнал всех решений)          │
│                                                              │
│  + RelationalMemory (user↔agent transformation tracking)    │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class MemoryHub {
  // Episode Management
  async recordEpisode(episode: EpisodeRecord): Promise<void>
  async getRecentEpisodes(limit: number): Promise<EpisodeRecord[]>
  
  // Thread Management
  async addUnresolvedThread(thread: UnresolvedThread): Promise<void>
  async resolveThread(threadId: string): Promise<void>
  async getUnresolvedThreads(): Promise<UnresolvedThread[]>
  
  // RAG Retrieval
  async retrieveRelevantEpisodes(
    query: string,
    options: RetrieveOptions
  ): Promise<RetrievalResult>
  
  // Gap Analysis (для DriveEngine)
  async getMemoryGaps(): Promise<MemoryGaps>
  
  // Shutdown
  async shutdown(): Promise<void>
}
```

### Collections (MongoDB, Phase B)

```
episodes: {
  id: UUID
  type: 'user_message' | 'agent_response' | 'reflection' | 'tool_use'
  content: string
  timestamp: Date
  threadId: UUID | null
  metadata: { topic?: string, proactive?: boolean, questionId?: UUID }
}

questions: {
  id: UUID
  formulation: string
  topic: string
  decisionImpact: string
  fallbackPlan: string
  urgency: string
  askedAt: Date
  answeredAt: Date | null
}

answers: {
  id: UUID
  questionId: UUID
  text: string
  timestamp: Date
  bound: boolean
}

advice: {
  id: UUID
  questionId: UUID
  adviceText: string
  accepted: boolean
  impactDelta: number
  timestamp: Date
}

threads: {
  id: UUID
  title: string
  status: 'unresolved' | 'resolved'
  priority: number
  createdAt: Date
  resolvedAt: Date | null
}

audit_log: {
  id: UUID
  type: string
  payload: object
  hash: string
  timestamp: Date
  origin: string
}
```

### Из Какого Проекта

- **she-exists** → MongoDB Persistence, DreamLayer
- **she-is-not-alone** → Memory Hub (episodic + semantic)
- **creature-explores-world** → Work Memory
- **self-evolving-agi** → BeliefTracker

### Уроки из Аудита

| Проблема | Решение в Memory |
|----------|------------------|
| нет persistence | MongoDB (Phase B) для всех 6 уровней |
| нет utility tracking | AuditLog для всех решений |
| память = свалка | Consolidation в Sleep Tick |
| нет citation | WorldObservations с source verification |

---

## 3. PERCEPTION (Восприятие)

**Файл:** `src/perception/SensorBus.ts`  
**Статус:** ⏳ Phase P1 (в разработке)  
**Строки:** ~65 (базовый), ~200 (полный)  
**Ответственность:** Нормализация всех внешних сигналов в SignalEvent

### Архитектура Сенсоров

```
┌─────────────────────────────────────────────────────────────┐
│                    SENSOR BUS                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  UserSensor  │  │ SystemSensor │  │  RSSSensor   │      │
│  │  (push)      │  │  (pull, 30s) │  │  (pull, 5m)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ FileWatcher  │  │ WebhookSensor│                        │
│  │  (push)      │  │  (push)      │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SignalEvent Normalization                   │  │
│  │   Все входы → SignalEvent { id, type, payload, ... } │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Priority Queue                           │  │
│  │   user_message > system_alert > rss_item > ...       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class SensorBus {
  // Sensor Management
  registerSensor(sensor: Sensor): void
  unregisterSensor(name: string): void
  
  // Signal Ingestion
  ingestUserMessage(text: string): void
  ingestSignal(signal: SignalEvent): void
  
  // Polling
  pollSignals(): SignalEvent[]
  
  // Acknowledgment
  acknowledgeSignal(signalId: string): void
  
  // Curiosity Scoring (для новых сигналов)
  scoreNovelty(signal: SignalEvent): number
}

interface Sensor {
  name: string
  type: 'pull' | 'push'
  pollIntervalMs?: number
  enabled: boolean
  poll(): Promise<unknown>  // для pull
  onData(cb: Function): void  // для push
  adapt(raw: unknown): SignalEvent
}
```

### SignalEvent Structure

```typescript
interface SignalEvent {
  id: string                    // UUID
  type: 'user_message' | 'tool_result' | 'rss_feed' | 'webhook' | 'system_metrics'
  payload: Record<string, any>
  timestamp: Date
  source: string                // sensor name
  priority: 'critical' | 'high' | 'normal' | 'background'
  curiosityScore: number        // novelty × contradiction × goal_relevance
  acknowledged: boolean
}
```

### Из Какого Проекта

- **af-guard-controller** → Voice/Sensor input
- **creature-explores-world** → CmdTool, HttpsTool (входы)
- **she-is-not-alone** → SensorBus (базовый)

### Уроки из Аудита

| Проблема | Решение в Perception |
|----------|---------------------|
| curiosity в вакууме | Curiosity score от реальных данных сенсоров |
| только stdin | 5+ сенсоров (user, system, RSS, file, webhook) |
| нет приоритетов | Priority queue для сигналов |
| нет novelty scoring | scoreNovelty() на основе memory gaps |

---

## 4. COGNITION (Мышление)

**Файл:** `src/autonomy/DriveEngine.ts`  
**Статус:** ✅ Phase R0 Complete  
**Строки:** ~130  
**Ответственность:** 4 операционных drives + initiative evaluation

### 4 Драйва

```
┌─────────────────────────────────────────────────────────────┐
│                   DRIVE ENGINE                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Curiosity   │  │   Closure    │  │  SocialPull  │      │
│  │              │  │              │  │              │      │
│  │ 0.3 +        │  │ 0.2 +        │  │ +0.1 on      │      │
│  │ unknown×0.1  │  │ unresolved×  │  │ interaction  │      │
│  │              │  │ 0.15         │  │ -decay 0.02/h│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐                                           │
│  │   Novelty    │                                           │
│  │              │                                           │
│  │ 0.1 +        │                                           │
│  │ staleness×   │                                           │
│  │ 0.2          │                                           │
│  └──────────────┘                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Initiative Evaluation                         │  │
│  │   score = curiosity×0.4 + closure×0.3 +              │  │
│  │           socialPull×0.2 + novelty×0.1               │  │
│  │   shouldAct = score > 0.5                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class DriveEngine {
  // State Access
  getCurrentState(): DriveState
  
  // Drive Updates
  processSignal(signal: SignalEvent): void
  updateFromMemoryGaps(gaps: MemoryGaps): void
  
  // Initiative Evaluation
  evaluateInitiative(state: DriveState): InitiativeDecision
  
  // Curiosity Computation (Phase P1)
  calculateCuriosity(signal: SignalEvent, memory: MemoryHub): CuriosityScore
}

interface DriveState {
  curiosity: number      // 0.0 - 1.0
  closure: number        // 0.0 - 1.0
  socialPull: number     // 0.0 - 1.0
  novelty: number        // 0.0 - 1.0
}

interface InitiativeDecision {
  shouldAct: boolean
  reason: string
  expectedUtility: number
  driveContributions: DriveState
  timestamp: Date
}
```

### Формулы Драйвов

| Драйв | Формула | Увеличивает | Уменьшает |
|-------|---------|-------------|-----------|
| **Curiosity** | `0.3 + (unknownTopics × 0.1)` | unknown topics в памяти | user предоставляет input |
| **Closure** | `0.2 + (unresolvedQuestions × 0.15)` | unresolved threads | threads resolved |
| **Social Pull** | `current + 0.1 (on interaction) - decay` | user interaction | time without interaction |
| **Novelty** | `0.1 + (staleness × 0.2)` | memory staleness | new episodes |

### Из Какого Проекта

- **creature-explores-world** → Curiosity Engine (прямой наследник)
- **she-is-alone** → Biological Metaphors для drives
- **she-is-not-alone** → Drive Engine (4 drives)
- **she-exists** → Epistemic Aggression → curiosity

### Уроки из Аудита

| Проблема | Решение в Cognition |
|----------|---------------------|
| симуляция эмоций | Drives = operational pressures, не feelings |
| формулы без данных | Phase P1: drives от реальных sensor data |
| нет behavioral impact | Каждый drive меняет scheduling/asking/planning |
| философский код | Concrete formulas с измеримыми метриками |

---

## 5. ACTION (Действие)

**Файл:** `src/tools/ToolRouter.ts`  
**Статус:** ✅ Phase R (web_search, fetch_url), ⏳ Phase P1 (read_file, write_note)  
**Строки:** ~100 (базовый), ~300 (полный)  
**Ответственность:** Router для инструментов с RiskGate integration

### Инструменты

```
┌─────────────────────────────────────────────────────────────┐
│                    TOOL ROUTER                               │
│                                                              │
│  Phase R (Current):                                         │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  web_search  │  │  fetch_url   │                        │
│  │  (low risk)  │  │  (low risk)  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│  Phase P1 (Planned):                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  read_file   │  │  write_note  │  │  system_info │      │
│  │  (medium)    │  │  (low)       │  │  (low)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Phase P2 (Restricted):                                     │
│  ┌──────────────┐                                           │
│  │  run_command │  (high risk, require approval)           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class ToolRouter {
  // Tool Execution
  async execute(toolName: string, input: unknown): Promise<ToolResult>
  
  // Planning (Phase P2)
  async plan(task: Task): Promise<ToolPlan>
  
  // Risk Assessment
  assessRisk(toolName: string, input: unknown): RiskAssessment
}

interface Tool {
  name: string
  description: string
  schema: JSONSchema
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  assessRisk(input: unknown): RiskAssessment
  execute(input: unknown, budget: Budget): Promise<ToolResult>
}

interface ToolResult {
  success: boolean
  data: unknown
  metadata: {
    tokensUsed: number
    latencyMs: number
    source?: string
  }
  error?: string
}
```

### Risk Levels

| Risk Level | Auto-Approve | Timeout | Approval Required |
|------------|--------------|---------|-------------------|
| **Low** | ✅ Yes | N/A | No |
| **Medium** | ⚠️ With log | 5 min | No (notify only) |
| **High** | ❌ No | N/A | Yes (human) |
| **Critical** | ❌ No | N/A | Yes (human + audit) |

### Из Какого Проекта

- **creature-explores-world** → CmdTool, HttpsTool, UserTool
- **self-evolving-agi** → Tool execution
- **she-is-not-alone** → ToolRouter (базовый)

### Уроки из Аудита

| Проблема | Решение в Action |
|----------|------------------|
| root-доступ без sandbox | RiskGate для каждого tool call |
| нет resource limits | Budget tracking (tokens/hour, calls/hour) |
| fork bomb (detached process) | run_command = high risk, require approval |
| нет validation | ResultValidator для каждого tool output |

---

## 6. SAFETY (Безопасность)

**Файл:** `src/safety/SafetyGate.ts`  
**Статус:** ⏳ Phase P0 (в разработке)  
**Строки:** ~100  
**Ответственность:** Allow/Gate/Deny для всех autonomous actions

### Архитектура Безопасности

```
┌─────────────────────────────────────────────────────────────┐
│                    SAFETY LAYER                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 SafetyGate                            │  │
│  │   evaluate(action) → 'allow' | 'gate' | 'deny'       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  RiskGate    │  │   Budget     │  │   Policy     │      │
│  │  (per-action)│  │   Tracker    │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Kill Switch                              │  │
│  │   /stop → immediate halt, no questions asked         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class SafetyGate {
  // Action Evaluation
  async evaluate(action: AutonomousAction): Promise<SafetyDecision>
  
  // Risk Assessment
  assessRisk(action: AutonomousAction): RiskLevel
  
  // Budget Enforcement
  checkBudget(action: AutonomousAction): boolean
}

interface SafetyDecision {
  decision: 'allow' | 'gate' | 'deny'
  reason: string
  requiredApproval?: 'user' | 'supervisor'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface BudgetTracker {
  // Budgets
  tokensPerHour: number
  toolCallsPerHour: number
  networkRequestsPerHour: number
  riskyActionsPerDay: number
  
  // Tracking
  check(action: AutonomousAction): boolean
  consume(action: AutonomousAction): void
  reset(): void
}
```

### Budget Constraints (Default)

```typescript
{
  tokensPerHour: 100000,
  toolCallsPerHour: 50,
  networkRequestsPerHour: 100,
  riskyActionsPerDay: 10,
  maxQuestionsPerHour: 5,
  questionCooldownMinutes: 10
}
```

### Из Какого Проекта

- **self-evolving-ai-new** → ESCAPE LESSONS (fork bomb, RAM exhaustion)
- **self-evolving-agi** → Нет safety gate (урок)
- **creature-explores-world** → Нет sandbox (урок)

### Уроки из Аудита

| Проблема | Решение в Safety |
|----------|------------------|
| fork bomb | Budget Tracker + process limits |
| RAM exhaustion | Resource limits enforced |
| root-доступ | RiskGate с allowlist |
| нет kill switch | /stop команда всегда доступна |

---

## 7. HUMANLOOP (Диалог)

**Файл:** `src/humanloop/QuestionEngine.ts`  
**Статус:** ✅ Phase R0 Complete  
**Строки:** ~180  
**Ответственность:** Question-Answer-Advice lifecycle + Co-Transcendence

### Lifecycle Вопросов

```
┌─────────────────────────────────────────────────────────────┐
│                 QUESTION ENGINE                              │
│                                                              │
│  draft → asked → answered → bound → advice_extracted        │
│                                     ↓                       │
│                              outcome_recorded               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Budget + Cooldown                        │  │
│  │   maxQuestionsPerHour: 5                              │  │
│  │   questionCooldownMinutes: 10                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Co-Transcendence Tracking                   │  │
│  │   SharedFocus { userPosition, agentPosition,          │  │
│  │                 synthesis, impactScore }              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class QuestionEngine {
  // Question Creation
  createQuestion(
    formulation: string,
    topic: string,
    decisionImpact: string,
    fallbackPlan: string,
    urgency: 'low' | 'medium' | 'high'
  ): QuestionCard
  
  // Lifecycle
  askQuestion(questionId: string): boolean
  tryBindAnswer(answerText: string): Promise<AnswerEvent | null>
  
  // Advice Extraction
  extractAdvice(answer: AnswerEvent): AdviceEvent[]
  recordOutcome(outcome: AdviceOutcome): void
  
  // Budget Enforcement
  shouldAskQuestion(driveState: DriveState): boolean
  getPendingCount(): number
}

interface QuestionCard {
  id: string                    // UUID
  formulation: string
  topic: string
  decisionImpact: string        // "Как это решение повлияет на X?"
  fallbackPlan: string          // "Если нет ответа, сделаю Y"
  urgency: 'low' | 'medium' | 'high'
  askedAt: Date
  answeredAt: Date | null
  answerText: string | null
  adviceExtracted: AdviceEvent[] | null
  outcomeRecorded: AdviceOutcome | null
}
```

### Advice Tracking

```typescript
interface AdviceEvent {
  id: string
  questionId: string
  adviceText: string
  accepted: boolean
  impactDelta: number           // Насколько совет изменил решение
  confidenceDelta: number       // Насколько увеличилась уверенность
  timestamp: Date
}

interface AdviceOutcome {
  questionId: string
  realizedUtility: number       // Фактическая польза от совета
  confidenceDelta: number
  recordedAt: Date
}
```

### Co-Transcendence Metrics

| Метрика | Формула | Цель |
|---------|---------|------|
| **Advice Yield** | `sum(impactDelta of accepted advice)` | > 0.3 |
| **Advice Precision** | `accepted / total advice events` | > 0.6 |
| **Decision Lift** | `E[U | with advice] - E[U | without advice]` | > 0.2 |
| **Shared Focus %** | `dialogs with active focus / total dialogs` | > 30% |

### Из Какого Проекта

- **she-is-not-alone** → Question Engine (прямой наследник)
- **she-exists** → Epistemic Aggression → вопросы
- **multi-ai-chat** → Идея мульти-оконного интерфейса

### Уроки из Аудита

| Проблема | Решение в HumanLoop |
|----------|---------------------|
| вопросы без budget | maxQuestionsPerHour + cooldown |
| ответы без binding | question_id для каждого ответа |
| советы без tracking | AdviceEvent с impactDelta |
| нет co-transcendence | SharedFocus tracking |

---

## 8. EVOLUTION (Развитие)

**Файл:** `src/evolution/BehaviorPackManager.ts`  
**Статус:** ⏳ Phase P3 (в разработке)  
**Строки:** ~200  
**Ответственность:** Safe self-improvement через versioned behavior packs

### Pipeline Эволюции

```
┌─────────────────────────────────────────────────────────────┐
│                  EVOLUTION PIPELINE                          │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ GENERATOR│───▶│  CRITIC  │───▶│  REALITY │              │
│  │ creates  │    │ evaluates│    │  tests   │              │
│  │ candidate│    │ risks    │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                                  │                  │
│       │                                  ▼                  │
│       │                           ┌──────────┐              │
│       │                           │  JUDGE   │              │
│       │                           │ compares │              │
│       │                           │ vs base  │              │
│       │                           └──────────┘              │
│       │                                  │                  │
│       ▼                                  ▼                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ HISTORIAN│◀───│ PROMOTE  │◀───│ DECISION │              │
│  │ records  │    │ or       │    │          │              │
│  │ outcome  │    │ ROLLBACK │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class BehaviorPackManager {
  // Pack Management
  getActivePack(): BehaviorPack
  async createVariant(base: BehaviorPack, changes: Changes): Promise<BehaviorPack>
  
  // Evaluation
  async evaluateCandidate(candidate: BehaviorPack): Promise<FitnessScore>
  async compare(candidate: FitnessScore, baseline: FitnessScore): Promise<Comparison>
  
  // Promotion
  async promoteCandidate(candidate: BehaviorPack): Promise<void>
  async rollback(): Promise<void>
}

interface BehaviorPack {
  id: string
  version: string
  parentVersion?: string
  createdAt: Date
  
  // Mutable Components
  prompts: Map<PromptType, string>
  thresholds: InitiativeThresholds
  strategies: StrategyTemplate[]
  
  // Evaluation
  fitness?: FitnessScore
  testResults: TestResult[]
  
  // Status
  status: 'candidate' | 'active' | 'retired'
}

interface FitnessScore {
  verifiedTaskSuccess: number
  verifiedNewCapabilities: number
  tokenCost: number           // negative
  codeBloat: number           // negative
  regressionPenalty: number   // negative
  criticPenalty: number       // negative
  
  total(): number
}
```

### Promotion Criteria

```typescript
function shouldPromote(candidate: FitnessScore, baseline: FitnessScore): boolean {
  return (
    candidate.total() > baseline.total() × 1.05 &&  // >5% improvement
    candidate.regressionPenalty === 0 &&            // no regressions
    candidate.criticPenalty > -0.3                  // critic approved
  );
}
```

### Из Какого Проекта

- **self-evolving-ai-new** → Population evolution, capability transfer
- **self-evolving-agi** → SelfModifier (урок: не код, а behavior)
- **self-improving-ai** → Supervisor pattern

### Уроки из Аудита

| Проблема | Решение в Evolution |
|----------|---------------------|
| self-modification кода | Behavior packs, не код ядра |
| fork bomb | Kernel НЕ self-modifies никогда |
| нет rollback | Auto-rollback на regression |
| нет A/B testing | Candidate vs baseline comparison |

---

## 9. DREAMS (Инкубация)

**Файл:** `src/dreams/SleepOrchestrator.ts`  
**Статус:** ⏳ Phase P4 (в разработке)  
**Строки:** ~150  
**Ответственность:** Offline consolidation, hypothesis generation

### Sleep Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    SLEEP MODE                                │
│                                                              │
│  Trigger: Every 6-24 hours (configurable)                   │
│  Duration: 30-60 minutes max                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Consolidate Episodes                              │  │
│  │     → Extract patterns, remove duplicates             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Generate Hypotheses                               │  │
│  │     → "A связано с B через C"                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Compact Memory                                    │  │
│  │     → 50 episodes → 1 insight                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4. Refresh Self-Model                                │  │
│  │     → Update capabilities, limits, beliefs            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Output: SleepReport { insights, hypotheses, compaction }   │
└─────────────────────────────────────────────────────────────┘
```

### Ключевые Функции

```typescript
class SleepOrchestrator {
  // Sleep Cycle
  async enterSleep(): Promise<void>
  async exitSleep(): Promise<SleepReport>
  
  // Consolidation
  private async consolidate(): Promise<Insight[]>
  private async generateHypotheses(): Promise<Hypothesis[]>
  private async compactMemory(): Promise<CompactionReport>
  private async refreshSelfModel(): Promise<SelfModel>
}

interface SleepReport {
  duration: number              // minutes
  episodesProcessed: number
  insightsGenerated: number
  hypothesesCreated: number
  memoryReduction: number       // % compressed
  artifactsCreated: string[]
}

interface Hypothesis {
  id: string
  formulation: string
  relatedEpisodes: string[]
  confidence: number            // 0.0 - 1.0
  verificationPlan?: string     // Как проверить через tools
  createdAt: Date
}
```

### Правила Сна

| Правило | Обоснование |
|---------|-------------|
| **Сон без артефактов = шум** | Каждая сессия должна произвести ≥1 insight/hypothesis |
| **Никаких автономных действий после сна** | Гипотезы требуют обсуждения с пользователем |
| **Отчёт о сне обязателен** | Пользователь должен видеть, что произошло |
| **Сон не bypass-ит SafetyGate** | Любые изменения проходят через RiskGate |

### Из Какого Проекта

- **she-exists** → DreamLayer (прямой наследник)
- **she-is-alone** → Dream Layer, Incubation Layer
- **self-evolving-agi** → DivergenceExplorer

### Уроки из Аудита

| Проблема | Решение в Dreams |
|----------|------------------|
| сны без контекста | Только реальные логи, не фантазии |
| нет валидации | Гипотезы требуют verification через tools |
| симуляция, не функция | Sleep = offline consolidation, не "эстетика" |
| нет артефактов | Метрика: ≥1 insight/hypothesis за сессию |

---

## 10. METRICS (Наблюдение)

**Файл:** `src/observability/MetricsEngine.ts`  
**Статус:** ⏳ Phase P2 (в разработке)  
**Строки:** ~150  
**Ответственность:** Heartbeat, utility tracking, SLO monitoring

### Observability Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   METRICS ENGINE                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Heartbeat   │  │   Utility    │  │     SLO      │      │
│  │  Publisher   │  │   Tracker    │  │   Monitor    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Incident Logging                         │  │
│  │   Anomalies, errors, near-misses                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Dashboard (Phase P3)                     │  │
│  │   Real-time visualization of all metrics              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Heartbeat Status

```typescript
interface HeartbeatStatus {
  timestamp: Date
  state: 'active' | 'waiting' | 'sleeping' | 'error'
  currentActivity: string
  waitingFor: string | null
  nextAction: string | null
  
  driveState: {
    curiosity: number
    closure: number
    socialPull: number
    novelty: number
  }
  
  pendingQuestionsCount: number
  unresolvedThreadsCount: number
  uptime: number  // milliseconds
}
```

### Utility Metrics

| Метрика | Формула | Цель |
|---------|---------|------|
| **Validated Insights/Day** | `count(episodes where type='reflection' && validated=true)` | > 3 |
| **Useful Actions/Hour** | `count(actions where realizedUtility > 0)` | > 5 |
| **Decision Lift from Advice** | `E[U | with advice] - E[U | without advice]` | > 0.2 |
| **Advice Yield** | `sum(impactDelta of accepted advice)` | > 0.3 |
| **Hallucination Rate** | `count(hallucinations) / count(outputs)` | < 5% |
| **Uptime** | `time_running / total_time` | > 99% |
| **Mean Time To Recovery** | `avg(recovery_time_after_crash)` | < 30s |

### Ключевые Функции

```typescript
class MetricsEngine {
  // Heartbeat
  async publishHeartbeat(): Promise<HeartbeatStatus>
  
  // Utility Tracking
  recordAction(action: AutonomousAction, outcome: Outcome): void
  calculateUtility(action: AutonomousAction, outcome: Outcome): number
  
  // SLO Monitoring
  checkSLOs(): Promise<SLOReport>
  
  // Incident Logging
  logIncident(incident: Incident): void
  getIncidents(): Promise<Incident[]>
}

// U = goal_progress + information_gain + advice_yield + continuity_score 
//     - risk - hallucination_penalty - wasted_compute
function calculateUtility(action: AutonomousAction, outcome: Outcome): number {
  const goalProgress = measureGoalProgress(outcome.goalChanges)
  const informationGain = outcome.validatedUncertaintyReduction
  const adviceYield = outcome.acceptedAdviceImpact
  const continuityScore = outcome.uptimeContribution
  
  const risk = action.riskLevel
  const hallucinationPenalty = outcome.hallucinationCount × 0.5
  const wastedCompute = outcome.tokensUsed / 1000
  
  return (
    goalProgress +
    informationGain +
    adviceYield +
    continuityScore -
    risk -
    hallucinationPenalty -
    wastedCompute
  )
}
```

### Из Какого Проекта

- **she-is-not-alone** → Heartbeat Publisher
- **she-is-alone** → Metrics Tracker
- **self-evolving-ai-new** → Fitness Formula

### Уроки из Аудита

| Проблема | Решение в Metrics |
|----------|-------------------|
| нет utility tracking | ObjectiveLedger с expected/realized |
| нет SLO monitoring | Uptime, error rates, recovery time |
| философские метрики | Concrete formulas с числами |
| нет dashboard | Visualization (Phase P3) |

---

## 📊 Сводная Таблица Всех 10 Модулей

| # | Модуль | Файл | Статус | Строки | Ответственность |
|---|--------|------|--------|--------|-----------------|
| 1 | **KERNEL** | `src/kernel/Kernel.ts` | ✅ R0 | ~280 | Оркестрация, 4 ticks, SingleWriter |
| 2 | **MEMORY** | `src/memory/MemoryHub.ts` | ✅ R0 / ⏳ B | ~150 | 6 уровней памяти, RAG |
| 3 | **PERCEPTION** | `src/perception/SensorBus.ts` | ⏳ P1 | ~200 | 5+ сенсоров, SignalQueue |
| 4 | **COGNITION** | `src/autonomy/DriveEngine.ts` | ✅ R0 | ~130 | 4 drives, initiative |
| 5 | **ACTION** | `src/tools/ToolRouter.ts` | ✅ R / ⏳ P1 | ~300 | 6+ tools, RiskGate |
| 6 | **SAFETY** | `src/safety/SafetyGate.ts` | ⏳ P0 | ~100 | Allow/Gate/Deny, budgets |
| 7 | **HUMANLOOP** | `src/humanloop/QuestionEngine.ts` | ✅ R0 | ~180 | Questions, advice, co-trans |
| 8 | **EVOLUTION** | `src/evolution/BehaviorPackManager.ts` | ⏳ P3 | ~200 | Safe self-improvement |
| 9 | **DREAMS** | `src/dreams/SleepOrchestrator.ts` | ⏳ P4 | ~150 | Offline consolidation |
| 10 | **METRICS** | `src/observability/MetricsEngine.ts` | ⏳ P2 | ~150 | Heartbeat, utility, SLOs |

---

## 🔄 Зависимости Между Модулями

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MODULE DEPENDENCY GRAPH                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   KERNEL     │
                    │   (1)        │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MEMORY     │  │  PERCEPTION  │  │   METRICS    │
│   (2)        │  │   (3)        │  │   (10)       │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       │         ┌───────┴───────┐
       │         │               │
       ▼         ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  COGNITION   │  │    ACTION    │  │    SAFETY    │
│   (4)        │  │    (5)       │  │    (6)       │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  HUMANLOOP   │  │   EVOLUTION  │  │    DREAMS    │
│   (7)        │  │    (8)       │  │    (9)       │
└──────────────┘  └──────────────┘  └──────────────┘

Legend:
  → = "depends on" / "calls"
  KERNEL → все остальные (оркестрирует)
  MEMORY ← COGNITION, HUMANLOOP, METRICS (читают/пишут)
  PERCEPTION → COGNITION (сигналы → drives)
  ACTION → SAFETY (каждое действие через gate)
  EVOLUTION → KERNEL (behavior packs влияют на prompts)
  DREAMS → MEMORY (consolidation)
```

---

## 📈 Phase Roadmap по Модулям

| Phase | Модули | Статус |
|-------|--------|--------|
| **R0** | KERNEL, MEMORY (in-memory), COGNITION, HUMANLOOP | ✅ Complete |
| **R** | ACTION (web_search, fetch_url), METRICS (heartbeat) | ✅ Complete |
| **P0** | SAFETY (SafetyGate, BudgetTracker) | ⏳ In Progress |
| **P1** | PERCEPTION (5+ sensors), ACTION (read_file, write_note) | ⏳ Planned |
| **P2** | METRICS (full utility tracking), HUMANLOOP (co-transcendence) | ⏳ Planned |
| **P3** | EVOLUTION (behavior packs) | ⏳ Planned |
| **P4** | DREAMS (sleep orchestrator) | ⏳ Planned |
| **B** | MEMORY (MongoDB persistence) | ⏳ Planned |

---

## 🎯 Главный Вывод

**10 модулей — это онтология Utopia AGI Engine.**

Каждый модуль:
- Имеет **единую ответственность**
- **Измерим** (строки, статус, метрики)
- **Связан** с другими модулями (dependency graph)
- **Наследует** уроки из 14 старых проектов
- **Реализует** одну из 7 сквозных целей

**Главная цель:** Конвертировать вычисления в валидированный прогресс.

**Как:** Через 10 модулей, работающих как единый двигатель.

---

**Qwen Code, 1 марта 2026 г., 19:30**
