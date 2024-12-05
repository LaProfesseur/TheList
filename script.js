// CSV robust parsen
function parseCSV(csvContent) {
    const rows = [];
    const lines = csvContent.trim().split('\n');

    lines.forEach(line => {
        const cells = [];
        let cell = '';
        let inQuotes = false;

        for (let char of line) {
            if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === '"' && inQuotes) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                cells.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        cells.push(cell.trim());
        rows.push(cells);
    });

    return rows;
}

// CSV laden und rendern
function loadAndRenderCSV() {
    fetch('output.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('CSV-Datei konnte nicht geladen werden.');
            }
            return response.text();
        })
        .then(csvContent => {
            parseCSVAndRender(csvContent);
        })
        .catch(error => {
            console.error('Fehler beim Laden der CSV-Datei:', error);
        });
}

// CSV parsen und HTML generieren
function parseCSVAndRender(csvContent) {
    const rows = parseCSV(csvContent); // Verwende die neue Funktion
    const headers = rows.shift(); // Header extrahieren

    const titleIndex = headers.indexOf('title');
    const starredIndex = headers.indexOf('starred');
    const dateIndex = headers.indexOf('date');
    const idIndex = headers.indexOf('id');
    const infoIndex = headers.indexOf('info');

    if (titleIndex === -1 || starredIndex === -1 || dateIndex === -1 || idIndex === -1 || infoIndex === -1) {
        console.error("Header `title`, `starred`, `date`, `id` oder `info` nicht gefunden!");
        return;
    }

    const output = document.getElementById('output');
    const template = document.getElementById('template').children[0];

    // Zähler für Wörter und Buchstaben
    let totalWords = 0;
    let totalLetters = 0;

    rows.forEach(row => {
        if (row.length < headers.length) {
            console.warn("Zeile übersprungen, unvollständig:", row);
            return;
        }

        const clone = template.cloneNode(true);

        // Wenn info == 0, rendern wir das Template
        if (row[infoIndex] == 0) {
            // Setze den Titel, die ID und das Datum
            clone.querySelector('.title').textContent = row[titleIndex];
            clone.querySelector('.id').textContent = row[idIndex];
            clone.querySelector('.date').textContent = row[dateIndex]; // Setze das Datum

            // Zähle Wörter und Buchstaben im Titel
            const titleText = row[titleIndex];
            const wordsInTitle = titleText.trim().split(/\s+/).length;
            const lettersInTitle = titleText.replace(/\s+/g, '').length;

            // Füge zu den globalen Werten hinzu
            totalWords += wordsInTitle;
            totalLetters += lettersInTitle;

            // Behandle die 'starred' Logik
            const starredDiv = clone.querySelector('.starred');
            const svg = starredDiv.querySelector('svg path'); // SVG-Pfad finden

            if (row[starredIndex] == 1) {
                svg.setAttribute('fill', 'rgb(146, 193, 255)'); // Setze den Fill auf rgb(146, 193, 255)
            } else if (row[starredIndex] == 0) {
                svg.removeAttribute('fill'); // Entferne den Fill, wenn es 0 ist
            }

            output.appendChild(clone);
        } else if (row[infoIndex] == 1) {
            // Wenn info == 1, extrahiere das Datum und füge es in das existierende h2.updated ein
            const updatedDate = row[dateIndex];
            const updatedElement = document.querySelector('h2.updated');
            updatedElement.textContent = `Updated: ${updatedDate}`;
        }
    });

    // Update der globalen Zähler
    const wordsElement = document.querySelector('.words');
    const lettersElement = document.querySelector('.letters');
    const pagesElement = document.querySelector('.pages');

    wordsElement.textContent = `Words: ${totalWords}`;
    lettersElement.textContent = `Letters: ${totalLetters}`;

    // Berechnung der Seitenzahl (250 Wörter pro Seite)
    const wordsPerPage = 250;
    const totalPages = Math.ceil(totalWords / wordsPerPage);

    // Ausgabe in das Pages-Element
    pagesElement.textContent = `Pages: ${totalPages}`;
}

// Start beim Laden der Seite
document.addEventListener('DOMContentLoaded', loadAndRenderCSV);
