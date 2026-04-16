# Agent Loop MVP

Минимальная петля, где цель подаётся на каждом шаге, а система выбирает действие.
Живость — эмерджентное свойство. Спека описывает только механику.

---

## 1. Core Loop

```python
while not goal_achieved():
    context = gather_input()          # goal + state + current_situation
    action = llm_decide(context)      # один вызов
    result = execute(action)          # tool или noop
    state = update(state, action, result)
```

Один шаг = один вызов LLM = одно действие.
Петля останавливается по внешнему условию или по лимиту шагов.

## 2. State

Единая память между шагами.

```json
{
  "goal_progress": "что уже сделано к цели",
  "working_memory": "ключевые факты для следующего шага",
  "last_actions": ["action_1", "action_2"]
}
```

- `goal_progress` — строка, свободная форма. Что система считает достигнутым.
- `working_memory` — строка. Контекст для следующего решения.
- `last_actions` — последние 3 действия. Дешёвая замена history.

State обновляется один раз за шаг, после получения result.

## 3. Input / Output

### Input (prompt для LLM)

```
Goal: {goal.description}
State: {state.working_memory}
Progress: {state.goal_progress}
Recent actions: {state.last_actions}
Current situation: {user_input + tool_results + current_time}
Available tools: {tool_names_with_descriptions}

Respond with JSON.
```

### Output (JSON от LLM)

```json
{
  "thought": "одно предложение — почему это действие",
  "action": {
    "tool": "tool_name",
    "args": {}
  },
  "memory_update": "что запомнить для следующего шага"
}
```

- `thought` — краткое обоснование, не chain-of-thought
- `action.tool` может быть `"noop"` если действие не нужно
- `memory_update` заменяет `working_memory` в state

## 4. Execution Rules

| Ситуация | Реакция |
|----------|---------|
| LLM вернул невалидный JSON | Retry с тем же контекстом (max 2) |
| Tool упал с ошибкой | Result содержит ошибку, loop продолжается |
| Достигнут лимит шагов | Stop (default: 10) |
| Goal achieved | Stop |

### Goal Check

Внешняя функция. Получает `state` и последний `result`. Возвращает `true | false`.

```typescript
type GoalCheck = (state: State, result: ToolResult) => boolean;
```

Пример: для цели "ответь пользователю" — проверить, что tool `respond_to_user` вернул `delivered: true`.

---

## Tools (MVP набор)

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

## Что здесь НЕТ (и почему)

- **Нет `self` / `identity`** — агентность либо возникнет из петли, либо нет
- **Нет `sensors[]` с метаданными** — LLM лучше понимает текст, чем JSON-обёртки
- **Нет `facts` / `plan`** — `working_memory` покрывает оба случая
- **Нет философии в спеке** — "живость" проверяется наблюдением, не описанием
