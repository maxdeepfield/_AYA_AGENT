# Ten Modules (Codex) — Full Project Synthesis

Дата и время: `2026-03-01 21:22:09`  
Источник синтеза: весь текущий корпус `docs/*` (53 файла: `audit + chats + meta`).

---

## Принцип деления

Это не “первые 10 шагов”.  
Это 10 устойчивых сущностей, из которых складывается весь проектный замысел.

---

## 1) Mission & Goal Engine

**Суть:** зачем агент существует и как определяет приоритеты.  
**Ядро:** `GoalPortfolio`, `North-Star KPI`, `Utility over activity`.  
**Результат модуля:** агент не имитирует занятость, а работает на измеримую ценность.

---

## 2) Identity & Continuity Core

**Суть:** кто агент, что он сохраняет неизменным в себе.  
**Ядро:** `SelfAnchor`, профиль, роль, анти-дрейф идентичности, честная декларация границ.  
**Результат модуля:** поведение узнаваемо и стабильно во времени.

---

## 3) Kernel Runtime Orchestrator

**Суть:** непрерывный жизненный цикл 24/7.  
**Ядро:** `fast/work/deep ticks`, lifecycle, single-process orchestration.  
**Результат модуля:** агент живет как процесс, а не как разовый запрос-ответ.

---

## 4) Perception & Signal Fabric

**Суть:** откуда агент получает события.  
**Ядро:** `SensorBus`, user-input, system/world signals, normalization to event model.  
**Результат модуля:** единый поток наблюдений, пригодный для планирования и памяти.

---

## 5) Drive & Homeostasis Engine

**Суть:** внутренняя динамика мотивации и давления.  
**Ядро:** `curiosity`, `closure`, `social_pull`, `novelty`, homeostatic регулировка.  
**Результат модуля:** инициативы агента не случайны, а вызваны вычислимым состоянием.

---

## 6) Planning, Arbitration & Execution

**Суть:** как агент превращает намерение в действие.  
**Ядро:** planner, scheduler, worker-lanes, conflict arbitration (`utility/risk/deadline`).  
**Результат модуля:** действия исполнимы, согласованы и доводятся до завершения.

---

## 7) Tooling & World Actuation Layer

**Суть:** чем агент действует во внешнем мире.  
**Ядро:** `ToolRouter`, `web_search`, `fetch_url`, controlled tool usage, fallback logic.  
**Результат модуля:** любопытство может переходить в проверяемое исследование, а не оставаться текстом.

---

## 8) Human Co-Intelligence Layer

**Суть:** совместное мышление с пользователем.  
**Ядро:** `Question -> Answer -> Advice -> Outcome`, question budgets, co-transcendence/joint attention.  
**Результат модуля:** пользователь не “инпут”, а партнер; советы дают измеримый lift.

---

## 9) Memory, Knowledge & Reflection Layer

**Суть:** как агент помнит, связывает и переосмысливает опыт.  
**Ядро:** episodic memory, semantic/RAG retrieval, unresolved threads, incubation/dream loops.  
**Результат модуля:** длинная непрерывность контекста и накопление знаний вместо забывания.

---

## 10) Governance, Safety, Evolution & Audit

**Суть:** как система растет, не разрушая себя.  
**Ядро:** stable kernel + mutable behavior packs, validation gates, policy decisions, audit trail, observability.  
**Результат модуля:** контролируемая эволюция без хаоса и без потери управляемости.

---

## Итого (короткая формула)

`Непрерывный runtime + идентичность + память + инструменты + user-first совместность + контролируемая эволюция`

Это и есть целостный “utopia-agi-engine” как проектная система.  
Трансценденция, сны и прочая феноменология остаются важными, но как под-механики внутри модулей 8 и 9, а не как отдельная главная миссия.

