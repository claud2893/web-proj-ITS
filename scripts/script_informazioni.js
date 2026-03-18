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