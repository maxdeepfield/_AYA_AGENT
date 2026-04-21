# Компоненты "Живости" (Liveness Features)

## ✅ Реализовано

### 1. **Spatial Engine** (Пространственный движок)
- Отслеживание текущей локации: `currentLocation`
- История перемещений: `locationHistory`
- Валидация переходов: нельзя телепортироваться с концерта на работу
- Функции: `updateLocation()`, `validateLocationTransition()`

### 2. **Physiological Cycles** (Физиологические циклы)
- Отслеживание сна: `isSleeping`, `lastSleepTime`, `sleepDebt`
- Автоматический сон при критическом недосыпе
- Естественный сон ночью (23:00-8:00)
- Восстановление энергии от сна
- Функции: `checkSleepCycle()`, `forceSleep()`, `wakeUp()`
- **Блокировка сообщений во сне** - не отвечает если спит

### 3. **Activity Phases** (Фазы активности)
- Каждая активность имеет 3 фазы:
  - **Entry** (20%) - вход, можно прервать
  - **Peak** (60%) - пик, нельзя прервать
  - **Exit** (20%) - выход, можно прервать
- Функция: `startActivityWithPhases()`, `schedulePhaseTransition()`

### 4. **Consistency Enforcer** (Проверка консистентности)
- Валидация ответов LLM на физическую реальность
- Проверки:
  - Не отвечает во сне
  - Не врёт о локации
  - Упоминает время суток
  - Длина ответа соответствует энергии
- Функция: `validateLLMResponse()`
- Логирует нарушения в SCIENCE_MODE

### 5. **Memory Distortion** (Искажение воспоминаний)
- Старые воспоминания (>24ч) искажаются со временем
- 4 типа искажений:
  - **AMPLIFICATION** - усиление эмоции
  - **MINIMIZATION** - ослабление
  - **DETAIL_SHIFT** - изменение деталей
  - **EMOTIONAL_FLIP** - смена знака эмоции
- Функции: `distortMemory()`, `generateDistortedMemory()`
- Применяется при загрузке контекста

### 6. **Entropy Injection** (Инъекция энтропии)
- Proactive messages теперь НЕ предсказуемы
- Random walk в счётчике времени: `timeSinceLastProactive * (1 + randomWalk)`
- Зависит от `entropyPreference` персонажа
- Конфиг: `ENTROPY_INJECTION_RATE = 0.15`

### 7. **Meh/Ambivalence** (Равнодушие)
- При `affection ≈ 0` (-5 до +5) - АБСОЛЮТНОЕ равнодушие
- Не "норм", а "мех" - как незнакомец в очереди
- Односложные ответы, без эмоций
- Отдельная градация в `getAffectionModifiers()`

## Как это работает вместе

### Пример 1: Ночное сообщение
```
Ты: "привет" (в 3 ночи)
Система: 
  1. checkSleepCycle() → она спит
  2. handleUserMessage() → return { status: 'unread', reason: 'спит' }
  3. Сообщение НЕ доставлено
```

### Пример 2: Искажённое воспоминание
```
День 1: Память "Мы гуляли в парке, было приятно" (valence: +0.5)
День 5: distortMemory() → AMPLIFICATION
Результат: "Мы гуляли в парке, я была невероятно счастлива" (valence: +0.8)
```

### Пример 3: Activity Phases
```
Начало концерта:
  - Entry (12 мин): можно писать, engagement 0.3
  - Peak (36 мин): НЕ отвечает, engagement 0.9
  - Exit (12 мин): снова доступна, engagement 0.5
```

### Пример 4: Spatial Validation
```
Текущая локация: concert
Попытка: updateLocation(soul, 'work', 'teleport')
Результат: REJECTED - "Невозможно мгновенно переместиться из concert в work"
```

## Конфигурация

```javascript
// Сон
SLEEP_NEED_HOURS: 7
SLEEP_DEBT_THRESHOLD: 3
SLEEP_START_HOUR: 23
SLEEP_END_HOUR: 8

// Энтропия
ENTROPY_INJECTION_RATE: 0.15
```

## Метрики

Новые поля в логах:
- `consistencyViolations` - количество нарушений консистентности
- `sleepDebt` - часы недосыпа
- `currentPhase` - фаза активности
- `distortionType` - тип искажения памяти

## Команда /status

Теперь показывает:
```
Name: Маша
Location: home
Sleeping: NO (debt: 0.5h)
Affection: 5/100
Energy: 80/100
Activity: концерт (peak phase)
Friction: 45/100
```
