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
}

/*
Controllo inserimento completo dei dati
*/
const form = document.getElementById('workshopForm');
const btn = document.querySelector('.Prenota');

form.addEventListener('input', () => {
// checkValidity() restituisce true se tutti i campi "required" sono completi
btn.disabled = !form.checkValidity();
})