# ПРОЕКТИРУЕМАЯ АРХИТЕКТУРА AGENT 24/7 v2.0

**Дата:** 1 марта 2026 г., 18:45  
**Автор:** Qwen Code Architecture Proposal  
**Статус:** Draft для обсуждения  
**Версия:** 2.0

---

## Аннотация

Эта архитектура — **эволюционный ответ** на проблемы всех 14 старых проектов, проанализированных в `old-projects-audit-2026-03-01-18-30.md`.

**Ключевые принципы:**
1. **Capability-First Core** — только модули с доказанной полезностью
2. **Utility-Gated Proactivity** — каждое действие измеряется по полезности
3. **Serialized Commits, Parallel Execution** — безопасность + производительность
4. **No Mysticism** — drives как operational pressures, не симуляция эмоций
5. **Safety by Design** — gate на всех уровнях

---

## 1. Общая схема системы

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACES                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   CLI (R0)   │  │  Web (R+)    │  │  Mobile (B)  │  │  Voice (B)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Phase R+)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  HTTP: /api/chat/send, /api/chat/answer, /api/status, /api/health   │  │
│  │  WebSocket: ws://localhost:3001/ws (realtime events)                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SENSOR BUS                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ UserMessage  │  │  ToolResult  │  │  RSS Feed    │  │  Webhook     │   │
│  │  Signal      │  │   Signal     │  │   Signal     │  │   Signal     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  Normalize all inputs → SignalEvent { id, type, payload, timestamp }        │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            KERNEL (Stable Core)                               │
│                     "Never self-modifies, ever"                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CLOCKS                                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │ Fast Tick  │  │ Work Tick  │  │ Deep Tick  │  │ Sleep Tick │   │   │
│  │  │   (10s)    │  │   (1m)     │  │   (5m)     │  │   (6-24h)  │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SINGLE WRITER                                    │   │
│  │         All state commits serialized through this lane               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SAFETY GATE (Phase A)                              │   │
│  │         Allow / Gate / Deny for all autonomous actions              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  AUTONOMY    │    │  HUMANLOOP   │    │   MEMORY     │
│   LAYER      │    │    LAYER     │    │    LAYER     │
│              │    │              │    │              │
│ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │
│ │  Drive   │ │    │ │ Question │ │    │ │ Memory   │ │
│ │  Engine  │ │    │ │  Engine  │ │    │ │   Hub    │ │
│ └──────────┘ │    │ └──────────┘ │    │ └──────────┘ │
│ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │
│ │   Self   │ │    │ │ Advice   │ │    │ │   RAG    │ │
│ │  Anchor  │ │    │ │ Extractor│ │    │ │ Retriever│ │
│ └──────────┘ │    │ └──────────┘ │    │ └──────────┘ │
│ ┌──────────┐ │    │ └──────────┘ │    │ ┌──────────┐ │
│ │ Objective│ │    │              │    │ │ Episode  │ │
│ │  Ledger  │ │    │              │    │ │  Store   │ │
│ └──────────┘ │    │              │    │ └──────────┘ │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RESPONSE LAYER                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ResponseGenerator + ToolRouter + LLM Client (Ollama)               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Prompt Catalog (10-12 types):                                              │
│  • tick_router • task_planner • risk_gate • tool_plan                      │
│  • result_validator • memory_synthesizer • human_query_builder             │
│  • advice_integrator • cycle_reflection • hypothesis_lab                   │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  MongoDB (Phase B): episodes, questions, answers, advice, threads   │   │
│  │  In-Memory (Phase R0): All of the above in RAM                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  HeartbeatPublisher + MetricsEngine + Logging                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Outputs:                                                                   │
│  • HeartbeatStatus (every deep tick)                                        │
│  • Utility metrics (expected vs realized)                                   │
│  • Error rates, retry rates, latency                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Модульная структура

### 2.1 Kernel (Стабильное Ядро)

**Файл:** `src/kernel/Kernel.ts`

**Ответственность:**
- Оркестрация всех subsystem
- 4 такта (clocks): fast/work/deep/sleep
- Single Writer для serialized commits
- Safety Gate для autonomous actions

**Почему стабильное:**
- Никогда не self-modifies
- Версионируется отдельно от behavior packs
- Тестируется строго (unit + integration)

**Код (псевдо):**
```typescript
class Kernel {
  private running = false;
  private fastTickTimer: NodeJS.Timeout | null = null;
  private workTickTimer: NodeJS.Timeout | null = null;
  private deepTickTimer: NodeJS.Timeout | null = null;
  private sleepTickTimer: NodeJS.Timeout | null = null;

  private sensorBus: SensorBus;
  private driveEngine: DriveEngine;
  private selfAnchor: SelfAnchor;
  private questionEngine: QuestionEngine;
  private memoryHub: MemoryHub;
  private singleWriter: SingleWriter;
  private safetyGate: SafetyGate;        // Phase A
  private objectiveLedger: ObjectiveLedger; // Phase A
  private responseGenerator: ResponseGenerator;
  private toolRouter: ToolRouter;

  async start(): Promise<void> {
    this.running = true;
    await this.memoryHub.initialize();
    await this.singleWriter.initialize();
    await this.sensorBus.start();
    this.startClocks();
  }

  private startClocks(): void {
    this.fastTickTimer = setInterval(() => this.fastTick(), 10_000);
    this.workTickTimer = setInterval(() => this.workTick(), 60_000);
    this.deepTickTimer = setInterval(() => this.deepTick(), 300_000);
    this.sleepTickTimer = setInterval(() => this.sleepTick(), 21_600_000); // 6h
  }

  private async fastTick(): Promise<void> {
    // 1. Poll signals
    const signals = this.sensorBus.pollSignals();
    
    // 2. Process signals
    for (const signal of signals) {
      await this.handleSignal(signal);
    }

    // 3. Evaluate initiative
    const driveState = this.driveEngine.getCurrentState();
    const initiative = this.driveEngine.evaluateInitiative(driveState);

    // 4. Safety gate check (Phase A)
    if (initiative.shouldAct) {
      const gateDecision = await this.safetyGate.evaluate({
        type: 'proactive_action',
        expectedUtility: initiative.expectedUtility,
        risk: 'low'
      });

      if (gateDecision === 'allow') {
        await this.executeProactiveAction(initiative);
      }
    }
  }

  private async workTick(): Promise<void> {
    // 1. Process unresolved threads
    const threads = await this.memoryHub.getUnresolvedThreads();
    
    // 2. Update drives from memory gaps
    const gaps = await this.memoryHub.getMemoryGaps();
    this.driveEngine.updateFromMemoryGaps(gaps);

    // 3. Execute queued tasks (parallel, serialized commit)
    await this.executeWorkQueue();
  }

  private async deepTick(): Promise<void> {
    // 1. Synthesize insights
    const insights = await this.synthesizeInsights();

    // 2. Check if should ask question
    const driveState = this.driveEngine.getCurrentState();
    if (this.questionEngine.shouldAskQuestion(driveState)) {
      await this.askAutogeneratedQuestion();
    }

    // 3. Log heartbeat
    this.publishHeartbeat();
  }

  private async sleepTick(): Promise<void> {
    // Offline consolidation (batch processing)
    await this.consolidateMemory();
    await this.recalibrateSelfModel();
  }
}
```

---

### 2.2 SensorBus (Нормализация Входов)

**Файл:** `src/perception/SensorBus.ts`

**Ответственность:**
- Приём всех внешних сигналов
- Нормализация в `SignalEvent`
- Acknowledge/timeout логика

**Сигналы:**
```typescript
interface SignalEvent {
  id: string;                    // UUID
  type: 'user_message' | 'tool_result' | 'rss_feed' | 'webhook';
  payload: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
}
```

**Код (псевдо):**
```typescript
class SensorBus {
  private signalQueue: SignalEvent[] = [];
  private listeners: Set<(signal: SignalEvent) => void> = new Set();

  ingestUserMessage(text: string): void {
    const signal: SignalEvent = {
      id: crypto.randomUUID(),
      type: 'user_message',
      payload: { text },
      timestamp: new Date(),
      acknowledged: false
    };
    this.signalQueue.push(signal);
    this.emit('signal', signal);
  }

  pollSignals(): SignalEvent[] {
    const signals = this.signalQueue.slice();
    this.signalQueue = [];
    return signals;
  }

  acknowledgeSignal(signalId: string): void {
    const signal = this.signalQueue.find(s => s.id === signalId);
    if (signal) {
      signal.acknowledged = true;
    }
  }
}
```

---

### 2.3 DriveEngine (Операционные Драйвы)

**Файл:** `src/autonomy/DriveEngine.ts`

**Ответственность:**
- 4 drives: curiosity, closure, socialPull, novelty
- Формулы (не метафоры!)
- Initiative evaluation

**Формулы:**
```typescript
// Curiosity: жажда неизвестного
curiosity = base(0.3) + (unknownTopics × 0.1)
unknownTopics = max(0, 5 - uniqueTopicsInRecent50)

// Closure: жажда завершённости
closure = base(0.2) + (unresolvedQuestions × 0.15)
unresolvedQuestions = count(unresolvedThreads)

// Social Pull: жажда взаимодействия
socialPull = current + 0.1 (on user interaction)
socialPull = current - (hoursSinceInteraction × 0.02) (decay)

// Novelty: жажда нового
novelty = base(0.1) + (staleness × 0.2)
staleness = min(1.0, hoursSinceLastEpisode / 24)
```

**Initiative Decision:**
```typescript
interface InitiativeDecision {
  shouldAct: boolean;
  reason: string;
  expectedUtility: number;
  driveContributions: {
    curiosity: number;
    closure: number;
    socialPull: number;
    novelty: number;
  };
  timestamp: Date;
}

function evaluateInitiative(state: DriveState): InitiativeDecision {
  const score =
    (state.curiosity × 0.4) +
    (state.closure × 0.3) +
    (state.socialPull × 0.2) +
    (state.novelty × 0.1);

  const threshold = 0.5;
  const shouldAct = score > threshold;

  return {
    shouldAct,
    reason: shouldAct ? `${getDominantDrive(state)} exceeded threshold` : '',
    expectedUtility: shouldAct ? score - threshold : 0,
    driveContributions: state,
    timestamp: new Date()
  };
}
```

---

### 2.4 QuestionEngine (Вопрос-Ответ-Advice)

**Файл:** `src/humanloop/QuestionEngine.ts`

**Ответственность:**
- Lifecycle вопросов (asked → answered → bound → outcome)
- ID binding для ответов
- Advice extraction
- Outcome tracking

**Lifecycle:**
```
QuestionCard {
  id: UUID
  formulation: string
  topic: string
  decisionImpact: string
  fallbackPlan: string
  urgency: 'low' | 'medium' | 'high'
  askedAt: Date
  answeredAt: Date | null
  answerText: string | null
  adviceExtracted: AdviceEvent[] | null
  outcomeRecorded: AdviceOutcome | null
}
```

**Budget + Cooldown:**
```typescript
function shouldAskQuestion(driveState: DriveState): boolean {
  // Check budget
  if (questionsAskedThisHour >= maxQuestionsPerHour) {
    return false;
  }

  // Check cooldown
  if (minutesSinceLastQuestion < cooldownMinutes) {
    return false;
  }

  // Check drives
  const askScore = (driveState.socialPull × 0.6) + (driveState.curiosity × 0.4);
  return askScore > 0.5;
}
```

---

### 2.5 MemoryHub (Память + RAG)

**Файл:** `src/memory/MemoryHub.ts`

**Ответственность:**
- Episodes (user_message, agent_response, reflection, tool_use)
- Threads (unresolved → resolved)
- RAG retrieval (MongoDB или in-memory)
- Gap analysis

**Collections (Phase B):**
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
  answerText: string | null
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
  confidenceDelta: number
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
```

**Gap Analysis:**
```typescript
async function getMemoryGaps(): Promise<MemoryGaps> {
  const recentEpisodes = await this.getRecentEpisodes(50);
  const uniqueTopics = new Set(recentEpisodes.map(e => e.metadata?.topic));

  const lastEpisode = await this.getLastEpisode();
  const hoursSinceLast = lastEpisode
    ? (Date.now() - lastEpisode.timestamp.getTime()) / (1000 × 60 × 60)
    : 24;

  const unresolvedThreads = await this.getUnresolvedThreads();

  return {
    unknownTopics: max(0, 5 - uniqueTopics.size),
    unresolvedQuestions: unresolvedThreads.length,
    staleness: min(1.0, hoursSinceLast / 24)
  };
}
```

---

### 2.6 SingleWriter (Сериализация Состояния)

**Файл:** `src/kernel/SingleWriter.ts`

**Ответственность:**
- Serialized commits для global state
- Queue processing
- Emit events для observability

**Код:**
```typescript
interface StateCommit {
  type: 'initiative_decision' | 'question_asked' | 'answer_received' | 
        'advice_extracted' | 'thread_resolved' | 'episode_recorded';
  data: any;
  timestamp: Date;
}

class SingleWriter {
  private queue: StateCommit[] = [];
  private processing = false;

  async commit(commit: StateCommit): Promise<void> {
    this.queue.push(commit);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const commit = this.queue.shift()!;
      await this.applyCommit(commit);
      this.emit('commit', commit);
    }

    this.processing = false;
  }

  private async applyCommit(commit: StateCommit): Promise<void> {
    // Atomic state update
    switch (commit.type) {
      case 'initiative_decision':
        this.state.lastInitiative = commit.data;
        break;
      case 'question_asked':
        this.state.pendingQuestions.push(commit.data);
        break;
      // ... etc
    }
  }
}
```

---

### 2.7 SafetyGate (Фаза A)

**Файл:** `src/safety/SafetyGate.ts`

**Ответственность:**
- Allow / Gate / Deny для autonomous actions
- Risk evaluation
- Resource limits

**Decision:**
```typescript
interface SafetyDecision {
  decision: 'allow' | 'gate' | 'deny';
  reason: string;
  requiredApproval?: 'user' | 'supervisor';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

class SafetyGate {
  async evaluate(action: AutonomousAction): Promise<SafetyDecision> {
    // Check resource limits
    if (action.resourceUsage.cpu > this.limits.maxCpu) {
      return { decision: 'deny', reason: 'CPU limit exceeded', riskLevel: 'high' };
    }

    // Check risk profile
    if (action.risk === 'critical') {
      return { 
        decision: 'gate', 
        reason: 'Critical action requires approval',
        requiredApproval: 'user',
        riskLevel: 'critical'
      };
    }

    // Check expected utility
    if (action.expectedUtility < this.thresholds.minUtility) {
      return { decision: 'deny', reason: 'Utility too low', riskLevel: 'low' };
    }

    return { decision: 'allow', reason: 'Passed all checks', riskLevel: 'low' };
  }
}
```

---

### 2.8 ObjectiveLedger (Утилита, Фаза A)

**Файл:** `src/metrics/ObjectiveLedger.ts`

**Ответственность:**
- Track expected vs realized utility
- Fitness formula для evolution (Phase C)

**Utility Formula:**
```typescript
interface ObjectiveLedger {
  expectedUtility: number;    // Before action
  realizedUtility: number | null;  // After action
  utilityGap: number | null;  // expected - realized
}

// U = goal_progress + information_gain + advice_yield + continuity_score 
//     - risk - hallucination_penalty - wasted_compute

function calculateUtility(action: AutonomousAction, outcome: Outcome): number {
  const goalProgress = measureGoalProgress(outcome.goalChanges);
  const informationGain = outcome.validatedUncertaintyReduction;
  const adviceYield = outcome.acceptedAdviceImpact;
  const continuityScore = outcome.uptimeContribution;
  
  const risk = action.riskLevel;
  const hallucinationPenalty = outcome.hallucinationCount × 0.5;
  const wastedCompute = outcome.tokensUsed / 1000;

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

---

### 2.9 ResponseGenerator + LLM Client

**Файл:** `src/response/ResponseGenerator.ts`

**Ответственность:**
- Генерация ответов (user messages, proactive, questions)
- Tool planning
- Prompt routing

**Prompt Catalog (10-12 типов):**
```
Tier A (mandatory):
  • tick_router — choose next lane and urgency
  • task_planner — convert intent to task graph
  • risk_gate — evaluate action risk
  • tool_plan — select tool sequence
  • result_validator — verify outputs
  • memory_synthesizer — compress to memory
  • human_query_builder — formulate question
  • advice_integrator — transform advice to plan deltas
  • cycle_reflection — extract lessons

Tier B (goal-dependent):
  • hypothesis_lab — generate R&D hypotheses
  • signal_radar — detect weak signals
  • backlog_reducer — collapse stale threads

Tier C (batch/periodic):
  • sleep_consolidator — offline log consolidation
  • self_model_refresh — recalibrate capabilities
```

---

### 2.10 ToolRouter (Инструменты)

**Файл:** `src/tools/ToolRouter.ts`

**Ответственность:**
- Router для инструментов
- Safety gate integration
- Result validation

**Инструменты (Phase R+):**
```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute: (input: any) => Promise<ToolResult>;
  riskLevel: 'low' | 'medium' | 'high';
}

class ToolRouter {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // Phase R tools
    this.tools.set('web_search', new WebSearchTool());
    this.tools.set('fetch_url', new FetchUrlTool());
    this.tools.set('read_file', new ReadFileTool());
    
    // Phase A+ tools (gated)
    // this.tools.set('run_command', new RunCommandTool()); // Gated!
  }

  async execute(toolName: string, input: any): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // Safety gate check
    const gateDecision = await this.safetyGate.evaluate({
      type: 'tool_execution',
      toolName,
      input,
      risk: tool.riskLevel
    });

    if (gateDecision.decision === 'deny') {
      throw new Error(`Tool execution denied: ${gateDecision.reason}`);
    }

    return await tool.execute(input);
  }
}
```

---

## 3. Поток Данных

### 3.1 User Message Flow

```
User types message
    ↓
SensorBus.ingestUserMessage(text)
    ↓
SignalEvent created
    ↓
Kernel.handleSignal(signal)
    ↓
┌─────────────────────────────────────────┐
│ 1. Record in MemoryHub                  │
│ 2. Update DriveEngine (social pull ↑)   │
│ 3. Check QuestionEngine for binding     │
│ 4. Generate response via LLM            │
│ 5. Safety gate check (Phase A)          │
│ 6. Record response in MemoryHub         │
└─────────────────────────────────────────┘
    ↓
SingleWriter.commit()
    ↓
State updated → Heartbeat published
```

### 3.2 Initiative Flow

```
Fast Tick (10s)
    ↓
DriveEngine.getCurrentState()
    ↓
DriveEngine.evaluateInitiative(driveState)
    ↓
InitiativeDecision { shouldAct, expectedUtility, reason }
    ↓
SafetyGate.evaluate({ type: 'proactive_action', ... })
    ↓
if decision === 'allow':
    ↓
    ResponseGenerator.generateProactiveMessage()
    ↓
    SingleWriter.commit()
    ↓
    Send to user
```

### 3.3 Question-Answer-Advice Flow

```
Deep Tick (5m)
    ↓
QuestionEngine.shouldAskQuestion(driveState)
    ↓
if yes:
    ↓
    ResponseGenerator.generateAutonomousQuestion()
    ↓
    QuestionEngine.createQuestion()
    ↓
    QuestionEngine.askQuestion()
    ↓
    SingleWriter.commit('question_asked')
    ↓
    Send to user

User answers
    ↓
QuestionEngine.tryBindAnswer(answerText)
    ↓
AnswerEvent { questionId, text, timestamp }
    ↓
QuestionEngine.extractAdvice(answerText)
    ↓
AdviceEvent { questionId, adviceText, accepted, impactDelta }
    ↓
SingleWriter.commit('advice_extracted')
    ↓
(Later) QuestionEngine.recordOutcome()
    ↓
AdviceOutcome { questionId, realizedUtility, confidenceDelta }
```

---

## 4. Phase Roadmap

### Phase R0 (Текущая)

**Статус:** ✅ Complete

**Компоненты:**
- Kernel (3 ticks: fast/work/deep)
- SensorBus (stdin/stdout)
- DriveEngine (4 drives)
- QuestionEngine (lifecycle)
- MemoryHub (in-memory)
- SingleWriter (serialized commits)
- ResponseGenerator (Ollama)

**Не хватает:**
- LLM integration (mock only)
- Tool execution
- MongoDB persistence
- HTTP/WebSocket API
- Safety Gate
- Objective Ledger

### Phase R (Следующая)

**Статус:** 🔄 In Progress

**Компоненты:**
- LLM Client (Ollama integration)
- ToolRouter (web_search, fetch_url, read_file)
- Prompt Catalog (10-12 types)
- HTTP API (/api/chat/send, /api/status, /api/health)
- WebSocket Server (realtime events)

**Критерии готовности:**
- [ ] Agent генерирует ответы через LLM
- [ ] Agent выполняет инструменты
- [ ] Agent отправляет proactive messages
- [ ] Agent задаёт autogenerated questions

### Phase A (Safety + Utility)

**Статус:** 📋 Planned

**Компоненты:**
- SafetyGate (allow/gate/deny)
- ObjectiveLedger (expected vs realized utility)
- Risk Profile (capabilities, limits, blind spots)
- Resource Limits (CPU, RAM, process count)

**Критерии готовности:**
- [ ] Все autonomous actions проходят через SafetyGate
- [ ] Каждая action логирует expected utility
- [ ] Каждая action измеряет realized utility
- [ ] Resource limits enforced

### Phase B (Persistence + Reliability)

**Статус:** 📋 Planned

**Компоненты:**
- MongoDB Adapter (episodes, questions, answers, advice, threads)
- RAG Retriever (MongoDB similarity search)
- Error Handling (retry, circuit breaker, dead-letter queue)
- Watchdog (auto-restart on crash)

**Критерии готовности:**
- [ ] Все данные сохраняются в MongoDB
- [ ] RAG retrieval работает
- [ ] Agent восстанавливается после crash
- [ ] Error rates < 5%

### Phase C (Evolution)

**Статус:** 📋 Future

**Компоненты:**
- BehaviorPacks (versioned prompts)
- A/B Testing (candidate vs promoted)
- Capability Transfer (horizontal gene transfer)
- RegressionGuard (auto-rollback on regression)

**Критерии готовности:**
- [ ] Behavior packs versioned
- [ ] A/B testing работает
- [ ] Evolution через отбор, не rewrite
- [ ] No regressions без rollback

---

## 5. Отличия от Старых Проектов

| Проблема | Старые Проекты | Текущая Архитектура |
|----------|----------------|---------------------|
| **Слишком много модулей** | she-exists (9 слоёв), she-is-alone (11 directories) | 6 core modules в Capability-First Core |
| **Нет safety gate** | self-evolving-ai-new (fork bomb) | SafetyGate на всех autonomous actions |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | ObjectiveLedger с expected/realized |
| **JavaScript без типов** | she-is-not-alone | TypeScript строго |
| **Mock данные** | multi-ai-chat | Реальная LLM + Tools |
| **Философский код** | PROJECT_VISION_LOG_WITH_AI.txt (11903 строки) | Concrete types + formulas |
| **Self-modification без limits** | self-evolving-agi | Behavior packs, не код |
| **Нет persistence** | creature-explores-world | MongoDB (Phase B) |
| **Бесконечные циклы** | self-improving-ai supervisor | Max iterations + cooldown |

---

## 6. Метрики Успеха

### Операционные

| Метрика | Цель | Измерение |
|---------|------|-----------|
| **Uptime** | > 99% (24/7) | Watchdog tracking |
| **Useful Actions/Hour** | > 5 | ObjectiveLedger |
| **Validated Insights/Day** | > 3 | MemoryHub.episodes |
| **Hallucination Rate** | < 5% | ResultValidator |
| **Retry Rate** | < 10% | ToolRouter |
| **Mean Time To Recovery** | < 30s | Watchdog |

### Human Leverage

| Метрика | Цель | Измерение |
|---------|------|-----------|
| **Questions/Hour** | < 5 (budget) | QuestionEngine |
| **Advice Yield** | > 0.3 | AdviceEvent.impactDelta |
| **Advice Precision** | > 0.6 | accepted / total |
| **Decision Lift from Advice** | > 0.2 | ObjectiveLedger |

### Evolution (Phase C)

| Метрика | Цель | Измерение |
|---------|------|-----------|
| **% Strategies Promoted** | > 20% | BehaviorPack.promotionStatus |
| **Capability Transfer Rate** | > 2/week | CapabilityRegistry |
| **Regression Rate** | < 5% | RegressionGuard |

---

## 7. Рекомендации по Реализации

### 7.1 Приоритеты (P0 → P3)

**P0 (Немедленно):**
1. LLM Client integration (Ollama)
2. ToolRouter (web_search, fetch_url)
3. SafetyGate (basic allow/deny)

**P1 (Следующая итерация):**
1. HTTP API (/api/chat/send, /api/status)
2. WebSocket Server (realtime events)
3. MongoDB persistence

**P2 (Phase A):**
1. ObjectiveLedger (utility tracking)
2. Risk Profile (capabilities, limits)
3. Resource Limits (CPU, RAM)

**P3 (Phase C):**
1. BehaviorPacks (versioned prompts)
2. A/B Testing
3. Capability Transfer

### 7.2 Антипаттерны (Чего Избегать)

| Антипаттерн | Из Какого Проекта | Как Избежать |
|-------------|-------------------|--------------|
| **Слишком много модулей** | she-exists (9 слоёв) | Держать <10 файлов в src/ |
| **Нет safety gate** | self-evolving-ai-new | SafetyGate на всех actions |
| **Философский код** | PROJECT_VISION_LOG_WITH_AI.txt | Concrete types + formulas |
| **Mock данные** | multi-ai-chat | Реальная LLM integration |
| **JavaScript без типов** | she-is-not-alone | TypeScript строго |
| **Нет utility tracking** | Все кроме self-evolving-ai-new | ObjectiveLedger |
| **Self-modification без limits** | self-evolving-agi | Behavior packs, не код |

---

## 8. Заключение

Эта архитектура — **прямой результат аудита 14 старых проектов**.

**Унаследовано:**
- Kernel, DriveEngine, QuestionEngine, MemoryHub, SingleWriter от she-is-not-alone
- DreamLayer → incubation queue от she-exists
- Biological metaphors для drives от she-is-alone
- Safety lessons от self-evolving-ai-new (fork bomb)
- Utility tracking от self-evolving-ai-new (fitness formula)

**Улучшено:**
- JavaScript → TypeScript
- Mock → Real LLM + Tools
- No safety → SafetyGate на всех уровнях
- No utility → ObjectiveLedger
- Too many modules → Capability-First Core (6 modules)

**Готово к:**
- Phase R: LLM + Tools + Proactive Messaging
- Phase A: Safety Gate + Utility Tracking
- Phase B: MongoDB + HTTP API + Reliability
- Phase C: Behavior Evolution + A/B Testing

---

**Статус:** Draft для обсуждения. Готов к реализации Phase R.
