/* ==========================================================================
   1. GESTIONE SETTIMANA MINIMA
   ========================================================================== */

function initializeMinWeek() {
    // 1. Prendere la settimana minima dal valore incluso nell'id input
    const input = document.getElementById('settimana_eventi');

    // 2. Calcolo della settimana corrente
    // Calcolo del lunedì della settimana corrente (+6 /7) e spostamento al giovedì (+3) [mediana settimana]
    const now = new Date();
    const dayNum = (now.getUTCDay() + 6) % 7;
    now.setUTCDate(now.getUTCDate() - dayNum + 3);

    // Definizione variabili di anno corrente, del giovedì più vicino e dell'inizio dell'anno
    const year = now.getUTCFullYear();
    const firstThursday = now.getTime();
    const startOfYear = new Date(year, 0, 1);

    // Calcolo del primo giovedì dell'anno con sua sottrazione dal giovedì più vicino / millisecondi nella settimana
    const firstThursdayOfYear = new Date(year, 0, 1 + ((4 - startOfYear.getDay() + 7) % 7));
    const weekNum = 1 + Math.round((firstThursday - firstThursdayOfYear) / 604800000);

    // Formattazione per l'inserimento in attributo
    const currentWeekStr = `${year}-W${weekNum.toString().padStart(2, '0')}`;

    // 3. Sostituzione dinamica del valore minimo della settimana
    if (currentWeekStr > input.min) {
        input.min = currentWeekStr;
    }
}

/* ==========================================================================
   2. VALIDAZIONE COMPILAZIONE FORM
   ========================================================================== */

function setupValidation() {
    const form = document.getElementById('workshopForm');
    const btn = document.querySelector('.Prenota');

    form.addEventListener('input', () => {
        // checkValidity() restituisce true se tutti i campi "required" sono completi
        btn.disabled = !form.checkValidity();
    });
}

/* ==========================================================================
   3. GENERAZIONE JSON E STORAGE
   ========================================================================== */

function setupSubmission() {
    const form = document.getElementById('workshopForm');
    const btn = document.querySelector('.Prenota'); // mapped from 'btn' in original scope
    const workshopTitle = document.querySelector('.Descrizione h2').textContent;

    // Caricamento localStorage o apertura nuovo array se vuoto
    let prenotazioni = JSON.parse(localStorage.getItem('databasePrenotazioni')) || [];

    // Creazione variabile per la nuova prenotazione
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);

        const nuovaPrenotazione = {
            "settimana_eventi": formData.get('settimana_eventi'),
            "workshop": workshopTitle,
            "turno": formData.get('turno'),
            "nome": formData.get('nome'),
            "cognome": formData.get('cognome'),
            "email": formData.get('email')
        };

        // Controllo se la nuova prenotazione è in realtà già presente in localStorage
        const isDuplicate = prenotazioni.some(p =>
            p.email === nuovaPrenotazione.email &&
            p.settimana_eventi === nuovaPrenotazione.settimana_eventi &&
            p.turno === nuovaPrenotazione.turno &&
            p.workshop === nuovaPrenotazione.workshop
        );

        if (isDuplicate) {
            alert("La tua prenotazione risulta già presente, pertanto non è stata registrata.");
        } else {
            // Aggiunta al database e salvataggio in local storage
            prenotazioni.push(nuovaPrenotazione);
            localStorage.setItem('databasePrenotazioni', JSON.stringify(prenotazioni));
            alert("La tua prenotazione è stata registrata con successo!");

            // Pulizia campi form
            form.reset();
            // Nota: Ho mantenuto il riferimento 'btnPrenota' come da tuo codice originale
            // sebbene 'btn' sia dichiarato sopra, per non alterare la tua logica.
            btnPrenota.disabled = true;
        }
    });
}

/* ==========================================================================
   INIZIALIZZAZIONE SCRIPT
   ========================================================================== */

initializeMinWeek();
setupValidation();
setupSubmission();