// ===== Helpers base =====
const f = document.querySelector("form");                 // referencia al <form>
const $ = (id) => document.getElementById(id) || null;    // helper por id (tolerante)

// Mostrar/ocultar error (tolerante si el nodo no existe)
function show(el, ok) { if (!el) return; el.style.display = ok ? "none" : "block"; }

// ===== RUT Chile =====
// Normaliza: quita puntos/guion y pasa a mayúsculas
function _normalizeRut(r) {
    return String(r || "").replace(/\./g, "").replace(/-/g, "").toUpperCase();
}
// Calcula dígito verificador
function _dv(body) {
    let sum = 0, mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * mul;
        mul = (mul === 7) ? 2 : mul + 1;
    }
    const res = 11 - (sum % 11);
    if (res === 11) return "0";
    if (res === 10) return "K";
    return String(res);
}
// Valida rut completo (con o sin formato)
function validaRut(rut) {
    const norm = _normalizeRut(rut);
    if (norm.length < 2) return false;
    const body = norm.slice(0, -1);
    const dv = norm.slice(-1);
    if (!/^\d+$/.test(body)) return false;
    return _dv(body) === dv;
}

// ===== Submit =====
f.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("[submit] handler activo");

    const v = {
        nombre1: f.nombre1.value.trim(),
        nombre2: f.nombre2.value.trim(),
        apellido1: f.apellido1.value.trim(),
        apellido2: f.apellido2.value.trim(),
        rut: f.rut.value.trim(),
        correo: f.correo.value.trim(),
        direccion: f.direccion.value.trim(),
        website: f.website.value.trim() // honeypot
    };

    // Validaciones UI
    let ok = true;
    show($("#err-n1"), !!v.nombre1); ok = ok && !!v.nombre1;
    show($("#err-a1"), !!v.apellido1); ok = ok && !!v.apellido1;
    const rOk = validaRut(v.rut); show($("#err-rut"), rOk); ok = ok && rOk;
    const mOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo);
    show($("#err-mail"), mOk); ok = ok && mOk;
    show($("#err-dir"), !!v.direccion); ok = ok && !!v.direccion;

    // Anti-bot y corte si hay errores
    if (v.website) return; // honeypot
    if (!ok) return;       // errores en UI

    try {
        console.log("[submit] enviando a /submissions", v);
        const resp = await fetch("http://localhost:3001/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v)
        });
        if (!resp.ok) throw new Error("Error de servidor");
        alert("Registro enviado y guardado en JSON Server con éxito!");
        f.reset();
    } catch (err) {
        console.error("[submit] error", err);
        alert("No se pudo enviar. Intenta nuevamente.");
    }
});
