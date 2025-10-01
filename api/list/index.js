const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
    try {
        const conn = process.env.TABLES_CONNECTION_STRING;
        if (!conn) {
            context.log.error("Falta TABLES_CONNECTION_STRING en el entorno.");
            context.res = { status: 500, body: { error: "Config faltante: TABLES_CONNECTION_STRING" } };
            return;
        }

        const tableName = "entradas";
        const client = TableClient.fromConnectionString(conn, tableName);

        const items = [];
        for await (const entity of client.listEntities()) {
            items.push(entity);
        }

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: { count: items.length, items }
        };
    } catch (err) {
        context.log.error("Error leyendo tabla:", err.message);
        context.res = {
            status: 500,
            body: { error: "No se pudo leer la tabla 'entradas'" }
        };
    }
};

