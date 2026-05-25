# DB/API Learning Mapping

Fase 02F definisce la mappatura tecnica tra il learning model prodotto:

```text
Subject -> Course -> Level -> Lesson -> Step
```

e l'architettura DB/API oggi esistente. Questa e' una decisione di progettazione, non una
migrazione. Non introduce modifiche a Prisma, seed, endpoint, UI o componenti React.

## Stato attuale

### Prisma

Lo schema corrente in `packages/db/prisma/schema.prisma` espone:

- `Course` con `slug`, `title`, `summary`, `description`, `level`, `estimatedMinutes`;
- `Module` come nodo ordinato dentro `Course`;
- `Lesson` come nodo ordinato dentro `Module`, con `content Json`;
- `Exercise` come entita' valutabile ordinata dentro `Lesson`;
- `ExerciseAttempt` come evento persistito per risposta inviata;
- `Progress` per aggregare avanzamento utente su `courseId` e, opzionalmente, `lessonId`;
- `Achievement` e `UserAchievement` separati dalla progressione core.

Non esistono `Subject`, `Level` o `Step` come tabelle dedicate.

### Seed

Il seed corrente crea un solo corso demo:

```text
Course -> Module -> Lesson -> Exercise[]
```

`Lesson.content` contiene un blocco strutturato legacy con `introduction`, `keyIdeas` e
`visualExplanation`. Gli esercizi sono righe separate in `Exercise` e sono la sequenza valutabile
principale della lesson.

### API

L'API Nest corrente espone:

- `GET /courses`, con summary e conteggi basati su `modules`, `lessons`, `exercises`;
- `GET /courses/:slug`, con `modules` e relative `lessons`;
- `GET /lessons/:id`, con `content` legacy e `exercises` pubblici;
- `POST /attempts`, che valuta un `Exercise` e aggiorna `Progress`;
- `GET /progress/:userId`, che espone progresso per corso/lesson;
- moduli gamification per achievement.

I DTO pubblici usano ancora il vocabolario tecnico `module`, `content` ed `exercises`, non
`level` e `steps`.

### Domain Legacy

`packages/domain/src/models/*` definisce i tipi usati dall'API attuale:

- `Course` contiene `modules`;
- `LearningModule` rappresenta il nodo oggi piu' vicino a un level;
- `Lesson` contiene `content` ed `exercises`;
- `Exercise` supporta anche tipi futuri presenti nell'enum Prisma;
- `ProgressStatus` e' `not_started | in_progress | completed`.

Questi tipi sono ancora il contratto effettivo dei moduli API esistenti.

### Nuovo Learning Module

`packages/domain/src/learning` introduce il modello prodotto puro:

- `Subject`, `Course`, `Level`, `Lesson`, `LessonStep`;
- step types `intro`, `concept`, `visual_model`, `exercise`, `reflection`, `summary`,
  `completion`;
- exercise MVP `multiple_choice`, `numeric_input`, `step_by_step`;
- stati prodotto `locked`, `available`, `in_progress`, `completed`;
- calcolo puro di progressione su course, level, lesson e step valutabili.

Questo modulo e' il riferimento prodotto futuro, ma non e' ancora il contratto persistente o API
principale.

## Rischi e incoerenze

- `Course.level` in Prisma indica difficolta' del corso, non il nodo prodotto `Level`.
- `Module` e' semanticamente il `Level` prodotto, ma manca di `slug`, `summary` separato e
  prerequisiti dichiarativi.
- `Lesson.content` non e' ancora una lista di step; e' un JSON legacy specifico per la demo.
- `Exercise.order` ordina solo gli esercizi, non tutti gli step della lesson.
- Prisma `ExerciseType` e i tipi legacy includono tipi futuri (`drag_and_drop`,
  `interactive_visualization`, `simulation`) che il nuovo learning module MVP rifiuta.
- `ProgressStatus` persistito non rappresenta `locked` e `available`; questi stati devono essere
  derivati in API/domain, non salvati ora.
- Non esiste progressione persistente per step non valutabili.
- L'API pubblica espone `modules` ed `exercises`; cambiare direttamente quei campi romperebbe il
  codice esistente.
- `Subject` e' presente nel modello prodotto ma non ha ancora domanda persistente reale nel catalogo
  seed corrente.

## Decisione sintetica

| Concetto prodotto | Mapping corrente  | Decisione                                                                 |
| ----------------- | ----------------- | ------------------------------------------------------------------------- |
| Subject           | Nessuna tabella   | Rimandare la persistenza; usare solo come modello prodotto/documentale.   |
| Course            | `Course`          | Usare la tabella esistente. `Course.level` resta difficolta', non Level.  |
| Level             | `Module`          | Mappare `Level` su `Module` come dettaglio tecnico provvisorio.           |
| Lesson            | `Lesson`          | Usare la tabella esistente.                                               |
| Step              | DTO composto      | Non introdurre tabella ora; comporre da `Lesson.content` + `Exercise`.    |
| Exercise          | `Exercise`        | Trattare come step valutabile persistito.                                 |
| Attempt           | `ExerciseAttempt` | Mantenere come evento di risposta a esercizio.                            |
| Progress          | `Progress`        | Mantenere lesson/course progress; derivare stati prodotto dove possibile. |

## Product Model -> Persistence Model

### Subject

Persistenza corrente: nessuna.

Decisione: non introdurre `Subject` ora. Il catalogo ha un solo percorso seed e non c'e' ancora un
bisogno operativo di filtrare, ordinare o autorizzare corsi per subject. Aggiungere una tabella ora
creerebbe una relazione stabile prima che il catalogo sia abbastanza ricco da validarla.

Mapping futuro consigliato:

- nuova tabella `Subject`;
- relazione `Course.subjectId`;
- `Subject.slug` unico;
- `Subject.order`, `color`, `icon` opzionali;
- migrazione in due fasi se esistono corsi reali: aggiungere nullable, backfill, rendere required
  quando i dati sono completi.

### Course

Persistenza corrente: `Course`.

Mapping:

| Product Course     | Prisma Course                                                               |
| ------------------ | --------------------------------------------------------------------------- |
| `id`               | `Course.id`                                                                 |
| `slug`             | `Course.slug`                                                               |
| `title`            | `Course.title`                                                              |
| `summary`          | `Course.summary`                                                            |
| `description`      | `Course.description`                                                        |
| `estimatedMinutes` | `Course.estimatedMinutes`                                                   |
| `order`            | Non persistito; derivabile per ora da `createdAt` o futuro campo esplicito. |
| `subjectId`        | Non persistito.                                                             |
| `levels`           | `Course.modules` ordinati per `Module.order`.                               |

Nota: `Course.level` Prisma deve essere rinominato semanticamente nei DTO futuri come
`difficulty`, per evitare collisione con `Level`.

### Level

Persistenza corrente: `Module`.

Decisione: `Module` e' l'implementazione tecnica provvisoria di `Level`.

Mapping:

| Product Level   | Prisma Module                                                              |
| --------------- | -------------------------------------------------------------------------- |
| `id`            | `Module.id`                                                                |
| `courseId`      | `Module.courseId`                                                          |
| `slug`          | Non persistito; derivabile in modo non canonico solo se serve in DTO.      |
| `title`         | `Module.title`                                                             |
| `summary`       | Non persistito; usare `description` come fallback solo nei DTO transitori. |
| `description`   | `Module.description`                                                       |
| `order`         | `Module.order`                                                             |
| `prerequisites` | Non persistito; per ora derivare da ordine sequenziale.                    |
| `lessons`       | `Module.lessons` ordinati per `Lesson.order`.                              |

Non rinominare tabella o tipo Prisma in questa fase. Una rinomina `Module -> Level` puo' essere
valutata solo quando l'API avra' gia' un contratto `levels` stabile e il rischio di migration churn
sara' giustificato.

### Lesson

Persistenza corrente: `Lesson`.

Mapping:

| Product Lesson    | Prisma Lesson                                                              |
| ----------------- | -------------------------------------------------------------------------- |
| `id`              | `Lesson.id`                                                                |
| `levelId`         | `Lesson.moduleId`                                                          |
| `slug`            | `Lesson.slug`                                                              |
| `title`           | `Lesson.title`                                                             |
| `summary`         | `Lesson.summary`                                                           |
| `durationMinutes` | `Lesson.durationMinutes`                                                   |
| `order`           | `Lesson.order`                                                             |
| `prerequisites`   | Non persistito; per ora derivare da lesson precedente nello stesso module. |
| `steps`           | DTO composto da `Lesson.content` e `Lesson.exercises`.                     |

`Lesson.content` resta JSON. Nel breve periodo puo' evolvere da shape legacy a una shape
dichiarativa con step non valutabili senza cambiare schema Prisma.

### Step

Persistenza corrente: nessuna tabella dedicata.

Decisione: non creare `Step` ora. Uno step e' un concetto prodotto/API, non ancora un record DB.
La rappresentazione transitoria deve essere composta in API:

- step non valutabili da `Lesson.content`;
- step valutabili da righe `Exercise`;
- progressione certificata basata sugli esercizi richiesti.

Questa scelta evita una migration prematura e conserva le relazioni esistenti di attempt,
progress e valutazione.

Formato futuro consigliato per `Lesson.content`, ancora dentro JSON:

```ts
type LessonContentV2 = {
  version: 2;
  steps: Array<ContentStep | ExerciseStepRef>;
};

type ContentStep = {
  id: string;
  type: "intro" | "concept" | "visual_model" | "reflection" | "summary" | "completion";
  title?: string;
  order: number;
  body?: string;
  required?: boolean;
  metadata?: Record<string, unknown>;
};

type ExerciseStepRef = {
  id: string;
  type: "exercise";
  title?: string;
  order: number;
  required?: boolean;
  exerciseId: string;
};
```

La tabella `Step` diventera' utile solo se servono query, authoring collaborativo, analytics o
progressione persistente su step non valutabili.

### Exercise

Persistenza corrente: `Exercise`.

Decisione: `Exercise` e' lo step valutabile persistito. Non va assorbito in `Lesson.content` ora,
perche' `ExerciseAttempt`, valutazione, progress e achievement dipendono da un `exerciseId`
stabile.

Mapping:

| Product Exercise Step         | Prisma Exercise                                                     |
| ----------------------------- | ------------------------------------------------------------------- |
| `step.type = "exercise"`      | Derivato dal fatto che esiste una riga `Exercise`.                  |
| `step.exercise.id`            | `Exercise.id`                                                       |
| `step.exercise.type`          | `Exercise.type`, mappato a casing domain/API.                       |
| `step.exercise.prompt`        | `Exercise.prompt`                                                   |
| `step.exercise.options`       | `Exercise.options`                                                  |
| `step.exercise.correctAnswer` | `Exercise.answer`                                                   |
| `step.exercise.steps`         | `Exercise.steps`                                                    |
| `step.exercise.points`        | `Exercise.points`                                                   |
| `step.order`                  | Per ora `Exercise.order` quando non esiste `LessonContentV2.steps`. |
| `required`                    | Default `true`; futuro flag nel content JSON o nella tabella step.  |

Solo i tipi exercise MVP del learning module (`multiple_choice`, `numeric_input`, `step_by_step`)
devono entrare nei nuovi DTO learning finche' gli evaluator non supportano gli altri tipi.

### Progress

Persistenza corrente: `Progress`.

Mapping:

| Product Progress            | Prisma Progress                                               |
| --------------------------- | ------------------------------------------------------------- |
| course progress             | Aggregazione di righe `Progress` per `courseId`.              |
| level progress              | Derivato dalle lesson del `Module`.                           |
| lesson progress             | `Progress` con `lessonId`.                                    |
| step progress               | Non persistito.                                               |
| exercise completion         | Derivato da `ExerciseAttempt` corrette distinte per exercise. |
| `locked` / `available`      | Derivati da prerequisiti e ordine, non persistiti.            |
| `in_progress` / `completed` | Persistiti per lesson; aggregabili per level/course.          |

La regola MVP resta: una lesson e' completata quando tutti gli esercizi richiesti sono completati
correttamente. Gli step non valutabili guidano l'esperienza ma non certificano completamento.

## Product Model -> API DTO

Gli endpoint esistenti possono restare compatibili. I DTO learning futuri dovrebbero introdurre il
vocabolario prodotto senza rinominare in-place i contratti gia' consumati.

### Course Path DTO

Fase 03A introduce il primo DTO applicativo read-only:

- endpoint: `GET /courses/:id/path`;
- mapper puro: `apps/api/src/modules/courses/course-path.mapper.ts`;
- tipi DTO: `apps/api/src/modules/courses/courses.types.ts`;
- fetch DB isolato in `CoursesRepository`, senza logica Prisma dentro il mapper.

Il mapper riceve un `Course` gia' caricato con `modules`, `lessons` ed `exercises`, piu'
progressione opzionale gia' letta dal service. Compone il path nel vocabolario prodotto:

```text
Course -> levels(Module) -> lessons(Lesson) -> steps(Lesson.content + Exercise)
```

`Subject` resta assente dal payload finche' non esiste una fonte editoriale o persistente stabile.
`Course.level` Prisma viene esposto come `difficulty`, mentre `Module` viene esposto come `Level`.

```ts
type CoursePathDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  subject?: SubjectRefDto;
  progress: LearningProgressDto;
  levels: LevelPathDto[];
};

type SubjectRefDto = {
  id: string;
  slug: string;
  title: string;
};

type LevelPathDto = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  progress: LearningProgressDto;
  lessons: LessonPathItemDto[];
};

type LessonPathItemDto = {
  id: string;
  levelId: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  progress: LearningProgressDto;
  stepCount: number;
  requiredExerciseCount: number;
  steps: LessonPathStepDto[];
};

type LessonPathStepDto =
  | {
      id: string;
      lessonId: string;
      type: "intro" | "concept" | "visual_model" | "reflection" | "summary" | "completion";
      title?: string;
      order: number;
      required: boolean;
      body?: string;
      metadata?: Record<string, unknown>;
      progress: LearningProgressDto;
    }
  | {
      id: string;
      lessonId: string;
      type: "exercise";
      title?: string;
      order: number;
      required: boolean;
      exercise: PublicLearningExerciseDto;
      progress: LearningProgressDto;
    };

type PublicLearningExerciseDto = {
  id: string;
  type: "multiple_choice" | "numeric_input" | "step_by_step";
  prompt: string;
  options?: Array<{ id: string; label: string; value: string }>;
  steps?: Array<{ id: string; prompt: string; hint?: string }>;
  unit?: string;
  points: number;
  explanation?: string;
};

type LearningProgressDto = {
  completedCount: number;
  totalCount: number;
  percent: number;
  status: "locked" | "available" | "in_progress" | "completed";
};
```

Mapping API:

- `levels` viene da `Course.modules`;
- `difficulty` viene da `Course.level`;
- `subject` resta assente finche' non esiste persistenza o una fonte editoriale stabile;
- `status` e `progress` sono derivati da `Progress`, `ExerciseAttempt`, ordine e prerequisiti.
- `steps` viene composto dal mapper API:
  - `LessonContentV2.steps`, quando `Lesson.content.version === 2`;
  - fallback legacy da `introduction`, `keyIdeas`, `visualExplanation`;
  - righe `Exercise` come step `exercise` valutabili.

Esempio abbreviato:

```json
{
  "id": "course-scientific-thinking",
  "slug": "foundations-of-scientific-thinking",
  "title": "Foundations of Scientific Thinking",
  "difficulty": "beginner",
  "progress": {
    "completedCount": 0,
    "totalCount": 1,
    "percent": 0,
    "status": "available"
  },
  "levels": [
    {
      "id": "module-thinking-like-a-scientist",
      "title": "Thinking Like a Scientist",
      "order": 1,
      "progress": {
        "completedCount": 0,
        "totalCount": 1,
        "percent": 0,
        "status": "available"
      },
      "lessons": [
        {
          "id": "lesson-observation-hypothesis-evidence",
          "slug": "observation-hypothesis-evidence",
          "progress": {
            "completedCount": 0,
            "totalCount": 3,
            "percent": 0,
            "status": "available"
          },
          "stepCount": 6,
          "requiredExerciseCount": 3,
          "steps": [
            {
              "id": "lesson-observation-hypothesis-evidence-intro",
              "type": "intro",
              "order": 1
            },
            {
              "id": "exercise-exercise-isolate-variable",
              "type": "exercise",
              "order": 4,
              "exercise": {
                "id": "exercise-isolate-variable",
                "type": "multiple_choice",
                "points": 10
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Lesson Player DTO

Fase 03B introduce il contratto read-only per riprodurre una singola lesson completa:

- endpoint: `GET /lessons/:id/player`;
- progress opzionale: `GET /lessons/:id/player?userId=...`;
- mapper puro: `apps/api/src/modules/lessons/lesson-player.mapper.ts`;
- tipi DTO: `apps/api/src/modules/lessons/lesson-player.types.ts`;
- nessuna modifica Prisma e nessuna dipendenza da React o rendering.

Il DTO player usa una discriminated union diversa dal Course Path. Il path resta una vista di
navigazione del corso; il player e' il contratto applicativo per la riproduzione step-by-step.

```ts
type LessonPlayerDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  order: number;
  course: {
    id: string;
    slug: string;
    title: string;
  };
  level: {
    id: string;
    title: string;
    order: number;
  };
  progress: LessonPlayerProgressDto;
  steps: LessonPlayerStepDto[];
};

type LessonPlayerStepDto =
  | {
      id: string;
      lessonId: string;
      type: "content";
      title?: string;
      order: number;
      required: boolean;
      progress: LessonPlayerStepProgressDto;
      content: {
        kind: "intro" | "concept" | "visual_model" | "reflection" | "summary" | "completion";
        body?: string;
        keyIdeas?: string[];
        visual?: {
          title?: string;
          description?: string;
          variables: Array<Record<string, unknown>>;
        };
        hints?: Array<{ id?: string; body: string }>;
        metadata?: Record<string, unknown>;
      };
    }
  | {
      id: string;
      lessonId: string;
      type: "quiz";
      title?: string;
      order: number;
      required: boolean;
      progress: LessonPlayerStepProgressDto;
      quiz: {
        id: string;
        exerciseType: "multiple_choice";
        prompt: string;
        options: Array<{ id: string; label: string; value: string }>;
        points: number;
        explanation?: string;
        hints?: Array<{ id?: string; body: string }>;
      };
    }
  | {
      id: string;
      lessonId: string;
      type: "exercise";
      title?: string;
      order: number;
      required: boolean;
      progress: LessonPlayerStepProgressDto;
      exercise:
        | {
            id: string;
            exerciseType: "numeric_input";
            prompt: string;
            unit?: string;
            points: number;
            explanation?: string;
            hints?: Array<{ id?: string; body: string }>;
          }
        | {
            id: string;
            exerciseType: "step_by_step";
            prompt: string;
            steps: Array<{ id: string; title?: string; prompt: string; hint?: string }>;
            points: number;
            explanation?: string;
            hints?: Array<{ id?: string; body: string }>;
          };
    }
  | {
      id: string;
      lessonId: string;
      type: "interactive";
      title?: string;
      order: number;
      required: boolean;
      progress: LessonPlayerStepProgressDto;
      interactive: {
        id: string;
        exerciseType: "drag_and_drop" | "interactive_visualization" | "simulation";
        prompt: string;
        options?: Array<{ id: string; label: string; value: string }>;
        visualization?: Record<string, unknown>;
        points: number;
        explanation?: string;
        hints?: Array<{ id?: string; body: string }>;
      };
    };

type LessonPlayerProgressDto = {
  completed: boolean;
  currentStepId?: string;
  completedStepIds: string[];
  completedCount: number;
  totalCount: number;
  percent: number;
  status: "locked" | "available" | "in_progress" | "completed";
  exercises: Array<{
    exerciseId: string;
    stepId: string;
    status: "not_started" | "attempted" | "completed";
    attempted: boolean;
    completed: boolean;
    result?: "success" | "failure";
  }>;
};

type LessonPlayerStepProgressDto = {
  status: "locked" | "available" | "in_progress" | "completed";
  locked: boolean;
  current: boolean;
  completed: boolean;
};
```

Mapping API:

- `level` viene da `Lesson.module`;
- `steps` viene da `Lesson.content` se contiene `LessonContentV2.steps`;
- in assenza di `LessonContentV2`, l'API genera una sequenza legacy:
  content `intro`, content `concept`, content `visual_model`, poi step da `Exercise[]`;
- `Exercise.MULTIPLE_CHOICE` diventa step `type: "quiz"`;
- `Exercise.NUMERIC_INPUT` e `Exercise.STEP_BY_STEP` diventano step `type: "exercise"`;
- i tipi persistenti futuri `DRAG_AND_DROP`, `INTERACTIVE_VISUALIZATION` e `SIMULATION` diventano
  step `type: "interactive"` senza introdurre engine visuale;
- `completedStepIds` e `exercise state` derivano da `Progress` ed `ExerciseAttempt`;
- gli step non valutabili possono essere marcati completati solo in modo derivato rispetto allo
  step corrente; non esiste ancora persistenza runtime per content step;
- `correctAnswer` e criteri privati non devono essere inclusi nei DTO pubblici.

Esempio completo abbreviato:

```json
{
  "id": "lesson-observation-hypothesis-evidence",
  "slug": "observation-hypothesis-evidence",
  "title": "Observation, Hypothesis, Evidence",
  "summary": "Use a simple pendulum experiment to separate observation from explanation.",
  "durationMinutes": 12,
  "order": 1,
  "course": {
    "id": "course-scientific-thinking",
    "slug": "foundations-of-scientific-thinking",
    "title": "Foundations of Scientific Thinking"
  },
  "level": {
    "id": "module-thinking-like-a-scientist",
    "title": "Thinking Like a Scientist",
    "order": 1
  },
  "progress": {
    "completed": false,
    "currentStepId": "lesson-observation-hypothesis-evidence-intro",
    "completedStepIds": [],
    "completedCount": 0,
    "totalCount": 3,
    "percent": 0,
    "status": "available",
    "exercises": [
      {
        "exerciseId": "exercise-isolate-variable",
        "stepId": "exercise-exercise-isolate-variable",
        "status": "not_started",
        "attempted": false,
        "completed": false
      }
    ]
  },
  "steps": [
    {
      "id": "lesson-observation-hypothesis-evidence-intro",
      "lessonId": "lesson-observation-hypothesis-evidence",
      "type": "content",
      "title": "Observation, Hypothesis, Evidence",
      "order": 1,
      "required": true,
      "progress": {
        "status": "available",
        "locked": false,
        "current": true,
        "completed": false
      },
      "content": {
        "kind": "intro",
        "body": "A pendulum is a clean system for practicing scientific reasoning because one visible motion depends on a small set of variables."
      }
    },
    {
      "id": "lesson-observation-hypothesis-evidence-visual-model",
      "lessonId": "lesson-observation-hypothesis-evidence",
      "type": "content",
      "title": "Pendulum period model",
      "order": 3,
      "required": true,
      "progress": {
        "status": "available",
        "locked": false,
        "current": false,
        "completed": false
      },
      "content": {
        "kind": "visual_model",
        "body": "For small angles, period depends mostly on length and gravity, not mass.",
        "visual": {
          "title": "Pendulum period model",
          "description": "For small angles, period depends mostly on length and gravity, not mass.",
          "variables": [
            { "symbol": "T", "label": "period" },
            { "symbol": "L", "label": "length" },
            { "symbol": "g", "label": "gravity" }
          ]
        }
      }
    },
    {
      "id": "exercise-exercise-isolate-variable",
      "lessonId": "lesson-observation-hypothesis-evidence",
      "type": "quiz",
      "title": "Exercise",
      "order": 4,
      "required": true,
      "progress": {
        "status": "available",
        "locked": false,
        "current": false,
        "completed": false
      },
      "quiz": {
        "id": "exercise-isolate-variable",
        "exerciseType": "multiple_choice",
        "prompt": "You change the pendulum length and measure a longer swing period. Which statement is the best scientific observation?",
        "options": [
          {
            "id": "b",
            "label": "The longer pendulum completed each swing in more time.",
            "value": "longer-period-observation"
          }
        ],
        "points": 10,
        "explanation": "The statement reports what changed without adding an unsupported cause. Explanation comes after controlled comparison."
      }
    }
  ]
}
```

### Attempt DTO

L'endpoint attempt futuro dovrebbe accettare ancora `exerciseId` come identificatore valutabile
canonico. `stepId` puo' essere opzionale per correlare l'esperienza UI:

```ts
type SubmitLearningAttemptInput = {
  userId?: string;
  lessonId: string;
  stepId?: string;
  exerciseId: string;
  answer: unknown;
};
```

La persistenza continua a scrivere `ExerciseAttempt.exerciseId`.

## Decisioni specifiche

### Subject

Decisione: rimandare l'introduzione DB/API di `Subject`.

Motivo: il modello prodotto ne ha bisogno per il catalogo futuro, ma il database attuale ha un solo
corso seed e nessuna UI di filtro per subject. La scelta piu' solida e' mantenere `Subject` nel
content/domain e introdurre persistenza quando esiste almeno un catalogo multi-subject o un
workflow editoriale che ne dipende.

### Level vs Module

Decisione: usare `Level` nel linguaggio prodotto e nei DTO futuri; mantenere `Module` come nome
Prisma e nome interno legacy.

Motivo: `Module` gia' modella l'ordinamento dentro un corso e contiene lesson. Rinominare ora
creerebbe migration churn senza sbloccare valore prodotto. L'API puo' fare da anticorruption layer:
legge `modules`, restituisce `levels` nei nuovi DTO.

### Step

Decisione: non creare una tabella `Step` ora. Usare content JSON per gli step non valutabili e
`Exercise` per gli step valutabili.

Motivo: gli step sono ancora principalmente una struttura di rendering e progressione didattica.
Le sole entita' che oggi richiedono identita' persistente, valutazione e tentativi sono gli
esercizi. Una tabella step diventera' giustificata quando servira' persistere posizione corrente,
completion di step non valutabili, analytics per step, authoring granulare o A/B test di sequenze.

### Exercise come step valutabile

Decisione: `Exercise` rimane una entita' persistita e viene esposto nel modello prodotto come
`LessonStep` di tipo `exercise`.

Motivo: questa scelta mantiene stabile `ExerciseAttempt`, evita duplicazione della risposta corretta
nel content JSON e conserva l'evaluator legacy. Nel DTO pubblico, l'esercizio e' annidato nello
step; nel DB resta una riga separata.

## Compatibilita'

- Non cambiare gli endpoint esistenti in-place: `/courses`, `/courses/:slug` e `/lessons/:id`
  possono continuare a restituire `modules`, `content` ed `exercises` finche' `apps/web` li usa.
- Introdurre DTO learning come nuova superficie o come versione esplicita. Fase 03A usa
  `GET /courses/:id/path` mantenendo compatibili `/courses`, `/courses/:slug` e `/lessons/:id`.
- Mantenere mapper espliciti API: Prisma `Module` -> DTO `Level`, Prisma `Course.level` -> DTO
  `difficulty`.
- Non esportare raw Prisma record dai controller.
- Mantenere `ExerciseAttempt.exerciseId` come riferimento canonico per la valutazione.
- Accettare una fase ibrida in cui legacy domain models e `packages/domain/src/learning` convivono.
- Limitare i nuovi DTO learning agli exercise types supportati dal learning evaluator MVP.

## Piano incrementale futuro

1. Documentazione: usare questa decisione come riferimento per API e persistence future.
2. Content JSON v2: aggiornare seed/content in una fase dedicata per descrivere step non valutabili
   dentro `Lesson.content`, senza cambiare schema.
3. API mapping read-only: aggiungere mapper che compongono `LessonPlayerDto.steps` da
   `Lesson.content` + `Exercise[]`.
4. Course path DTO: introdurre una superficie API che espone `levels` e stati derivati, mantenendo
   i DTO legacy. Completato in Fase 03A con `GET /courses/:id/path`.
5. Progress derivato: usare `packages/domain/src/learning/progress` per calcolare status e
   percentuali da attempt/progress esistenti.
6. Subject persistence: introdurre `Subject` solo quando il catalogo multi-subject o l'authoring lo
   richiede.
7. Step persistence: valutare una tabella `LessonStep` solo quando serve identita' DB per step non
   valutabili o progressione granulare persistita.
8. UI integration: far consumare ad `apps/web` i nuovi DTO learning dopo che API e seed sono
   stabili.
9. Cleanup legacy: rimuovere o adattare DTO `modules/content/exercises` solo dopo migrazione del
   frontend e test di compatibilita'.

## Non-goals

- Non modificare `schema.prisma`.
- Non creare migration Prisma.
- Non modificare seed DB.
- Non implementare endpoint.
- Non modificare `apps/web`.
- Non implementare componenti React.
- Non rinominare `Module` in `Level` nel database.
- Non introdurre tabella `Subject` o `Step`.
- Non cambiare la logica di valutazione o progressione esistente.
- Non risolvere autenticazione, authoring, analytics o browser e2e in questa fase.
