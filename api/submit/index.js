const { TableClient } = require("@azure/data-tables");
const { randomUUID } = require("crypto");

module.exports = async function (context, req) {
  try {
    if (!process.env.TABLES_CONNECTION_STRING) {
      context.log.error("TABLES_CONNECTION_STRING no está configurada.");
      context.res = { status: 500, body: "Configurar TABLES_CONNECTION_STRING en la SWA." };
      return;
    }

    // Body JSON
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { nombre, rut, comentario } = body;

    if (!nombre || !rut) {
      context.res = { status: 400, body: "Faltan campos obligatorios: nombre y rut." };
      return;
    }

    // Cliente de tabla
    const tableName = "entradas";
    const client = TableClient.fromConnectionString(process.env.TABLES_CONNECTION_STRING, tableName);

    // Entidad
    const entity = {
      partitionKey: "web",
      rowKey: randomUUID(),
      nombre,
      rut,
      comentario: comentario || "",
      createdAt: new Date().toISOString()
    };

    await client.createEntity(entity);

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, id: entity.rowKey })
    };
  } catch (err) {
    context.log.error("Error en /api/submit:", err);
    context.res = { status: 500, body: "Error interno al guardar el registro." };
  }
};
