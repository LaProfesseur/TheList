document.addEventListener("DOMContentLoaded", () => {
  function parseCSV(csvContent) {
    const rows = [];
    const lines = csvContent.trim().split("\n");

    lines.forEach((line) => {
      const cells = [];
      let cell = "";
      let inQuotes = false;

      for (let char of line) {
        if (char === '"' && !inQuotes) {
          inQuotes = true;
        } else if (char === '"' && inQuotes) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          cells.push(cell.trim());
          cell = "";
        } else {
          cell += char;
        }
      }
      cells.push(cell.trim());
      rows.push(cells);
    });

    return rows;
  }

  function loadAndRenderCSV() {
    fetch("output.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("CSV-Datei konnte nicht geladen werden.");
        }
        return response.text();
      })
      .then((csvContent) => {
        parseCSVAndRender(csvContent);
      })
      .catch((error) => {
        console.error("Fehler beim Laden der CSV-Datei:", error);
      });
  }

  function parseCSVAndRender(csvContent) {
    const rows = parseCSV(csvContent);
    const headers = rows.shift();

    const titleIndex = headers.indexOf("title");
    const starredIndex = headers.indexOf("starred");
    const dateIndex = headers.indexOf("date");
    const idIndex = headers.indexOf("id");
    const infoIndex = headers.indexOf("info");
    const typeIndex = headers.indexOf("type");

    if (
      titleIndex === -1 ||
      starredIndex === -1 ||
      dateIndex === -1 ||
      idIndex === -1 ||
      infoIndex === -1 ||
      typeIndex === -1
    ) {
      console.error(
        "Header `title`, `starred`, `date`, `id`, `info` oder `type` nicht gefunden!"
      );
      return;
    }

    const output = document.getElementById("output");
    output.innerHTML = "";
    const template = document.getElementById("template").children[0];

    let totalWords = 0;
    let totalLetters = 0;

    rows.forEach((row) => {
      if (row.length < headers.length) {
        console.warn("Zeile übersprungen, unvollständig:", row);
        return;
      }

      if (row[infoIndex] == 1) {
        const updatedDate = row[dateIndex];
        const updatedElement = document.querySelector("h2.updated");
        updatedElement.textContent = `Last Updated: ${updatedDate}`;
        return;
      }

      const clone = template.cloneNode(true);

      if (row[infoIndex] == 0) {
        clone.querySelector(".title").textContent = row[titleIndex];
        clone.querySelector(".id").textContent = row[idIndex];
        clone.querySelector(".date").textContent = row[dateIndex];

        const titleText = row[titleIndex];
        const wordsInTitle = titleText.trim().split(/\s+/).length;
        const lettersInTitle = titleText.replace(/\s+/g, "").length;

        totalWords += wordsInTitle;
        totalLetters += lettersInTitle;

        const starredDiv = clone.querySelector(".starred");
        const svg = starredDiv.querySelector("svg path");

        if (row[starredIndex] == 1) {
          svg.setAttribute("fill", "rgb(146, 193, 255)");
        } else if (row[starredIndex] == 0) {
          svg.removeAttribute("fill");
        }

        const typeValue = parseInt(row[typeIndex], 10) || 0;
        const typeElement = clone.querySelector(".type");

        switch (typeValue) {
          case 1:
            typeElement.textContent = "// Gehässig";
            typeElement.style.color = "lightcoral";
            break;
          case 2:
            typeElement.textContent = "// Verzweifelt";
            typeElement.style.color = "lightskyblue";
            break;
          case 3:
            typeElement.textContent = "// Utopisch";
            typeElement.style.color = "rgb(150, 224, 176)";
            break;
          default:
            typeElement.textContent = "";
            typeElement.style.color = "";
        }

        output.appendChild(clone);
      }
    });

    const wordsElement = document.querySelector(".words");
    const lettersElement = document.querySelector(".letters");
    const pagesElement = document.querySelector(".pages");

    wordsElement.textContent = `Words: ${totalWords}`;
    lettersElement.textContent = `Letters: ${totalLetters}`;

    const wordsPerPage = 250;
    const totalPages = Math.ceil(totalWords / wordsPerPage);
    pagesElement.textContent = `Pages: ${totalPages}`;
  }

  document
    .getElementById("starredCheckbox")
    .addEventListener("change", loadAndRenderCSV);
  document
    .getElementById("invertSortCheckbox")
    .addEventListener("change", loadAndRenderCSV);

  loadAndRenderCSV();
});