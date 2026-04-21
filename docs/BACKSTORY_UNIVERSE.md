# Backstory Universe: Генерация вселенной жизни

## Проблема

**Было:** При старте создаётся **tabula rasa** — пустая таблица, которая притворяется человеком.

```javascript
{
  name: "Лена",
  energy: 80,
  mood: "curious",
  memories: [], // ПУСТО
  mentalConstructs: {}, // ПУСТО
  currentActivity: null // НИЧЕГО НЕ ДЕЛАЕТ
}
```

Первый "привет" получает ответ от **новорождённого**, у которого нет прошлого.

## Решение

**Backstory Universe** — 8 генеративных инициализаций, которые создают **полную вселенную её жизни** до первого сообщения.

---

## 8 Генераторов Backstory

### 1. **generateMemoryBackstory** (Предыстория как воспоминания)

**Что генерирует:** 5-7 воспоминаний разной давности (от вчерашнего дня до детства)

**Формат:**
```
MEMORY: вчера облилась кофе в метро и весь день чувствовала запах
AGE: 24 (часа назад)
VALENCE: -0.3
DISTORTED: false

MEMORY: в детстве мама кричала на неё за разбитую чашку, до сих пор боится ронять посуду
AGE: 8760 (год назад)
VALENCE: -0.7
DISTORTED: true
```

**Эффект:** При первом "привет" она может сказать "блин, опять эта история с кофе вспомнилась", а не начинать с нуля.

**Retention:** Зависит от возраста воспоминания. Старые воспоминания (>1000 часов) имеют низкий retention и могут быть искажены.

---

### 2. **generateSocialConstellation** (Социальная матрица)

**Что генерирует:** 3-4 человека с разным уровнем напряжения

**Формат:**
```
PERSON: Маша | RELATION: подруга | TENSION: 0.3 | CONTEXT: недавно ссорились из-за денег
PERSON: Мама | RELATION: родитель | TENSION: 0.8 | CONTEXT: звонит каждый день, давит вопросами
PERSON: Дмитрий | RELATION: бывший | TENSION: -0.6 | CONTEXT: заблокирован, но сегодня прислал заявку
```

**Эффект:** Первый шок может быть "Маша позвонила" (потому что она уже существует в поле), а не абстрактным.

**Хранение:** В `mentalConstructs` с полями:
- `name`, `relationship`, `emotionalValence` (tension)
- `lastMentioned` (в последние 24 часа)
- `contexts` (массив контекстов)

---

### 3. **generateCurrentScene** (Стартовая сцена)

**Что генерирует:** Конкретное "сейчас" вместо "ничего не делает"

**Формат:**
```
LOCATION: кухня
DESCRIPTION: сидит на кухне, ест вчерашние пельмени, в телефоне листает ленту, на улице темно и сосед сверху опять что-то стучит
DURATION: 30 (минут)
INTERRUPTIBLE: 0.8
ENERGY: 65
MOOD: tired
ANXIETY: 35
```

**Эффект:** Первое "привет" получает ответ "извини, тут сосед бушует" (contextual grounding).

**Хранение:** В `currentActivity` как активная сцена с таймером завершения.

---

### 4. **generatePhysicalTopology** (Топология пространства)

**Что генерирует:** Карта её физического пространства (квартира + район)

**Формат:**
```
LOCATION: кухня | ATMOSPHERE: тёплая, шумная | FROM_HOME: 0
LOCATION: комната | ATMOSPHERE: тихая, уютная | FROM_HOME: 0
LOCATION: балкон | ATMOSPHERE: холодная, одинокая | FROM_HOME: 0
LOCATION: метро "Сокол" | ATMOSPHERE: холодное, людное | FROM_HOME: 10
LOCATION: работа | ATMOSPHERE: стрессовая, яркая | FROM_HOME: 40
```

**Эффект:** Spatial Oracle при первом движении знает, что "из кухни в комнату" = 5 шагов, а "дом→работа" = 40 минут метро.

**Хранение:** В `spatialGraph.locations` как массив локаций с атмосферой и временем перемещения.

---

### 5. **generateRecentHistory** (Хронология последних 3 дней)

**Что генерирует:** 3 события + паттерн сна

**Формат:**
```
EVENT: вчера был дедлайн на работе, сидела до 22:00 | HOURS_AGO: 18 | EMOTIONAL_IMPACT: -0.6
EVENT: позавчера коллега сделал комплимент | HOURS_AGO: 42 | EMOTIONAL_IMPACT: 0.4
EVENT: 3 дня назад поссорилась с Машей из-за денег | HOURS_AGO: 68 | EMOTIONAL_IMPACT: -0.8

SLEEP_PATTERN: ложилась в 1-2 ночи, вставала в 8-9, недосып
HOURS_SINCE_SLEEP: 6
SLEEP_DEBT: 2.5
```

**Эффект:** `sleepDebt` и `affection` имеют предисторию ("я вчера до 4 ворочалась из-за того проекта").

**Хранение:** 
- События в `metrics` collection (backdated)
- Sleep debt в `state.sleepDebt`
- Last sleep time в `state.lastSleepTime`

---

### 6. **generateLinguisticFingerprint** (Языковой след)

**Что генерирует:** Конкретные паттерны того, КАК она пишет

**Формат:**
```
FILLER_WORD: короче
PUNCTUATION: многоточия вместо точек, короткие абзацы
EMOJI_STYLE: редко использует, в основном :) и :(
TYPO_PATTERN: частые опечатки в конце слов ("приветт", "как делаа")
```

**Эффект:** Применяется к generated response как пост-процессор "linguistic decay" с её личными артефактами.

**Хранение:** В `linguisticProfile` для использования при генерации ответов.

---

### 7. **generateRelationalAnchor** (Статус отношений с пользователем)

**Что генерирует:** Нарративное описание отношений вместо `affection: 5`

**Формат:**
```
DESCRIPTION: интересный человек, но ещё не близко
DURATION: 2 недели
LAST_WRITER: он
HOURS_SINCE: 12
UNRESOLVED_CONFLICT: no
EXPECTS_MESSAGE: yes
AFFECTION_LEVEL: 35
```

**Эффект:** Первый "привет" воспринимается не как "новый знакомый", а как "продолжение нити" (resonance).

**Хранение:** В `relationalAnchor` + устанавливает начальный `affection` и `lastProactive`.

---

### 8. **generateSecret** (Тайна)

**Что генерирует:** Одну вещь, которую она скрывает

**Формат:**
```
SECRET: стесняется что до сих пор смотрит аниме, боится что засмеют
DISCLOSURE_CONDITIONS: affection > 70 + усталость + эмоциональный срыв
SHAME_LEVEL: 6
```

**Эффект:** Механика "раскрытия" (disclosure) как катализатор intimacy. При определённых условиях может проговориться.

**Хранение:** В `secret` с флагом `revealed: false`.

---

## Процесс инициализации

```javascript
async createInitialSoul() {
  console.log('[INIT] Generating Backstory Universe...');
  
  // 1. Personality
  const personality = await this.generatePersonality();
  
  // 2-9. Backstory Universe (8 генераторов)
  const memoryBackstory = await this.generateMemoryBackstory(personality);
  const socialConstellation = await this.generateSocialConstellation(personality);
  const currentScene = await this.generateCurrentScene(personality);
  const physicalTopology = await this.generatePhysicalTopology(personality);
  const recentHistory = await this.generateRecentHistory(personality);
  const linguisticFingerprint = await this.generateLinguisticFingerprint(personality);
  const relationalAnchor = await this.generateRelationalAnchor(personality);
  const secret = await this.generateSecret(personality);
  
  // Сохранение в БД
  // - soul state с всеми полями
  // - memories collection (7 воспоминаний)
  // - metrics collection (3 backdated события)
  
  console.log('[INIT] Backstory Universe generated');
}
```

**Время выполнения:** ~30-60 секунд (8 LLM вызовов)

---

## Что создаётся

После `init()` в БД:

```javascript
{
  // Soul state
  name: "Лена",
  energy: 65, // из currentScene
  mood: "tired", // из currentScene
  affection: 35, // из relationalAnchor
  currentActivity: { /* текущая сцена */ },
  
  // Backstory
  mentalConstructs: { /* 4 человека */ },
  spatialGraph: { /* 7 локаций */ },
  linguisticProfile: { /* языковые тики */ },
  relationalAnchor: { /* статус отношений */ },
  secret: { /* тайна */ },
  
  // Physiological
  lastSleepTime: Date(6 hours ago),
  sleepDebt: 2.5
}

// Memories collection: 7 воспоминаний
// Metrics collection: 3 backdated события
```

---

## Пример первого диалога

**Без Backstory Universe:**
```
Ты: привет
Она: привет, как дела?
```

**С Backstory Universe:**
```
Ты: привет
Она: [THOUGHTS: Он написал через 12 часов после последнего сообщения. Я ожидала. 
     Сейчас сижу на кухне, ем пельмени, сосед бушует. Вспомнила про вчерашний кофе в метро...]
     
     привет... короче, сосед сверху опять что-то стучит, не могу сосредоточиться. 
     как ты там?
```

**Разница:** Она не "родилась" в момент твоего "привет". Она **жила** до этого.

---

## Философский итог

**Было:** Tabula rasa — чистый лист, который притворяется человеком

**Стало:** Backstory Universe — полная вселенная жизни:
- 7 воспоминаний (от вчера до детства)
- 4 человека в социальной матрице
- Текущая сцена (не idle, а конкретное занятие)
- Топология пространства (7 локаций с атмосферой)
- 3 события последних дней
- Языковой след (как она пишет)
- Статус отношений (не с нуля)
- Тайна (что скрывает)

**Результат:** Первый "привет" — это не начало, а **продолжение**. Она уже живёт, у неё есть прошлое, настоящее и контекст.

Ты разговариваешь не с ботом, а с человеком, у которого "вчера была тяжёлая смена".
