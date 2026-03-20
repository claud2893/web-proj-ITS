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
   2. CONFIGURAZIONE E STATO GLOBALE
   ========================================================================== */

const tabsContainer = document.getElementById('tabs-container');
const tableContainer = document.getElementById('table-container');
const modal = document.getElementById('booking-modal');
const adminForm = document.getElementById('adminForm');
const workshopSelect = document.getElementById('workshop');
const turnoSelect = document.getElementById('turno');

let prenotazioni = [];
let activeTab = 'Tutti';
let editIndex = -1; 

// Dizionario che mappa ogni workshop ai suoi turni
const turniPerWorkshop = {
    "Digital Painting": ["17.00-17.50", "18.00-18.50", "19.10-20.00"],
    "3D Printed Sculpture": ["10.00-10.50", "11.00-11.50", "12.10-13.00"],
    "Virtual Reality": ["11.00-11.50", "12.00-12.50", "13.00-13.50", "14.00-14.50", "15.10-16.00"],
    "Spatial video-sound art": ["16.00-16.50", "17.00-17.50", "18.10-19.00"]
};

/* ==========================================================================
   3. LOGICA DI RENDERING UI
   ========================================================================== */

function init() {
    prenotazioni = JSON.parse(localStorage.getItem('databasePrenotazioni')) || [];
    renderUI();
}

function renderUI() {
    // Array di workshop unici per creare le tab dinamicamente ([...new Set(...)])
    const workshopsUnici = [...new Set(prenotazioni.map(p => p.workshop))];
    const tabs = ['Tutti', ...workshopsUnici];

    if (!tabs.includes(activeTab)) activeTab = 'Tutti';

    tabsContainer.innerHTML = tabs.map(tab => 
        `<button class="tab-btn ${tab === activeTab ? 'active' : ''}" onclick="cambiaTab('${tab}')">${tab}</button>`
    ).join('');

    const prenotazioniFiltrate = activeTab === 'Tutti' 
        ? [...prenotazioni] // Facciamo una copia per non alterare l'array originale
        : prenotazioni.filter(p => p.workshop === activeTab);

    // Array ordinato prima per Settimana poi per Turno
    prenotazioniFiltrate.sort((a, b) => {
        if (a.settimana_eventi !== b.settimana_eventi) {
            return a.settimana_eventi.localeCompare(b.settimana_eventi);
        }
        return a.turno.localeCompare(b.turno);
    });

    if (prenotazioniFiltrate.length === 0) {
        tableContainer.innerHTML = '<p>Nessuna prenotazione trovata per questa categoria.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Settimana</th>
                    <th>Turno</th>
                    <th>Workshop</th>
                    <th>Nome</th>
                    <th>Cognome</th>
                    <th>Email</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
    `;

    prenotazioniFiltrate.forEach(p => {
        const realIndex = prenotazioni.indexOf(p);
        tableHTML += `
            <tr>
                <td>${p.settimana_eventi}</td>
                <td>${p.turno}</td>
                <td>${p.workshop}</td>
                <td>${p.nome}</td>
                <td>${p.cognome}</td>
                <td>${p.email}</td>
                <td>
                    <button class="edit-btn" onclick="apriModalModifica(${realIndex})">Modifica</button>
                    <button class="delete-btn" onclick="eliminaPrenotazione(${realIndex})">Elimina</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    tableContainer.innerHTML = tableHTML;
}

/* ==========================================================================
   4. GESTIONE WORKSHOP E TURNI
   ========================================================================== */

// Funzione per aggiornare le opzioni del turno in base al workshop
function aggiornaTurni(workshopSelezionato) {
    turnoSelect.innerHTML = '<option value="">-- Seleziona Turno --</option>'; // Resetta le opzioni
    
    if (workshopSelezionato && turniPerWorkshop[workshopSelezionato]) {
        turniPerWorkshop[workshopSelezionato].forEach(turno => {
            turnoSelect.innerHTML += `<option value="${turno}">${turno}</option>`;
        });
    }
}

// Listener che rileva quando cambi il workshop nel menu a tendina
workshopSelect.addEventListener('change', (e) => {
    aggiornaTurni(e.target.value);
});

/* ==========================================================================
   5. AZIONI E OPERAZIONI (CRUD)
   ========================================================================== */

window.cambiaTab = function(nomeTab) {
    activeTab = nomeTab;
    renderUI();
};

window.eliminaPrenotazione = function(index) {
    if (confirm("Sei sicuro di voler eliminare questa prenotazione?")) {
        prenotazioni.splice(index, 1);
        salvaEdAggiorna();
    }
};

window.apriModalModifica = function(index) {
    editIndex = index;
    document.getElementById('modal-title').textContent = "Modifica Prenotazione";
    
    const p = prenotazioni[index];
    document.getElementById('nome').value = p.nome;
    document.getElementById('cognome').value = p.cognome;
    document.getElementById('email').value = p.email;
    document.getElementById('settimana_eventi').value = p.settimana_eventi;
    
    // Impostazione del workshop con adeguamento turni
    document.getElementById('workshop').value = p.workshop;
    aggiornaTurni(p.workshop); 
    document.getElementById('turno').value = p.turno;
    
    modal.showModal();
};

/* ==========================================================================
   6. GESTIONE NEW/EDIT PRENOTAZIONE + AGGIORNAMENTO STORAGE
   ========================================================================== */

document.getElementById('btn-nuova').addEventListener('click', () => {
    editIndex = -1; // Indice negativo per indicare nuova prenotazione
    document.getElementById('modal-title').textContent = "Nuova Prenotazione";
    adminForm.reset();
    aggiornaTurni(""); // Svuotamento dei turni quando si apre un form vuoto
    modal.showModal();
});

document.getElementById('btn-chiudi-modal').addEventListener('click', () => {
    modal.close();
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const datiForm = {
        "settimana_eventi": document.getElementById('settimana_eventi').value,
        "workshop": document.getElementById('workshop').value,
        "turno": document.getElementById('turno').value,
        "nome": document.getElementById('nome').value,
        "cognome": document.getElementById('cognome').value,
        "email": document.getElementById('email').value
    };

    // Crea o modifica la prenotazione in base all'indice di modifica
    if (editIndex === -1) {
        prenotazioni.push(datiForm);
    } else {
        prenotazioni[editIndex] = datiForm;
    }

    modal.close();
    salvaEdAggiorna();
});

function salvaEdAggiorna() {
    localStorage.setItem('databasePrenotazioni', JSON.stringify(prenotazioni));
    renderUI();
}

// Avvio applicazione
initializeMinWeek();
init();
