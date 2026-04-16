# Agent Loop MVP Spec

## 1. Что это

Это не агент. Это петля, в которой цель начинает достигаться как будто сама.

Система на каждом тике получает:

- цель
- память о прошлом
- сигналы мира
- набор инструментов

И выбирает одно следующее действие.

Никто не строит агента. Никто не объявляет `self`.
Просто петля работает — и цель начинает приближаться.

Формула:

```text
goal + state + sensors + tools
-> LLM
-> action
-> execute(action)
-> observation
-> state'
-> repeat
```

## 2. Rationale

Этот MVP не строит агента как отдельную сущность.
Он не вводит `self`, личность или внутреннего персонажа.
Вместо этого система получает цель, память, сенсоры и возможность действовать в мире.

Гипотеза:

> Если цель постоянно присутствует в каждом тике,
> а система может помнить прошлое, видеть изменения мира
> и выбирать следующее действие —
> то может возникнуть наблюдаемый эффект стремления к цели
> без явного конструирования самого агента.

Иными словами:

- мы не создаём агента напрямую
- мы создаём условия, в которых цель начинает достигаться "сама"

Это принципиальная разница.

## 3. Что значит "живость"

Живость здесь — это когда цель не просто задана, а начинает достигаться как будто сама.

Это не метафора. Это наблюдаемый эффект. Система проявляет его, если:

- держит направление к цели через несколько тиков
- меняет поведение после новых наблюдений
- восстанавливает движение после помех
- продолжает тянуться к цели без жёсткого скрипта

Если всё это происходит — перед нами минимально наблюдаемая агентность.
Не потому что мы её запрограммировали, а потому что она возникла из петли.

> **Agentness in this MVP is not predefined identity.**
> **It is the observable persistence of goal-seeking behavior across ticks.**

## 4. Почему это важно

Новизна этого MVP не в том, что используются LLM, state или tools.
Такие части уже существуют в десятках систем.

Новизна — в том, чего здесь **нет**:

- нет объекта `agent` с полями `self`, `personality`, `identity`
- нет заранее заданного "характера" или "роли"
- нет скрытого chain-of-thought, который имитирует мышление

Вместо этого — голая петля:

```text
goal + memory + world feedback + action selection
```

Если этого достаточно для устойчивого целенаправленного поведения,
значит агентность — это свойство динамики, а не вручную встроенная сущность.

Это отделяет:

- **реальное стремление** — когда система тянется к цели через тики, адаптируется, восстанавливается

от

- **декоративной имитации** — когда агент объявлен, но его "поведение" это просто один вызов LLM с промптом "ты агент"

## 5. Главное ограничение MVP

В MVP есть:

- одна цель
- один state
- один тик = один вызов LLM
- одно основное действие за тик

Нет:

- режимов
- нескольких активных целей
- скрытой памяти
- скрытых изменений мира

## 6. Goal

Цель всегда одна и всегда подаётся в каждый тик.

```json
{
  "id": "goal_1",
  "description": "Reply to the user",
  "success_condition": "response_sent"
}
```

Цель задаёт направление.
Проверка достижения цели делается снаружи, не самой моделью.

## 7. State

State — единственная память агента между тиками.

```json
{
  "tick_count": 0,
  "facts": {},
  "plan": [],
  "history_summary": "",
  "last_action": null,
  "last_observation": null
}
```

Правила:

- state всегда сериализуем в JSON
- state обновляется только после observation
- state хранит факты, а не скрытую магию
- `tick_count` увеличивается на 1 после каждого завершённого тика

## 8. Sensors

Сенсоры — это все входные сигналы мира.

Минимальный формат:

```json
{
  "source": "clock | user | system | tool",
  "type": "time | input | event | tool_result",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Минимально обязательный сенсор:

- текущее дата/время

Пример:

```json
{
  "source": "clock",
  "type": "time",
  "data": {
    "iso_datetime": "2026-04-16T20:30:00+03:00"
  },
  "timestamp": "2026-04-16T20:30:00+03:00"
}
```

## 9. Tools

Инструменты — единственный способ изменить внешний мир.

Минимальный реестр:

```json
{
  "respond_to_user": {
    "input_schema": {
      "text": "string"
    },
    "output_schema": {
      "delivered": "boolean"
    }
  },
  "read_file": {
    "input_schema": {
      "path": "string"
    },
    "output_schema": {
      "content": "string"
    }
  },
  "write_file": {
    "input_schema": {
      "path": "string",
      "content": "string"
    },
    "output_schema": {
      "written": "boolean"
    }
  }
}
```

Если в MVP есть только `respond_to_user`, этого уже достаточно.

## 10. Action

На каждом тике LLM обязана вернуть строго JSON.

```json
{
  "action": {
    "type": "tool_call | noop",
    "tool": "respond_to_user",
    "args": {}
  },
  "state_update": {},
  "reason": "short explanation"
}
```

Правила:

- одно действие за тик
- если действие есть, оно должно ссылаться на существующий tool
- `noop` разрешён
- `state_update` обязателен, даже если пустой
- `reason` короткий, без скрытого chain-of-thought

## 11. Observation

Observation — это результат исполнения действия или событие мира, пришедшее после тика.

```json
{
  "source": "tool | world | user | system",
  "type": "tool_result | world_event | input | error",
  "data": {},
  "timestamp": "ISO-8601"
}
```

Observation — это истина следующего тика.
Если модель ожидала одно, а мир вернул другое, побеждает мир.

## 12. Tick

Один тик делается так:

1. Собрать текущие сенсоры.
2. Собрать текущий state.
3. Собрать goal.
4. Собрать список tools.
5. Передать всё это в LLM.
6. Получить JSON с action.
7. Исполнить action через tool.
8. Получить observation.
9. Обновить state.
10. Проверить success condition.

Псевдокод:

```python
while True:
    sensors = read_sensors()
    llm_output = llm(goal, state, sensors, tools)
    action = llm_output["action"]
    observation = execute(action, tools)
    state = update_state(state, llm_output["state_update"], observation)
    state["tick_count"] += 1
    if success_check(goal, state, observation):
        break
```

## 13. State Update

State update происходит только после observation.

Минимальные правила:

- записать `last_action`
- записать `last_observation`
- применить `state_update` из ответа LLM
- увеличить `tick_count`
- при необходимости сжать историю в `history_summary`

Простое правило сжатия:

```text
if state.tick_count % 10 == 0:
    summarize history into history_summary
```

## 14. Success Check

Успех определяется внешней функцией.

```text
success_check(goal, state, observation) -> true | false
```

Примеры:

- пользователю отправлен ответ
- файл записан
- получен ожидаемый результат инструмента

## 15. Ошибки

Минимальные правила обработки ошибок:

- invalid JSON -> retry текущего тика
- tool failure -> вернуть observation с ошибкой
- слишком много тиков -> stop

## 16. Минимальный тест

```json
{
  "goal": {
    "id": "goal_1",
    "description": "Reply to the latest user message",
    "success_condition": "response_sent"
  },
  "state": {
    "tick_count": 0,
    "facts": {},
    "plan": [],
    "history_summary": "",
    "last_action": null,
    "last_observation": null
  },
  "sensors": [
    {
      "source": "clock",
      "type": "time",
      "data": {
        "iso_datetime": "2026-04-16T20:30:00+03:00"
      },
      "timestamp": "2026-04-16T20:30:00+03:00"
    },
    {
      "source": "user",
      "type": "input",
      "data": {
        "text": "What time is it?"
      },
      "timestamp": "2026-04-16T20:30:00+03:00"
    }
  ],
  "tools": [
    "respond_to_user"
  ],
  "max_steps": 5
}
```

## 17. Критерий валидности MVP

Реализация считается валидной, если:

- tick loop работает дискретно
- goal подаётся в каждый тик
- state явный и JSON-овый
- action выбирается LLM
- action исполняется только через tools
- мир возвращает observation
- success проверяется внешне

И самое главное:

> Если система, получив цель, через несколько тиков демонстрирует
> устойчивое движение к ней — адаптируясь, восстанавливаясь, продолжая —
> значит MVP работает. Цель начала достигаться "сама".