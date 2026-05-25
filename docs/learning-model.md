# Learning Model

Fase 02A definisce il modello prodotto e didattico di App Scientifica. L'obiettivo e' avere una
struttura stabile per progettare esperienza, contenuti, progressione e confini tecnici senza
introdurre ancora nuove migrazioni Prisma, API endpoint o componenti React complessi.

## Principio guida

La piattaforma insegna scienze attraverso percorsi progressivi, visuali e interattivi. Ogni parte
del prodotto deve aiutare lo studente a capire:

- dove si trova nel percorso;
- cosa puo' fare ora;
- cosa deve completare per sbloccare il passo successivo;
- quale competenza scientifica sta costruendo.

La gerarchia didattica di riferimento e':

```text
Subject -> Course -> Level -> Lesson -> Step
```

## Gerarchia prodotto

### Subject

Un subject e' una macro-area scientifica. Serve per organizzare il catalogo e per dare una cornice
mentale allo studente.

Esempi:

- Scientific Thinking
- Physics
- Chemistry
- Biology
- Earth Science

Responsabilita':

- raggruppa corsi correlati;
- espone una promessa formativa ampia;
- puo' avere colore, icona, descrizione e ordine nel catalogo;
- non contiene direttamente esercizi o progressione fine.

### Course

Un course e' un percorso completo intorno a una competenza scientifica misurabile.

Esempio: "Foundations of Scientific Thinking".

Responsabilita':

- appartiene a un subject;
- definisce titolo, slug, summary, description e durata stimata;
- contiene livelli ordinati;
- espone lo stato aggregato dello studente nel corso;
- ha un obiettivo formativo chiaro e completabile.

Nota sul codice attuale: `Course` esiste gia' nel dominio e in Prisma. Il subject non deve essere
aggiunto ora allo schema; in questa fase e' una decisione di modello e documentazione.

### Level

Un level e' un milestone ordinato dentro un course. Rappresenta una soglia di difficolta' o di
competenza, non solo una cartella di contenuti.

Esempi:

- Level 1: Observe and describe
- Level 2: Build hypotheses
- Level 3: Test variables

Responsabilita':

- contiene lezioni ordinate;
- dichiara prerequisiti e criterio di completamento;
- puo' essere locked, available, in_progress o completed;
- rende visibile l'avanzamento nel learning path.

Nota sul codice attuale: `Module` oggi svolge il ruolo tecnico piu' vicino a `Level`. Per Fase 02A
si puo' considerare `Module` come equivalente provvisorio di `Level` nella documentazione di
prodotto, senza rinominare tabelle o tipi.

### Lesson

Una lesson introduce una singola idea scientifica e guida lo studente attraverso un'esperienza
interattiva.

Responsabilita':

- appartiene a un level;
- ha titolo, slug, summary, durata stimata e ordine;
- contiene contenuto strutturato;
- contiene step ordinati;
- produce progressione tramite completamento degli step valutabili;
- puo' terminare in una schermata di Lesson Complete.

Nel codice attuale `Lesson` contiene `content` e `exercises`. La Fase 02A introduce il concetto
prodotto di `Step` come unita' didattica renderizzabile. Gli esercizi restano il tipo di step
valutabile.

### Step

Uno step e' l'unita' atomica dell'esperienza didattica dentro una lesson. Ogni step deve avere uno
scopo chiaro: spiegare, mostrare, chiedere, far manipolare, valutare o chiudere.

Tipi iniziali di step:

- `intro`: contesto breve e obiettivo della lesson;
- `concept`: spiegazione testuale o visuale;
- `visual_model`: diagramma, simulazione o modello interattivo;
- `exercise`: esercizio valutabile;
- `reflection`: domanda non necessariamente valutata;
- `summary`: sintesi finale;
- `completion`: conferma di completamento e prossima azione.

Regola pratica: una lesson non dovrebbe essere un blocco lungo di contenuto. Deve essere una
sequenza di step brevi, con almeno uno step in cui lo studente agisce.

## Esperienze principali

### Home

La home e' l'ingresso narrativo e operativo. Non deve essere solo una landing page decorativa.

Deve mostrare:

- promessa del prodotto: apprendimento scientifico visuale e interattivo;
- call to action verso il catalogo corsi;
- accesso rapido a demo o percorso consigliato;
- eventuale ripresa del percorso in corso quando esiste progressione utente;
- segnali di metodo: osserva, modella, testa, verifica.

Stati rilevanti:

- utente senza progressione: mostra percorso consigliato e demo;
- utente con progressione: mostra "continue learning";
- utente con corsi completati: mostra prossimo corso o review.

### Courses Catalog

Il catalogo corsi organizza l'offerta per subject e course.

Deve permettere allo studente di capire rapidamente:

- argomento del corso;
- livello iniziale o difficolta' generale;
- durata stimata;
- numero di level e lesson;
- stato personale del corso;
- prossimo punto utile da cui iniziare o riprendere.

Filtri iniziali possibili, senza implementarli ora:

- subject;
- difficolta';
- stato: not_started, in_progress, completed;
- durata.

### Course Path / Learning Path

Il course path mostra la sequenza `Level -> Lesson -> Step` in forma navigabile. E' la vista piu'
importante per la progressione.

Deve mostrare:

- livelli ordinati;
- lezioni dentro ogni livello;
- stato di ogni livello e lezione;
- prerequisiti visibili quando un elemento e' locked;
- percentuale di completamento del corso;
- prossima lesson raccomandata.

Regola di prodotto:

- lo studente puo' vedere il percorso completo;
- lo studente puo' aprire solo contenuti `available`, `in_progress` o `completed`;
- un contenuto `locked` deve spiegare cosa serve per sbloccarlo.

### Lesson Player

Il lesson player e' l'ambiente operativo in cui lo studente segue gli step.

Deve contenere:

- intestazione con course, level, lesson title e durata;
- indicatore di posizione nella lesson;
- area principale per rendering dello step corrente;
- feedback contestuale dopo gli esercizi;
- navigazione step precedente/successivo dove consentita;
- salvataggio progressivo dello stato;
- azione chiara per continuare dopo risposta corretta o step completato.

Comportamento didattico:

- aprire con obiettivo breve;
- alternare visualizzazione e azione;
- fornire feedback immediato sugli esercizi valutabili;
- evitare spiegazioni lunghe prima della prima interazione;
- chiudere con sintesi e prossima azione.

### Lesson Complete

La schermata Lesson Complete conferma il risultato e orienta il passo successivo.

Deve mostrare:

- lesson completata;
- score o risultato sintetico, se disponibile;
- competenze esercitate;
- eventuali achievement sbloccati;
- prossima lesson disponibile;
- opzione per rivedere la lesson o tornare al course path.

Regola di completamento iniziale:

- una lesson e' completed quando tutti gli esercizi valutabili richiesti sono completati
  correttamente;
- gli step non valutabili contribuiscono alla posizione e all'esperienza, ma non bastano da soli a
  certificare completamento.

## Progressione

La progressione deve essere derivabile da eventi di apprendimento, non solo da click di navigazione.

Eventi iniziali:

- lesson started;
- step viewed;
- exercise attempted;
- exercise completed;
- lesson completed;
- level completed;
- course completed;
- achievement unlocked.

Metriche iniziali:

- esercizi completati su esercizi totali;
- percentuale lesson;
- percentuale level;
- percentuale course;
- last step o last exercise;
- updated at.

Il modello attuale `Progress` misura esercizi completati, totale, percentuale e status. Questa base
resta valida per la prima fase, ma il modello prodotto richiede in futuro progressione piu' fine a
livello di step.

## Stati di accesso e completamento

Gli stati di prodotto sono:

- `locked`: non accessibile perche' manca un prerequisito;
- `available`: accessibile, ma non ancora iniziato;
- `in_progress`: iniziato e non completato;
- `completed`: completato secondo il criterio dell'elemento.

Questi stati si applicano a course, level, lesson e step, con significato leggermente diverso.

| Stato | Course | Level | Lesson | Step |
| --- | --- | --- | --- | --- |
| `locked` | raro, usato per prerequisiti tra corsi | prerequisito non completato | lesson precedente richiesta | step precedente richiesto |
| `available` | iscrivibile o iniziabile | primo level o level sbloccato | apribile | pronto da svolgere |
| `in_progress` | almeno una lesson iniziata | almeno una lesson iniziata | almeno uno step o esercizio iniziato | visualizzato o tentato |
| `completed` | tutti i level richiesti completati | tutte le lesson richieste completate | esercizi richiesti completati | step richiesto completato |

Regole iniziali di sblocco:

1. Il primo level del corso e' `available`.
2. Il primo lesson del primo level e' `available`.
3. Una lesson successiva diventa `available` quando la lesson precedente nello stesso level e'
   `completed`.
4. Un level successivo diventa `available` quando il level precedente e' `completed`.
5. Gli step dentro una lesson sono sequenziali per default.
6. Un contenuto `completed` resta riapribile per review.

## Tipi iniziali di esercizi

Gli esercizi sono step valutabili. I tipi MVP implementati nei tipi puri del dominio sono:

- `multiple_choice`: scelta singola o multipla guidata da opzioni;
- `numeric_input`: risposta numerica con eventuale tolleranza;
- `step_by_step`: ragionamento guidato in passaggi.

Tipi futuri da progettare ma non implementare in Fase 02A/02C:

- `drag_and_drop`: ordinamento, classificazione o associazione;
- `interactive_visualization`: risposta legata a un modello manipolabile;
- `simulation`: esperimento o scenario interattivo con parametri;
- `expression_builder`: costruzione guidata di formule, espressioni o relazioni.

Priorita' didattica iniziale:

1. `multiple_choice` per verificare distinzione concettuale rapida.
2. `numeric_input` per formule, stime e grandezze.
3. `step_by_step` per rendere visibile il ragionamento.
4. Tipi interattivi futuri quando esiste un bisogno didattico specifico, non come decorazione.

Ogni esercizio deve definire:

- prompt;
- tipo;
- eventuali opzioni, step o metadati visuali;
- risposta corretta o criterio di valutazione;
- punti;
- feedback o explanation;
- ordine nella lesson.

## Separazione delle responsabilita'

Il modello deve mantenere separati contenuto, dominio, rendering e persistenza.

### Content

Il content descrive cosa deve essere insegnato.

Include:

- subject, course, level, lesson e step;
- testo didattico;
- prompt;
- opzioni;
- metadati visuali;
- spiegazioni;
- criteri di completamento dichiarativi quando possibile.

Non deve contenere:

- componenti React;
- query database;
- logica di autorizzazione;
- chiamate API;
- dettagli di layout specifici.

### Domain

Il domain descrive regole pure e portabili.

Include:

- tipi condivisi;
- stati di progressione;
- regole di sblocco;
- valutazione esercizi;
- calcolo percentuali;
- criteri di completamento;
- normalizzazione dei risultati.

Non deve dipendere da:

- React;
- NestJS;
- Prisma;
- browser API;
- variabili ambiente.

### Rendering

Il rendering trasforma content e stato in interfaccia.

Include:

- pagine Next.js;
- lesson player;
- componenti visuali;
- input esercizi;
- feedback panel;
- progress indicator;
- course path UI.

Non deve possedere:

- verita' persistente della progressione;
- valutazione definitiva delle risposte;
- regole di sblocco non replicate dal domain.

### Persistence

La persistence salva stato e contenuto in forma interrogabile.

Include:

- utenti;
- corsi;
- livelli o moduli;
- lezioni;
- esercizi o step;
- attempt;
- progress;
- achievement.

Non deve determinare da sola:

- logica didattica;
- valutazione di risposte;
- decisioni di rendering;
- significato prodotto degli stati.

## Mappatura con l'architettura attuale

| Concetto prodotto | Stato attuale | Nota |
| --- | --- | --- |
| Subject | non modellato | Da introdurre in una fase successiva se il catalogo cresce. |
| Course | `Course` | Gia' presente in domain, API e Prisma. |
| Level | `Module` | Equivalente tecnico provvisorio. Non rinominare in Fase 02A. |
| Lesson | `Lesson` | Gia' presente con content JSON ed exercises. |
| Step | parziale | Oggi gli esercizi sono la sequenza interattiva principale; gli step generali sono modello prodotto. |
| Exercise | `Exercise` | Gia' presente come unita' valutabile. |
| Attempt | `ExerciseAttempt` | Gia' presente come evento append-only. |
| Progress | `Progress` | Gia' presente a livello course/lesson, da estendere in futuro per step. |
| Achievement | `Achievement` | Gia' separato dalla progressione core. |

## Decisioni per Fase 02A

- Usare `Subject -> Course -> Level -> Lesson -> Step` come linguaggio prodotto.
- Considerare `Module` come implementazione temporanea di `Level`.
- Considerare `Exercise` come uno specifico tipo di `Step` valutabile.
- Mantenere la progressione iniziale basata su esercizi completati.
- Progettare UI e contenuti pensando a stati `locked`, `available`, `in_progress`, `completed`.
- Non introdurre ora nuove tabelle, endpoint o componenti complessi.
- Documentare prima le regole, poi implementarle in fasi successive.

## Fasi successive consigliate

1. Allineare `docs/content-model.md` al linguaggio `Subject -> Course -> Level -> Lesson -> Step`.
2. Introdurre tipi domain puri per `LearningStatus`, `LearningNode` e regole di sblocco.
3. Disegnare DTO API per course path con progressione aggregata.
4. Valutare se rinominare `Module` in `Level` oppure mantenere `Module` come dettaglio interno.
5. Estendere persistenza solo quando le regole di prodotto sono stabili.
