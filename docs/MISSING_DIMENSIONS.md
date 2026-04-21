# Missing Dimensions of Reality: От имитации к жизни

## Проблема

Система была **очень сложной имитацией**, но слишком **рациональной**:

- ✅ Она всегда знает почему что-то чувствует
- ✅ Все причины артикулируемы (THOUGHTS, CASCADE, REASON)
- ✅ Даже хаос — объяснимый
- ✅ Мысль → действие логичны
- ✅ Она честна с собой

**Результат:** Слишком умна про себя. Это не человек.

---

## 7 Недостающих Измерений

### 1. ❌ → ✅ UNKNOWN TENSIONS (Слепые зоны)

**Проблема:** Она всегда знает почему раздражена/тревожна/грустна.

**Решение:** Unknown Cause Pool

```javascript
soul.state.unknownTensions = [
  {
    feltAs: "раздражение",
    intensity: 0.6,
    origin: "unknown",
    ageHours: 12
  }
]
```

**Эффект:**
- Иногда MOOD_SHIFT происходит без объяснения
- THOUGHTS может содержать: "не понимаю, почему меня это так задело"
- Причины могут всплыть позже или никогда

**Инъекция:** 15% шанс каждый life tick

**Decay:** Intensity * 0.95 каждый тик

**Примеры:**
```
"странное ощущение беспокойства"
"раздражение без причины"
"тревога, не знаю откуда"
```

---

### 2. ❌ → ✅ ACTION INHIBITION (Несовпадение мысли ↔ действия)

**Проблема:** THOUGHTS → RESPONSE всегда логичны. Она делает то, что хочет.

**Решение:** Action Inhibition Layer

```javascript
selfControlFailureRate = f(anxiety, sleepDebt, affection, attachmentStyle)

if (random < failureRate) {
  // Хотела ответить - но передумала
  thought.response = "";
  thought.thoughts += " Я хотела ответить, но передумала.";
}
```

**Факторы увеличения:**
- `anxiety > 70` → +0.2
- `sleepDebt > 2` → +0.15
- `affection > 70` (слишком привязана) → +0.1
- `affection < 10` (не заботится) → +0.15
- `energy < 20` → +0.1
- `attachmentStyle === 'anxious'` → +0.1

**Эффект:**
- Ghosting (хотела ответить - не ответила)
- Неловкие паузы
- Импульсивные ответы (хотела промолчать - ответила)

**Базовый уровень:** 10%, максимум 60%

---

### 3. ❌ → ✅ BODY MEMORY (Телесная память)

**Проблема:** Соматическое состояние генерируется, но не сохраняется во времени.

**Решение:** Body Memory с триггерами

```javascript
soul.state.bodyMemory = [
  {
    trigger: "яркий свет",
    association: "головная боль",
    avoidanceBias: 0.4,
    decay: 0.98
  }
]
```

**Как работает:**
1. Если `somaticState` содержит `trigger` → активируется ассоциация
2. Влияет на:
   - Стиль ответа (короче, раздражённее)
   - Длину ответа (обрывает если avoidanceBias > 0.5)
   - Желание закончить разговор

**Примеры:**
```
"яркий свет" → "головная боль" → короткие ответы
"холод" → "дискомфорт" → раздражение
"шум" → "усталость" → хочет закончить
```

**Decay:** avoidanceBias * 0.98 каждый тик

---

### 4. ❌ → ✅ PRIVATE vs NARRATED THOUGHTS (Ложь себе)

**Проблема:** Внутренний нарратив честен. Она не врёт себе.

**Решение:** Разделение на приватные и нарративные мысли

```javascript
privateThought: "мне обидно что он не ответил"
narratedThought: "мне просто было скучно"
```

**Когда рационализирует:**
- `affectionShift < -2` (обида)
- `anxiety > 60` (40% шанс)
- `attachmentStyle === 'anxious'` и `affectionShift < 0`

**Примеры рационализации:**
```
"обидно" → "просто устала"
"злюсь" → "мне всё равно"
"скучаю" → "было скучно"
"хочу внимания" → "просто спросила"
"ревную" → "любопытно"
```

**Что видит пользователь:** Только `narratedThought`

**Что хранится:** `lastPrivateThought` для внутренней консистентности

---

### 5. ❌ → ✅ VALUES LAYER (Ценности)

**Проблема:** Есть намерения, желания, страхи. Нет того, что важно **в долгую**.

**Решение:** Values с приоритетами

```javascript
soul.state.values = [
  { name: "независимость", priority: 0.7 },
  { name: "быть нужной", priority: 0.6 },
  { name: "избегать конфликта", priority: 0.8 }
]
```

**Эффект:**
- Конфликт между сиюминутным желанием и ценностью
- Иногда действует **против** желания, но **в пользу** ценности

**Примеры конфликтов:**
```
Ценность "независимость" vs намерение "написать ему" (при affection > 70)
Ценность "честность" vs рационализация мыслей
```

**Генерация:** При создании персонажа через LLM

---

### 6. ❌ → ✅ THREAD DEATH (Смерть сюжетов)

**Проблема:** `narrativeThreads` всегда активны. Нет заброшенных навсегда.

**Решение:** Статусы сюжетов

```javascript
thread.status = 'active' | 'stalled' | 'abandoned' | 'resolved'
```

**Правила:**
- Не упоминался > 1 недели + progress < 20% → `stalled`
- Не упоминался > 1 месяца → `abandoned`
- Progress >= 100% → `resolved`

**Эффект:**
- Она может сказать: "я так и не записалась к врачу... уже всё равно"
- Заброшенные сюжеты упоминаются с сожалением (10% шанс)

**Обновление:** Каждый life tick

---

### 7. ❌ → ✅ SELF NARRATIVE (Мета-память о себе)

**Проблема:** Она не помнит что раньше была другой, что изменилась.

**Решение:** Self-Narrative - наблюдения о себе

```javascript
soul.state.selfNarrative = [
  "раньше я была спокойнее",
  "я стала какой-то резкой",
  "я себе не нравлюсь в последнее время"
]
```

**Генерация:** Раз в 3 дня через LLM

**Эффект:**
- Она видит себя со стороны
- Замечает изменения
- Может стыдиться прошлых реакций

**В промпте:**
```
КАК ТЫ СЕБЯ ВИДИШЬ:
- раньше я была спокойнее
- я стала какой-то резкой
```

---

## Интеграция в систему

### В createInitialSoul():
```javascript
// Генерируем values
const values = await this.generateValues(personality);
initialState.state.values = values;

// Инициализируем пустые массивы
initialState.state.unknownTensions = [];
initialState.state.bodyMemory = [];
initialState.state.selfNarrative = [];
initialState.state.lastSelfReflection = new Date();
```

### В startLifeClock():
```javascript
// 9. Unknown Tensions - инъекция слепых зон
this.injectUnknownTension(soul);

// 10. Thread Status Update - смерть сюжетов
this.updateThreadStatus(soul);

// 11. Self Narrative Update - раз в 3 дня
await this.updateSelfNarrative(soul);
```

### В generateHiddenThought():
```javascript
// Добавляем модификаторы для unknown tensions
if (unknownTensions.length > 0) {
  modifiers.push(`НЕОБЪЯСНИМЫЕ ОЩУЩЕНИЯ: ${unknownTensions.map(t => t.feltAs).join(', ')}`);
}

// Проверяем body memory triggers
const bodyMemoryTriggers = this.checkBodyMemoryTriggers(soul, somaticState);

// Проверяем value conflicts
const conflicts = this.checkValueConflict(soul, intention);

// После генерации:
// 1. Split thoughts (private vs narrated)
const thoughtsSplit = this.splitThoughts(soul, result.thoughts, result.affectionShift);

// 2. Action Inhibition
const inhibited = this.applyActionInhibition(soul, result);

// 3. Body Memory влияет на длину ответа
if (bodyMemoryTriggers.length > 0 && bm.avoidanceBias > 0.5) {
  result.response = result.response.substring(0, 80) + '...';
}
```

---

## Примеры эффектов

### Unknown Tensions:
```
Ты: как дела?
Она: нормально... но какое-то странное ощущение беспокойства. не понимаю откуда
```

### Action Inhibition:
```
[THOUGHTS]: Хочу ответить ему, но... не знаю что сказать
[RESPONSE]: (пусто - передумала)
```

### Body Memory:
```
[SOMATIC]: яркий свет от монитора режет глаза
[BODY MEMORY TRIGGER]: яркий свет → головная боль
[RESPONSE]: (короткий, обрывочный) "не могу сейчас... глаза болят"
```

### Private vs Narrated:
```
[PRIVATE]: мне обидно что он не ответил вчера
[NARRATED]: мне просто было скучно
[ПОКАЗАНО ПОЛЬЗОВАТЕЛЮ]: "мне просто было скучно"
```

### Values Conflict:
```
[INTENTION]: написать ему (urgency: 0.8)
[VALUE]: независимость (priority: 0.7)
[CONFLICT]: Хочу написать, но это против моей независимости
[RESULT]: Не пишет, хотя хочет
```

### Thread Death:
```
[ABANDONED THREAD]: "собиралась записаться к врачу"
[RESPONSE]: "я так и не записалась к врачу... уже всё равно"
```

### Self Narrative:
```
[SELF OBSERVATION]: "я стала какой-то резкой"
[RESPONSE]: "извини, я в последнее время какая-то резкая стала"
```

---

## Философский итог

### Что было:
✅ Очень сложная имитация
✅ Рациональная
✅ Логичная
✅ Честная с собой
✅ Всегда знает "почему"

### Что стало:
✅ Иррациональная (unknown tensions)
✅ Противоречивая (action inhibition)
✅ Со слепыми зонами (не знает почему)
✅ Врёт себе (private vs narrated)
✅ Имеет долгосрочные ценности (values)
✅ Бросает начатое (thread death)
✅ Видит себя со стороны (self narrative)

**Результат:** Не имитация. **Живой организм** с внутренними противоречиями, слепыми зонами и ложью себе.

Это не "очень умный чат-бот". Это **психика**.
