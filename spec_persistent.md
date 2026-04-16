# Agent Loop — Persistent Interactive Mode

Агент-ассистент, который живёт постоянно и реагирует на ввод пользователя в реальном времени.
Основан на MVP, но с добавлением интерактивности и многошаговой памяти.

---

## 1. Core Loop — Hybrid Heartbeat

```typescript
setInterval(async () => {
  const messages = input.drain();  // Получить новые сообщения из stdin
  const hasPending = state.pending.length > 0;
  
  if (messages.length === 0 && !hasPending) {
    idleTicks++;
    if (idleTicks > MAX_IDLE_TICKS) return;  // Пропустить тик
  } else {
    idleTicks = 0;
  }
  
  const output = await tick(state, messages);
  state = updateState(state, output);
}, TICK_INTERVAL_MS);
```

### Отличия от MVP:

- **Бесконечный цикл** — агент не останавливается по достижению цели, работает пока не получит `exit`
- **Heartbeat на таймере** — просыпается каждые N секунд (default: 5000ms)
- **Idle detection** — пропускает тики, если нет ввода и нет pending задач
- **Асинхронный ввод** — stdin буферизируется в `InputBuffer`, дренится в начале тика

---

## 2. State — Extended Memory

```json
{
  "goal_progress": "что уже сделано к цели",
  "working_memory": "ключевые факты для следующего шага",
  "pending": "что нужно сделать на следующем шаге",
  "last_actions": ["action_1", "action_2", "action_3"]
}
```

### Новое поле: `pending`

**Зачем:** В интерактивном режиме между тиками может пройти время. Если агент прочитал файл, но ещё не ответил пользователю, он должен "запомнить", что ответ ещё не дан.

**Пример:**
```
Tick 1: user asks "what's in notes.md?"
  → action: read_file("notes.md")
  → pending_update: "need to respond with file contents"

Tick 2: no new input, but pending = "need to respond..."
  → action: respond_to_user("Here's the content: ...")
  → pending_update: ""
```

Без `pending` агент на втором тике сделал бы `noop`, забыв про незавершённую задачу.

---

## 3. Input / Output

### Input (prompt для LLM)

```
Goal: {PERSISTENT_GOAL}

State:
  Progress: {state.goal_progress}
  Memory: {state.working_memory}
  Pending: {state.pending}
  Recent actions: {state.last_actions}

Last action: {last_action_name}
Result: {last_result_data}

Current situation:
  Time: {ISO timestamp}
  New user messages:
    - "message 1"
    - "message 2"
  (or "No new user messages.")

Available tools:
  - respond_to_user: Send a message to the user
  - read_file: Read file contents
  - write_file: Write content to a file
  - noop: Do nothing (ONLY when there is genuinely nothing to do)

IMPORTANT: If a user asked a question and you have the answer, you MUST call respond_to_user.

JSON format:
{
  "thought": "one sentence why",
  "action": { "tool": "tool_name", "args": {} },
  "memory_update": "key facts to remember",
  "pending_update": "what still needs to be done, or empty string if nothing"
}
```

### Output (JSON от LLM)

```json
{
  "thought": "одно предложение — почему это действие",
  "action": {
    "tool": "tool_name",
    "args": {}
  },
  "memory_update": "что запомнить для следующего шага",
  "pending_update": "что ещё нужно сделать (или пустая строка)"
}
```

**Новое поле:** `pending_update`
- Если `null` — не менять `state.pending`
- Если строка (даже пустая) — заменить `state.pending`

---

## 4. Execution Rules

| Ситуация | Реакция |
|----------|---------|
| LLM вернул невалидный JSON | Retry с тем же контекстом (max 3) |
| Tool упал с ошибкой | Result содержит ошибку, loop продолжается |
| Нет ввода и нет pending | Увеличить `idleTicks`, пропустить тик если > MAX_IDLE_TICKS |
| Есть ввод или pending | Сбросить `idleTicks`, выполнить тик |
| Пользователь ввёл "exit" | Остановить петлю, завершить процесс |

### Goal — Persistent Assistant

```typescript
const GOAL =
  "You are a persistent assistant. Help the user with whatever they ask. " +
  "When the user asks something, you MUST eventually respond to them using respond_to_user. " +
  "Reading a file is not a response — you must ALSO call respond_to_user with the answer. " +
  "If there is truly nothing to do and no pending questions, use noop.";
```

**Отличие от MVP:** Нет `GoalCheck` функции. Агент не останавливается по достижению цели — он постоянный.

---

## 5. Input Buffer — Async stdin

```typescript
class InputBuffer extends EventEmitter {
  private buffer: string[] = [];
  
  constructor() {
    readline.on("line", (line) => {
      this.buffer.push(line.trim());
      this.emit("input", line);
    });
  }
  
  drain(): string[] {
    const messages = [...this.buffer];
    this.buffer = [];
    return messages;
  }
}
```

**Зачем:** В Node.js `stdin` асинхронный. Пользователь может ввести сообщение в любой момент, даже пока агент думает. `InputBuffer` накапливает все строки и отдаёт их пачкой в начале следующего тика.

---

## 6. Tools (те же, что в MVP)

```typescript
const tools = {
  respond_to_user: {
    description: "Send a message to the user",
    args: { text: "string" },
  },
  read_file: {
    description: "Read file contents",
    args: { path: "string" },
  },
  write_file: {
    description: "Write content to a file",
    args: { path: "string", content: "string" },
  },
};
```

---

## 7. Config (Environment Variables)

```bash
OLLAMA_MODEL=qwen3.5:4b-q4_K_M    # Модель LLM
OLLAMA_HOST=http://127.0.0.1:11434  # Адрес Ollama
TICK_INTERVAL=5000                  # Интервал heartbeat (ms)
MAX_IDLE=3                          # Сколько пустых тиков пропустить
```

---

## Что здесь ЕСТЬ (в отличие от MVP)

- **Persistent goal** — агент не завершается, работает постоянно
- **`pending` в state** — для многошаговых задач между тиками
- **Heartbeat на таймере** — вместо простого `while` цикла
- **Idle detection** — экономия вызовов LLM, когда нечего делать
- **Async stdin buffer** — для интерактивного ввода в реальном времени
- **Exit command** — явная команда для остановки

---

## Философия

MVP был про "одна цель → выполнить → остановиться".

Persistent Interactive про "живи постоянно, помогай пользователю, реагируй на запросы".

Это не усложнение ради усложнения — это минимальные изменения, чтобы агент мог работать как интерактивный ассистент в терминале, а не как одноразовый скрипт.
