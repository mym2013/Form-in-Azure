// entries.js — CAP 10 (Paso 2: fetch real + estados + render tabla)
(function () {
    // Referencias DOM
    const countEl = document.getElementById("count");
    const tableContainer = document.getElementById("table-container");
    const statusEl = document.getElementById("status");
    const refreshBtn = document.getElementById("refresh-btn");
    const retryBtn = document.getElementById("retry-btn");

    // Util: estado
    function setStatus(message, type = "info") {
        statusEl.textContent = message || "";
        statusEl.setAttribute("data-type", type);
    }

    // Limpia vista (tabla/mensajes)
    function resetView() {
        setStatus("");
        tableContainer.innerHTML = "";
    }

    // Render de tabla (partitionKey, rowKey, timestamp + resto)
    function renderTable(rows) {
        if (!Array.isArray(rows)) rows = [];

        // Columnas base y resto (orden estable)
        const base = ["partitionKey", "rowKey", "timestamp"];
        const extraSet = new Set();
        rows.forEach(r => {
            Object.keys(r || {}).forEach(k => {
                if (!base.includes(k)) extraSet.add(k);
            });
        });
        const extras = Array.from(extraSet).sort();
        const columns = [...base, ...extras];

        // Construcción DOM
        const table = document.createElement("table");
        table.className = "table-entries";

        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        columns.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        const tbody = document.createElement("tbody");
        rows.forEach(r => {
            const tr = document.createElement("tr");
            columns.forEach(col => {
                const td = document.createElement("td");
                let val = r && r[col] != null ? r[col] : "";
                // Normalize timestamp si viene objeto o ISO
                if (col === "timestamp" && val) {
                    try {
                        // Azure Tables suele entregar ISO; si no, intentamos new Date(...)
                        const d = new Date(val);
                        if (!isNaN(d)) val = d.toISOString();
                    } catch (_) { }
                }
                td.textContent = String(val);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
    }

    // Fetch real
    async function loadEntries() {
        retryBtn.style.display = "none";
        setStatus("Cargando…", "info");
        tableContainer.innerHTML = "";
        if (countEl) countEl.textContent = "0";

        try {
            const res = await fetch("/api/list", { method: "GET" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // data esperado: array
            const rows = Array.isArray(data) ? data : (data?.value || []);
            const qty = Array.isArray(rows) ? rows.length : 0;

            if (qty === 0) {
                setStatus("No hay registros.", "info");
                return;
            }

            renderTable(rows);
            if (countEl) countEl.textContent = String(qty);
            setStatus(`Listo. ${qty} registro(s).`, "success");
        } catch (err) {
            console.error("[entries] Error cargando /api/list:", err);
            setStatus("Error al cargar. Revisa conexión o backend y pulsa Reintentar.", "error");
            retryBtn.style.display = "inline-block";
        }
    }

    // Eventos
    function wireEvents() {
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                resetView();
                loadEntries();
            });
        }
        if (retryBtn) {
            retryBtn.addEventListener("click", () => {
                retryBtn.style.display = "none";
                resetView();
                loadEntries();
            });
        }
    }

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        wireEvents();
        setStatus("Listo. Presiona «Refrescar» para cargar.", "info");
        if (countEl) countEl.textContent = "0";
    });
})();

