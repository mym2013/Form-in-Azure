function dvRut(rut) {
    const [n, d] = rut.split('-');
    return dvRut(parseInt(n, 10)) === d.toUpperCase();
}

function show(el, ok) { el.style.display = ok ? "none" : "block"; }

f.addEventListener("submit", async (e) => {
    e.preventDefault();

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

    let ok = true;
    show($("#err-n1"), !!v.nombre1); ok = ok && !!v.nombre1;
    show($("#err-a1"), !!v.apellido1); ok = ok && !!v.apellido1;
    const rOk = validaRut(v.rut); show($("#err-rut"), rOk); ok = ok && rOk;
    const mOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo); show($("#err-mail"), mOk); ok = ok && mOk;
    show($("#err-dir"), !!v.direccion); ok = ok && !!v.direccion;

    if (v.website) return;   // bot
    if (!ok) return;         // errores en UI

    try {
        const resp = await fetch("http://localhost:3001/submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...v,
                fecha: new Date().toISOString()
            })
        });
        if (!resp.ok) throw new Error("Error de servidor");
        alert("Registro enviado y guardado en JSON Server con éxito!");
        f.reset();
    } catch (err) {
        alert("No se pudo enviar. Intenta nuevamente.");
        console.error(err);
    }
});
