/*
Attivazione menu a tendina
*/
const myMenu = document.querySelector('.Menu');
myMenu.addEventListener('click', function() {
    this.classList.toggle('active');
});

/*
Correzione automatica della settimana minima per la prenotazione
*/

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
// Calcolo del primo giovedì dell'anno con sua sottrazione dal giovedì più vicino / millisecondi nella settimana (= calcolo settimane passate e settimana corrente) 
const firstThursdayOfYear = new Date(year, 0, 1 + ((4 - startOfYear.getDay() + 7) % 7));
const weekNum = 1 + Math.round((firstThursday - firstThursdayOfYear) / 604800000);
// Formattazione per l'inserimento in attributo
const currentWeekStr = `${year}-W${weekNum.toString().padStart(2, '0')}`;

// 3. Sostituzione dinamica del valore minimo della settimana
if (currentWeekStr > input.min) {
input.min = currentWeekStr;
};

/*
Validazione pulsanti immissione
*/

const form = document.getElementById('workshopForm');
const submitBtn = document.querySelector('.Prenota');
const eventBlocks = document.querySelectorAll('.MultiEvento');

form.addEventListener('input', () => {
let atLeastOneValidWorkshop = false;

// Loop per attivazione/disattivazione selezione turni su ciascun blocco workshop
for (let i = 0; i < eventBlocks.length; i++) {

    const block = eventBlocks[i]; 
    const checkbox = block.querySelector('.workshop-check');
    const radios = block.querySelectorAll('input[type="radio"]');
    const isChecked = checkbox.checked;

    // Loop interno per disattivare i radio buttons in assenza di selezione workshop
    for (let j = 0; j < radios.length; j++) {

    const radio = radios[j];
    radio.disabled = !isChecked;
    
    // Disattivazione radio buttons con deselezione workshop
    if (!isChecked) {
        radio.checked = false;
    }
    }

    // Controllo presenza di selezione almeno un workshop + almeno un turno
    const radioSelected = block.querySelector('input[type="radio"]:checked');
    if (isChecked && radioSelected) {
    atLeastOneValidWorkshop = true;
    }
};
// Aggiunta validazione del resto dei campi per controllo finale
const nameFilled = document.getElementById('nome').value.trim() !== "";
const surnameFilled = document.getElementById('cognome').value.trim() !== "";
const validEmail = document.getElementById('email').checkValidity();
const weekChosen = document.getElementById('settimana_eventi').checkValidity();

submitBtn.disabled = !(nameFilled && surnameFilled && weekChosen && validEmail && atLeastOneValidWorkshop);
});

/*
Controllo e generazione del JSON
*/

// Caricamento localStorage o apertura nuovo array se vuoto
let prenotazioni = JSON.parse(localStorage.getItem('databasePrenotazioni')) || [];

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(form);
    
    // 1. Estrazione dei dati comuni a tutte le prenotazioni (valore 'turno' gestito più in basso)
    const settimana = formData.get('settimana_eventi');
    const nome = formData.get('nome');
    const cognome = formData.get('cognome');
    const email = formData.get('email');

    // 2. Recupero di tutti i workshop selezionati
    const selectedWorkshops = document.querySelectorAll('input[type="checkbox"]:checked');

    // Contatori per dare un feedback preciso all'utente
    let addedCount = 0;
    let duplicateCount = 0;

    // 3. Iterazione su ogni workshop selezionato per generare i JSON
    selectedWorkshops.forEach(checkbox => {
        const workshopValue = checkbox.value; 

        // Trova il valore selezionato per il turno
        const parentDiv = checkbox.closest('.MultiEvento');
        const radioSelezionato = parentDiv.querySelector('input[type="radio"]:checked');
        const turnoValue = radioSelezionato.value;

        const nuovaPrenotazione = {
            "settimana_eventi": settimana,
            "workshop": workshopValue,
            "turno": turnoValue, 
            "nome": nome,
            "cognome": cognome,
            "email": email
        };

        // Controllo duplicati per ogni singola prenotazione con aggiornamento contatori
        const isDuplicate = prenotazioni.some(p => 
            p.email === nuovaPrenotazione.email && 
            p.settimana_eventi === nuovaPrenotazione.settimana_eventi &&
            p.turno === nuovaPrenotazione.turno &&
            p.workshop === nuovaPrenotazione.workshop
        );

        if (isDuplicate) {
            duplicateCount++;
        } else {
            prenotazioni.push(nuovaPrenotazione);
            addedCount++;
        }
    });

    // 4. Salvataggio in localStorage e gestione degli alert
    if (addedCount > 0) {
        localStorage.setItem('databasePrenotazioni', JSON.stringify(prenotazioni));
        
        // Pulizia form
        form.reset();
        if (submitBtn) submitBtn.disabled = true;

        if (duplicateCount > 0) {
            alert(`Operazione completata: ${addedCount} nuove prenotazioni salvate. ${duplicateCount} risultavano già presenti e sono state ignorate.`);
        } else {
            alert("Tutte le tue prenotazioni sono state registrate con successo!");
        }
    } else if (duplicateCount > 0) {
        alert("Tutte le prenotazioni selezionate risultano già presenti nel sistema, pertanto non sono state registrate.");
    }
});