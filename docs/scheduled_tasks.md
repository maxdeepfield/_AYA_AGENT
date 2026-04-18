# Scheduled Tasks Feature

## Что добавлено

Агент теперь может планировать повторяющиеся задачи (например, "давай новости каждые 10 минут").

## Новые инструменты

### 1. `schedule_task`

Запланировать повторяющуюся задачу.

```json
{
  "tool": "schedule_task",
  "args": {
    "task": "fetch news and report",
    "interval_minutes": 10
  }
}
```

**Возвращает:**
```json
{
  "task_id": "task_1234567890",
  "task": "fetch news and report",
  "interval_minutes": 10,
  "next_execution": "2026-04-18T19:00:00.000Z"
}
```

### 2. `list_scheduled_tasks`

Показать все запланированные задачи.

```json
{
  "tool": "list_scheduled_tasks",
  "args": {}
}
```

**Возвращает:**
```json
{
  "tasks": [
    {
      "id": "task_1234567890",
      "task": "fetch news and report",
      "interval_minutes": 10,
      "next_execution": "2026-04-18T19:00:00.000Z"
    }
  ]
}
```

### 3. `cancel_scheduled_task`

Отменить запланированную задачу.

```json
{
  "tool": "cancel_scheduled_task",
  "args": {
    "task_id": "task_1234567890"
  }
}
```

## Интеграция в main.ts

### 1. Обновить State

```typescript
let state: State = {
  // ... existing fields
  scheduled_tasks: [],
};

setScheduledTasksRef(state.scheduled_tasks);
```

### 2. Добавить проверку в heartbeat

```typescript
const heartbeat = async () => {
  // ... existing code
  
  // Check scheduled tasks
  const now = Date.now();
  for (const task of state.scheduled_tasks) {
    if (now >= task.next_execution) {
      // Add task to pending
      if (!state.pending || state.pending === MISSION) {
        state.pending = task.task;
      }
      
      // Update next execution
      task.last_executed = now;
      task.next_execution = now + task.interval_minutes * 60 * 1000;
      
      ui.log(`{yellow-fg}⏰ Scheduled task triggered: ${task.task}{/yellow-fg}`);
    }
  }
  
  // ... rest of heartbeat
};
```

### 3. Сохранять scheduled_tasks в БД

```typescript
await upsertState({
  mission_progress: state.mission_progress,
  working_memory: state.working_memory,
  pending: state.pending,
  chat_history: state.chat_history,
  scheduled_tasks: state.scheduled_tasks, // Add this
});
```

## Пример использования

**Пользователь:** "Давай мне новости каждые 10 минут"

**Агент:**
```json
{
  "thought": "User wants news every 10 minutes, I'll schedule a recurring task",
  "action": {
    "tool": "schedule_task",
    "args": {
      "task": "fetch news using web_search and respond_to_user with summary",
      "interval_minutes": 10
    }
  },
  "pending_update": ""
}
```

**Через 10 минут:**
- Heartbeat видит `task.next_execution <= now`
- Устанавливает `state.pending = task.task`
- Агент выполняет задачу (web_search + respond_to_user)
- Задача переносится на следующие 10 минут

## Преимущества

✅ Агент может быть проактивным по расписанию  
✅ Пользователь может отменить задачи  
✅ Задачи сохраняются в БД (переживают перезапуск)  
✅ Простая реализация без cron  

## Ограничения

❌ Точность зависит от TICK_INTERVAL (default 5 секунд)  
❌ Если агент занят, задача может выполниться с задержкой  
❌ Нет приоритетов между задачами  

## TODO

- [ ] Добавить проверку scheduled tasks в heartbeat
- [ ] Сохранять scheduled_tasks в БД
- [ ] Показывать scheduled tasks в TUI (в State box)
