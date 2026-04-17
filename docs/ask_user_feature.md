# Ask User Feature

## Проблема

Раньше агент не мог различать:
- Новую задачу от пользователя
- Ответ на свой вопрос
- Просто комментарий

Все сообщения шли в один поток, и агент не понимал контекст.

## Решение

Добавлен новый tool `ask_user` и механизм отслеживания ожидания ответа.

### Новый Tool: `ask_user`

```typescript
{
  tool: "ask_user",
  args: { question: "What file should I read?" }
}
```

**Отличия от `respond_to_user`:**
- `respond_to_user` — для утверждений и ответов
- `ask_user` — для вопросов, требующих ответа от пользователя

### Изменения в State

Добавлено поле `awaiting_answer`:

```typescript
interface State {
  // ... existing fields
  awaiting_answer: { question: string; asked_at: number } | null;
}
```

### Логика работы

1. **Агент задаёт вопрос:**
   ```typescript
   action: { tool: "ask_user", args: { question: "What file?" } }
   → state.awaiting_answer = { question: "What file?", asked_at: 1234567890 }
   ```

2. **Пользователь отвечает:**
   ```
   User types: "notes.md"
   → Tick видит state.awaiting_answer !== null
   → В промпт добавляется:
     "⚠️ USER ANSWERED YOUR QUESTION!
      Your question was: 'What file?'
      User's answer: 'notes.md'"
   ```

3. **Агент обрабатывает ответ:**
   ```typescript
   action: { tool: "read_file", args: { path: "notes.md" } }
   → state.awaiting_answer остаётся (пока не ответит пользователю)
   
   action: { tool: "respond_to_user", args: { text: "Here's the content..." } }
   → state.awaiting_answer = null (цикл завершён)
   ```

### Промпт

В `SYSTEM_PROMPT_TEMPLATE` добавлены инструкции:

```
2. If you need information from the user, use ask_user (not respond_to_user).
3. When you use ask_user, the next user message will be their answer to your question.
```

В `buildPrompt()` добавлен блок:

```typescript
const awaitingText = state.awaiting_answer
  ? `\n⚠️ AWAITING USER ANSWER to your question: "${state.awaiting_answer.question}"\nNext user message will be their answer.`
  : "";
```

### Socket.IO Integration

Веб/мобильный клиент получает:
- `type: "question"` в событии `chat_update` при `ask_user`
- `awaiting_answer` в `sync_state` при подключении

### Пример сценария

```
User: "Read the file I mentioned yesterday"
Agent: ask_user("Which file do you mean?")
  → state.awaiting_answer = { question: "Which file...", asked_at: ... }

User: "notes.md"
Agent: (видит awaiting_answer)
  → Промпт: "USER ANSWERED YOUR QUESTION! Answer: notes.md"
  → read_file("notes.md")
  → respond_to_user("Here's the content: ...")
  → state.awaiting_answer = null
```

## Преимущества

✅ Агент понимает, что следующее сообщение — ответ на его вопрос  
✅ Не путает новые задачи с ответами  
✅ Может вести многошаговый диалог с контекстом  
✅ Работает как в консоли, так и через Socket.IO  

## Ограничения

- Поддерживается только один вопрос одновременно
- `awaiting_answer` не сохраняется между перезапусками (intentional)
- Если пользователь игнорирует вопрос и даёт новую задачу, агент всё равно воспримет это как ответ
