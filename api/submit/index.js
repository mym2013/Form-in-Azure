// Azure Functions v4 (Node 18)
const { TableServiceClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        const conn = process.env.TABLES_CONNECTION_STRING;
        if (!conn) {
            context.res = { status: 500, jsonBody: { ok: false, error: "Falta TABLES_CONNECTION_STRING" } };
            return;
        }

        const service = TableServiceClient.fromConnectionString(conn);
        const table = service.getTableClient("entradas");

        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
        const { name, email, message } = body;

        if (!name || !email || !message) {
            context.res = { status: 400, jsonBody: { ok: false, error: "Campos requeridos: name, email, message" } };
            return;
        }

        const entity = {
            partitionKey: "form",
            rowKey: cryptoId(),
            name,
            email,
            message,
            createdAt: new Date().toISOString(),
            userAgent: req.headers["user-agent"] || ""
        };

        await table.createEntity(entity);
        context.res = { status: 201, jsonBody: { ok: true, id: entity.rowKey } };
    } catch (err) {
        context.log("ERROR submit:", err);
        context.res = { status: 500, jsonBody: { ok: false, error: "Error interno" } };
    }
};

function cryptoId() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
