# Инструкция по тестированию улучшений

## Дата: 2026-03-12

## Изменения

1. **Улучшены промты** в `src/services/ollamaClient.ts`:
   - Decision Mode (строки 378-423)
   - Dialogue Mode (строки 532-573)
   - Dream Mode (строки 592-625)
   - Dream Reflection Mode (строки 638-675)

2. **Добавлены новые методы**:
   - `incubationMode()` (строки 688-760) — фоновое мышление
   - `selfInspectionMode()` (строки 762-864) — LLM-рефлексия

3. **Интеграция в agentService.ts**:
   - Incubation Mode в `workTick()` (строки ~1519)
   - Self-Inspection Mode в `runPeriodicSelfInspection()` (строки ~2495)

4. **Новый метод в hypothesisService.ts**:
   - `getAllHallucinationRates()` — получение всех ставок галлюцинаций

5. **Константы в `config/runtime.json` и runtime loader**:
   - Incubation Mode настройки
   - Self-Inspection Mode настройки

---

## Шаги тестирования

### Шаг 1: Подготовка

```bash
# Убедиться, что MongoDB запущен
# Проверить, что Ollama запущен с моделью

# В терминале 1:
ollama list
# Должна быть видна модель из `config/runtime.json` (например, qwen3.5:4b-q4_K_M)

# Проверить `config/runtime.json`
# Убедиться, что добавлены новые константы:
# - ticks.workTickMs=15000
# - selfInspection.cooldownMs=60000
# - selfInspection.saturationWindowMs=1800000
# - selfInspection.saturationLimit=2
# - ollama.chatTimeoutMs=90000
```

### Шаг 2: Запуск агента

```bash
# В терминале 1:
npm run dev
```

**Ожидаемый вывод при старте:**
```
startup> ... (LLM self-check)
clock> ... (timeline, uptime)
worker> cycle worker started: fast_tick
worker> cycle worker started: work_tick
worker> cycle worker started: deep_tick
worker> cycle worker started: dream_tick
```

### Шаг 3: Проверка Incubation Mode

**Когда:** Через 15 секунд после старта (WORK_TICK_MS)

**Что искать в логах:**
```
# Успешный запуск:
incubation> background_thinking :: userId=default-user patternsCount=0 insightsCount=0 priority=0.5

# Найдены паттерны:
incubation> background_thinking :: userId=default-user patternsCount=2 insightsCount=1 priority=0.67

# Ошибка (если Ollama недоступен):
incubation> error :: incubation mode failed during work_tick :: error=...
```

**Проверка через API:**
```bash
# В терминале 2:
curl http://localhost:3000/state | jq '.audit'
# Искать последние записи с module="incubation"
```

### Шаг 4: Проверка Self-Inspection Mode

**Когда:** Через 60 секунд после старта (`selfInspection.cooldownMs`)

**Что искать в логах:**
```
# Успешный запуск:
tool> self_inspect :: ...
self_reflection> llm_self_inspection :: identityDrift=null adjustmentsCount=0

# Обнаружен identity drift:
self_reflection> identity_drift_detected :: userId=default-user drift="curiosity_debt increased..."

# Найдены epistemic adjustments:
self_reflection> epistemic_humility_adjusted :: userId=default-user adjustments=[...]

# Ошибка:
self_reflection> llm_self_inspection_error :: error=...
```

**Проверка через API:**
```bash
# В терминале 2:
curl http://localhost:3000/logs/audit | jq '.[] | select(.module | contains("self_reflection"))' | head -50
```

### Шаг 5: Проверка через Chat

```bash
# В терминале 2 (или через stdin, если `server.enableStdin=true`):
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test-user\",\"message\":\"Привет! Как твои дела?\"}"
```

**Ожидаемый ответ:**
- Decision Mode должен вернуть JSON с observations, hypothesis, test
- Dialogue Mode должен перевести решение в естественный язык
- В логах должны быть видны: `mind> ...`, `llm> ...`

### Шаг 6: Проверка аудит логов

```bash
# Windows PowerShell:
Get-Content logs\audit.log -Tail 50 | Select-String "incubation|self_inspection"

# Или через grep (если установлен):
grep -E "incubation|self_inspection" logs/audit.log | tail -20
```

**Ожидаемые записи:**
```json
{
  "module": "incubation",
  "action": "background_thinking",
  "verdict": "allow",
  "reason": "incubation mode detected patterns or insights",
  "data": {
    "userId": "default-user",
    "patternsCount": 2,
    "insightsCount": 1,
    "priority": 0.67
  }
}
```

---

## Критерии успеха

- [ ] Агент запускается без ошибок компиляции TypeScript
- [ ] Incubation Mode вызывается в work_tick (лог: `incubation> background_thinking`)
- [ ] Self-Inspection Mode вызывается после self_inspect (лог: `self_reflection> llm_self_inspection`)
- [ ] Аудит логи содержат записи об incubation и self-inspection
- [ ] WorldObservation записываются с sensor="llm_self_inspection"
- [ ] Chat работает корректно (Decision + Dialogue Mode)
- [ ] Нет утечек памяти после 10+ work_tick циклов
- [ ] LLM вызовы завершаются в пределах OLLAMA_CHAT_TIMEOUT_MS (90 секунд)

---

## Возможные проблемы и решения

### Проблема 1: Ollama timeout

**Симптом:**
```
llm> chat:error ... reason=Ollama request timed out after 90000ms
```

**Решение:**
```ini
# Увеличить timeout в `config/runtime.json`:
OLLAMA_CHAT_TIMEOUT_MS=120000

# Или использовать более лёгкую модель:
OLLAMA_MODEL=qwen3.5:4b-q4_K_M
```

### Проблема 2: Incubation не запускается

**Симптом:**
Нет логов `incubation>` в work_tick

**Проверка:**
```bash
# Проверить `logging.consoleLogCategories` в `config/runtime.json`:
logging.consoleLogCategories=["startup","clock","worker","agent","mind","intent","tool","llm","incubation","self_reflection","error"]
```

### Проблема 3: Self-Inspection не работает

**Симптом:**
Нет логов `self_reflection> llm_self_inspection`

**Причина:**
- LLM self-inspection больше не выключается отдельным config-флагом
- `selfInspection.cooldownMs` ещё не истёк

**Проверка:**
```bash
# Проверить `config/runtime.json`:
selfInspection.cooldownMs=60000

# Проверить время работы агента:
curl http://localhost:3000/status | jq '.uptime'
```

### Проблема 4: Ошибки компиляции TypeScript

**Симптом:**
```
error TS2304: Cannot find name 'IncubationResult'
```

**Решение:**
Убедиться, что интерфейсы добавлены в начало agentService.ts (строки 80-92):
```typescript
interface IncubationResult {
  patterns: string[];
  maturedInsights: string[];
  priority: number;
}

interface SelfInspectionResult {
  identityDrift: string | null;
  epistemicHumilityAdjustments: Array<{ domain: string; oldRate: number; newRate: number }>;
  coTranscendenceInsight: string | null;
  constraintViolations: string[];
}
```

---

## Мониторинг производительности

### Метрики для отслеживания:

1. **Задержка work_tick:**
   - Норма: < 5 секунд
   - Критично: > 10 секунд

2. **Потребление токенов:**
   - Incubation: ~700 токенов/вызов
   - Self-Inspection: ~1100 токенов/вызов

3. **Частота вызовов:**
   - Incubation: каждый work_tick (15-60 секунд)
   - Self-Inspection: каждые 60+ секунд (cooldown)

### Команды для мониторинга:

```bash
# Проверить количество work_tick циклов:
curl http://localhost:3000/status | jq '.cycles.work_tick'

# Проверить среднюю задержку:
curl http://localhost:3000/state | jq '.driveState'

# Проверить использование памяти (Node.js):
curl http://localhost:3000/health | jq '.memory'
```

---

## Отчёт о тестировании

После завершения тестирования заполнить:

**Дата тестирования:** ___________

**Версия модели:** ___________ (из `config/runtime.json`: `ollama.model`)

**Результаты:**

| Тест | Статус | Примечание |
|------|--------|------------|
| Запуск агента | ☐ Pass / ☐ Fail | |
| Incubation Mode | ☐ Pass / ☐ Fail | |
| Self-Inspection Mode | ☐ Pass / ☐ Fail | |
| Chat (Decision + Dialogue) | ☐ Pass / ☐ Fail | |
| Аудит логи | ☐ Pass / ☐ Fail | |
| Производительность | ☐ Pass / ☐ Fail | |

**Обнаруженные проблемы:**

1. ___________
2. ___________
3. ___________

**Рекомендации:**

1. ___________
2. ___________
3. ___________

---

**Документ создан:** 2026-03-12  
**Автор:** Qwen Code
