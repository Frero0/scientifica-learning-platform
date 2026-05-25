# Content Model

Fase 02C definisce come descrivere i contenuti didattici di App Scientifica usando il learning
model:

```text
Subject -> Course -> Level -> Lesson -> Step
```

Questo documento e' una specifica di contenuto, non una richiesta di migrazione tecnica. In questa
fase non modifica Prisma, API endpoint, `apps/web` o componenti React. I tipi puri di riferimento
sono quelli in `packages/domain/src/learning`.

## Principi

Un contenuto didattico deve essere:

- dichiarativo: descrive cosa insegnare, cosa mostrare e cosa chiedere, non come renderizzarlo;
- ordinato: ogni nodo ha una posizione stabile nel percorso;
- valutabile dove serve: gli esercizi espongono risposte, criteri e feedback;
- portabile: puo' essere letto da domain, API e frontend senza dipendere da React o Prisma;
- progressivo: alterna spiegazione, modello visuale, azione, feedback e sintesi.

## Gerarchia

### Subject

Un `Subject` e' una macro-area scientifica. Organizza il catalogo e aiuta lo studente a scegliere
una direzione.

Contiene:

- `id`, `slug`, `title`;
- `summary` e opzionale `description`;
- metadati editoriali come `color`, `icon`, `order`;
- corsi correlati.

Non contiene direttamente step, esercizi o progressione fine.

### Course

Un `Course` e' un percorso completo intorno a una competenza scientifica misurabile.

Contiene:

- riferimento al subject, quando disponibile;
- `slug`, `title`, `summary`, opzionale `description`;
- durata stimata;
- prerequisiti dichiarativi;
- livelli ordinati.

Il course non deve contenere direttamente esercizi. La progressione aggregata del corso deriva dai
level e dalle lesson.

### Level

Un `Level` e' un milestone ordinato dentro un course. Rappresenta una soglia di difficolta' o una
competenza intermedia.

Contiene:

- `title`, opzionale `slug`, `summary`, `description`;
- `order`;
- prerequisiti dichiarativi;
- lesson ordinate.

Nota di compatibilita': nell'architettura corrente `Module` e' l'equivalente tecnico provvisorio di
`Level`. Il content model usa `Level` come linguaggio prodotto senza richiedere rinomini Prisma.

### Lesson

Una `Lesson` introduce una singola idea scientifica e guida lo studente in una sequenza breve di
step.

Contiene:

- `id`, `levelId`, `slug`, `title`;
- `summary`, `durationMinutes`, `order`;
- prerequisiti dichiarativi;
- `steps` ordinati.

Una lesson non dovrebbe essere un articolo lungo. Deve costruire una micro-esperienza: contesto,
concetto, modello visuale o esempio, azione dello studente, feedback, sintesi.

### Step

Uno `Step` e' l'unita' atomica renderizzabile dentro una lesson.

Campi comuni consigliati:

```ts
type LessonStep = {
  id: string;
  lessonId?: string;
  type: LessonStepType;
  title?: string;
  order: number;
  required?: boolean;
  metadata?: Record<string, unknown>;
};
```

`required` indica se lo step contribuisce al completamento. Nel dominio attuale il completamento
della lesson e' calcolato sugli esercizi richiesti.

## Tipi di Step

I tipi iniziali sono:

- `intro`: apre la lesson con contesto, obiettivo e promessa concreta;
- `concept`: spiega una singola idea con testo breve, esempi o formule;
- `visual_model`: descrive un diagramma, modello o simulazione in forma dichiarativa;
- `exercise`: contiene un esercizio valutabile;
- `reflection`: chiede allo studente di formulare un'osservazione o previsione, anche non valutata;
- `summary`: riassume cio' che e' stato costruito;
- `completion`: chiude la lesson e orienta alla prossima azione.

Regole editoriali:

- ogni lesson deve avere almeno uno step in cui lo studente agisce;
- ogni step deve avere un solo scopo principale;
- le spiegazioni devono essere brevi e collegate allo step successivo;
- uno step visuale non deve richiedere codice UI dentro il content.

## Struttura consigliata di una Lesson

Sequenza raccomandata per una lesson MVP:

1. `intro`: perche' questo concetto serve.
2. `concept`: definizione o principio.
3. `visual_model`: rappresentazione dichiarativa del fenomeno.
4. `exercise`: verifica rapida, spesso `multiple_choice` o `numeric_input`.
5. `exercise`: ragionamento guidato, se utile, con `step_by_step`.
6. `reflection`: previsione, confronto o domanda metacognitiva.
7. `summary`: concetti chiave e linguaggio scientifico corretto.
8. `completion`: stato finale e prossima lesson.

La struttura puo' essere piu' corta, ma non dovrebbe saltare insieme spiegazione, azione e feedback.

## Esercizi MVP

Gli esercizi sono step di tipo `exercise`. I tipi implementati nei tipi puri del domain sono:

- `multiple_choice`;
- `numeric_input`;
- `step_by_step`.

Campi comuni:

```ts
type BaseExercise = {
  id: string;
  type: "multiple_choice" | "numeric_input" | "step_by_step";
  prompt: string;
  points: number;
  explanation?: string;
};
```

### multiple_choice

Usato per distinguere concetti, interpretare osservazioni o scegliere una conclusione.

```ts
type MultipleChoiceExercise = {
  id: string;
  type: "multiple_choice";
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
};
```

Regole:

- usare `value` stabile e non dipendente dal testo visibile;
- supportare scelta singola o multipla tramite `correctAnswer`;
- scrivere distrattori plausibili, non risposte ovviamente sbagliate.

### numeric_input

Usato per grandezze, formule, stime e misure.

```ts
type NumericInputExercise = {
  id: string;
  type: "numeric_input";
  prompt: string;
  correctAnswer: number | {
    value: number;
    tolerance?: number;
  };
  points: number;
  explanation?: string;
  unit?: string;
};
```

Regole:

- indicare sempre l'unita' quando la grandezza la richiede;
- usare `tolerance` per misure, arrotondamenti o simulazioni;
- evitare prompt ambigui su formato e precisione.

### step_by_step

Usato per rendere visibile un ragionamento scientifico in passaggi.

```ts
type StepByStepExercise = {
  id: string;
  type: "step_by_step";
  prompt: string;
  steps: Array<{
    id: string;
    prompt: string;
    expectedAnswer?: unknown;
    hint?: string;
  }>;
  points: number;
  explanation?: string;
};
```

Regole:

- ogni sotto-step deve chiedere un'operazione chiara;
- `expectedAnswer` puo' restare flessibile finche' la valutazione per-step non e' completa;
- `hint` e' il primo livello di aiuto, non la soluzione completa.

## Tipi futuri non implementati ora

Questi tipi vanno documentati come direzione, ma non aggiunti ai tipi domain o agli evaluator in
questa fase:

- `drag_and_drop`: ordinamento, classificazione o associazione;
- `interactive_visualization`: risposta legata alla manipolazione di un modello;
- `simulation`: esperimento con parametri, osservazioni e risultato;
- `expression_builder`: costruzione guidata di formule, espressioni o relazioni.

Finche' non sono implementati, possono essere descritti solo come metadati dichiarativi dentro
`visual_model` o come note editoriali. Non devono comparire come `LearningExerciseType` MVP.

## Feedback

Il modello MVP del domain espone `EvaluationResult`:

```ts
type EvaluationResult = {
  correct: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  expectedAnswer?: unknown;
};
```

Nel content, l'autore deve fornire almeno una `explanation` sugli esercizi. Il domain puo' usarla
come feedback positivo o come spiegazione finale. Il feedback deve:

- spiegare il perche', non solo dire corretto o sbagliato;
- rimandare al concetto o al modello visuale precedente;
- evitare di introdurre un concetto nuovo durante la correzione;
- essere specifico per il tipo di errore quando una fase futura supportera' feedback piu' ricco.

Struttura futura possibile, da non implementare ora:

```ts
type FeedbackModel = {
  correct: string;
  incorrect: string;
  commonMistakes?: Array<{
    when: string;
    message: string;
  }>;
};
```

## Hint progressivi

Gli hint aiutano senza sostituire il ragionamento. Il domain MVP supporta `hint` nei sotto-step di
`step_by_step`; per gli altri esercizi gli hint possono essere descritti nel content come estensione
dichiarativa futura.

Modello consigliato:

```ts
type ProgressiveHints = Array<{
  id: string;
  level: 1 | 2 | 3;
  body: string;
  reveals?: "concept" | "method" | "partial_answer";
}>;
```

Regole:

- hint 1: orienta al concetto rilevante;
- hint 2: suggerisce il metodo o il passaggio;
- hint 3: rivela una parte della soluzione, non tutto il risultato quando possibile.

## Solution e Guided Solution

`solution` descrive la risposta o spiegazione finale. `guidedSolution` descrive il percorso per
arrivarci.

Modello dichiarativo consigliato:

```ts
type SolutionModel = {
  finalAnswer?: unknown;
  explanation: string;
  guidedSolution?: Array<{
    id: string;
    title?: string;
    body: string;
  }>;
};
```

Nel MVP, `correctAnswer` e `explanation` restano i campi supportati dal domain. `guidedSolution` e'
una convenzione editoriale da usare nel content solo dove serve preparare future esperienze guidate.

## Visual Model e simulazioni dichiarative

Uno step `visual_model` deve descrivere il modello scientifico, non il componente React che lo
renderizza.

Struttura consigliata:

```ts
type VisualModelMetadata = {
  model: "diagram" | "graph" | "table" | "simulation";
  concept: string;
  variables?: Array<{
    id: string;
    label: string;
    unit?: string;
    defaultValue?: number | string | boolean;
    min?: number;
    max?: number;
    step?: number;
  }>;
  relationships?: Array<{
    id: string;
    description: string;
    expression?: string;
  }>;
  observations?: string[];
};
```

Esempio:

```ts
{
  type: "visual_model",
  title: "How distance changes with time",
  body: "Move the time value and observe how distance changes at constant speed.",
  metadata: {
    model: "simulation",
    concept: "constant_speed",
    variables: [
      { id: "speed", label: "Speed", unit: "m/s", defaultValue: 2, min: 0, max: 10, step: 1 },
      { id: "time", label: "Time", unit: "s", defaultValue: 5, min: 0, max: 20, step: 1 }
    ],
    relationships: [
      { id: "distance", description: "Distance equals speed multiplied by time.", expression: "d = v * t" }
    ],
    observations: [
      "At constant speed, doubling time doubles distance.",
      "The graph is a straight line through the origin."
    ]
  }
}
```

Rendering, animazioni, slider, canvas e librerie visuali appartengono a `apps/web`, non al content.

## Content vs Domain

### Deve stare nel content

- titoli, slug, summary e ordine;
- testo didattico e prompt;
- opzioni e risposte corrette;
- spiegazioni, hint e solution dichiarative;
- metadati visuali e scientifici;
- prerequisiti dichiarativi;
- informazioni editoriali come durata stimata e difficolta'.

### Deve stare nel domain

- tipi condivisi;
- stati `locked`, `available`, `in_progress`, `completed`;
- calcolo percentuali;
- regole pure di sblocco;
- valutazione degli esercizi supportati;
- normalizzazione del risultato;
- criteri di completamento basati su step o esercizi richiesti.

### Non deve stare nel content

- componenti React o nomi di componenti;
- classi CSS, breakpoint o layout specifici;
- query Prisma;
- chiamate API;
- logica di sessione o autorizzazione;
- funzioni JavaScript da eseguire lato client;
- stato persistente di attempt, progress o achievement.

## Lesson Player API DTO

Il content model non e' il contratto diretto del futuro player. Il boundary stabile e':

```text
persistence -> domain/application mapper -> API DTO -> future UI renderer
```

`Lesson.content` e `Exercise` sono input persistenti. Il mapper API produce `LessonPlayerDto`, che
espone una discriminated union di step pensata per il player:

- `type: "content"` per testo, concetti, visual explanation, summary e completion;
- `type: "quiz"` per multiple choice;
- `type: "exercise"` per input numerici e step-by-step;
- `type: "interactive"` per simulazioni e visualizzazioni future, senza imporre un engine UI.

Il DTO puo' includere `hints`, `progress`, `locked`, `current`, `completed`, `success/failure`
minimale sugli esercizi e metadati visuali dichiarativi. Non include `correctAnswer`,
`expectedAnswer`, componenti React o istruzioni di rendering.

## Mini lesson completa

Esempio TypeScript-like allineato ai tipi puri MVP:

```ts
const subject = {
  id: "subject-scientific-thinking",
  slug: "scientific-thinking",
  title: "Scientific Thinking",
  summary: "Learn how to observe, model and test scientific ideas.",
  order: 1,
  courses: [
    {
      id: "course-foundations",
      subjectId: "subject-scientific-thinking",
      slug: "foundations-of-scientific-thinking",
      title: "Foundations of Scientific Thinking",
      summary: "Build the habits used to reason about scientific systems.",
      estimatedMinutes: 90,
      order: 1,
      levels: [
        {
          id: "level-observe",
          courseId: "course-foundations",
          slug: "observe-and-describe",
          title: "Observe and Describe",
          summary: "Turn visible patterns into precise scientific statements.",
          order: 1,
          lessons: [
            {
              id: "lesson-constant-speed",
              levelId: "level-observe",
              slug: "constant-speed",
              title: "Constant Speed",
              summary: "Use a simple model to connect speed, time and distance.",
              durationMinutes: 12,
              order: 1,
              steps: [
                {
                  id: "step-intro",
                  type: "intro",
                  title: "What changes when motion is steady?",
                  order: 1,
                  body: "You will compare speed, time and distance in a constant-speed model."
                },
                {
                  id: "step-concept",
                  type: "concept",
                  title: "Constant speed",
                  order: 2,
                  body: "An object has constant speed when it covers equal distances in equal times."
                },
                {
                  id: "step-model",
                  type: "visual_model",
                  title: "Distance over time",
                  order: 3,
                  body: "Change time while speed stays fixed and observe the distance.",
                  metadata: {
                    model: "simulation",
                    concept: "constant_speed",
                    variables: [
                      { id: "speed", label: "Speed", unit: "m/s", defaultValue: 2, min: 0, max: 10, step: 1 },
                      { id: "time", label: "Time", unit: "s", defaultValue: 5, min: 0, max: 20, step: 1 }
                    ],
                    relationships: [
                      { id: "distance", description: "Distance equals speed multiplied by time.", expression: "d = v * t" }
                    ]
                  }
                },
                {
                  id: "step-check",
                  type: "exercise",
                  title: "Read the model",
                  order: 4,
                  required: true,
                  exercise: {
                    id: "exercise-distance-mc",
                    type: "multiple_choice",
                    prompt: "If speed stays constant and time doubles, what happens to distance?",
                    options: [
                      { id: "a", label: "Distance doubles", value: "doubles" },
                      { id: "b", label: "Distance stays the same", value: "same" },
                      { id: "c", label: "Distance becomes zero", value: "zero" }
                    ],
                    correctAnswer: "doubles",
                    points: 1,
                    explanation: "At constant speed, distance is proportional to time."
                  }
                },
                {
                  id: "step-calculate",
                  type: "exercise",
                  title: "Calculate distance",
                  order: 5,
                  required: true,
                  exercise: {
                    id: "exercise-distance-number",
                    type: "numeric_input",
                    prompt: "A cart moves at 3 m/s for 4 s. What distance does it travel?",
                    correctAnswer: { value: 12, tolerance: 0 },
                    unit: "m",
                    points: 1,
                    explanation: "Use d = v * t, so 3 * 4 = 12 m."
                  }
                },
                {
                  id: "step-guided",
                  type: "exercise",
                  title: "Explain the reasoning",
                  order: 6,
                  required: true,
                  exercise: {
                    id: "exercise-distance-steps",
                    type: "step_by_step",
                    prompt: "Show how to find distance from speed and time.",
                    points: 2,
                    explanation: "The relationship is multiplicative: distance = speed * time.",
                    steps: [
                      {
                        id: "guided-1",
                        prompt: "Identify the speed and time.",
                        expectedAnswer: { speed: 3, time: 4 },
                        hint: "Look for the values with units m/s and s."
                      },
                      {
                        id: "guided-2",
                        prompt: "Choose the relationship.",
                        expectedAnswer: "d = v * t",
                        hint: "Distance grows with both speed and time."
                      }
                    ]
                  }
                },
                {
                  id: "step-reflect",
                  type: "reflection",
                  title: "Predict",
                  order: 7,
                  body: "What would the graph look like if speed were higher but still constant?"
                },
                {
                  id: "step-summary",
                  type: "summary",
                  title: "Key idea",
                  order: 8,
                  body: "For constant speed, distance increases in direct proportion to time."
                },
                {
                  id: "step-complete",
                  type: "completion",
                  title: "Lesson complete",
                  order: 9,
                  body: "You can now use a simple model to connect speed, time and distance."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
```

## Non-goals della fase

Fase 02C non include:

- modifiche Prisma o nuove migrazioni;
- rinomina tecnica di `Module` in `Level`;
- nuovi endpoint API;
- modifiche a `apps/web`;
- componenti React per lesson player o visual model;
- implementazione dei tipi futuri di esercizio;
- evaluator avanzati per simulazioni, drag and drop o expression builder;
- persistenza fine dello stato di ogni step;
- refactor pesanti del domain.
