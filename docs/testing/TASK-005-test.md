# TASK-005 Test Plan and Results

## Scope

- Task ID: TASK-005
- Phase: Regression fix validation
- Candidate Type: staged diff

## Preconditions

1. Frontend dependencies are installed in `RDisplay/`.
2. The staged TASK-005 candidate is present in the working tree.
3. Local development server can be started for browser verification.

## Run Commands

1. `cd RDisplay && npm run build`
2. `cd RDisplay && npm run dev`

## Automated Checks

1. `cd RDisplay && npm run build` — PASS

## Manual Verification Steps (Polish)

1. Uruchom `cd RDisplay && npm run dev`.
2. Otwórz stronę główną z okazjami i najedź myszą na kilka kafelków. Sprawdź, że cały kafelek, także dolny pas z ikoną akcji, zachowuje się spójnie i nie pojawia się podświetlenie tylko na górnej części.
3. Przejdź po kafelkach klawiszem `Tab`. Sprawdź, że aktywny kafelek ma wyraźny focus outline.
4. Kliknij środkowym przyciskiem myszy kafelek z okazją. Sprawdź, że Explorer otwiera się w nowej karcie.
5. Kliknij środkowym przyciskiem myszy kafelek Last Minute. Sprawdź, że Explorer otwiera się w nowej karcie.
6. W Explorerze sprawdź sekcję `Liczba osób` po wejściu zwykłą nawigacją i po wejściu z kafelka. Sprawdź, że opcje nie znikają i można wybrać co najmniej dostępne wartości z konfiguracji.
7. Zmień trasę lub lotnisko w Explorerze na inne. Sprawdź, że jeśli dotychczas wybrana liczba osób nie pasuje do nowych opcji, to wybór zostaje wyczyszczony zamiast zostawić nieprawidłowy stan.

## Expected Result

Cards behave like real links without partial hover artifacts, keyboard focus remains visible, middle-click opens Explorer in a new tab, and the person-count selector stays usable even when CSV discovery is delayed or unavailable.

## Result

- Status: PASS
- Manual Testing Required: no
- Manual Test Readiness: complete
- Preconditions Recorded: yes
- Notes: Automated build validation passed. The user confirmed the final browser interaction behavior works as expected.
