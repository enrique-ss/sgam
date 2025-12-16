"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var knex_1 = require("knex");
exports.db = (0, knex_1.default)({
    client: "mysql2",
    connection: {
        host: "localhost",
        user: "root",
        password: "senacrs",
        database: "rsti_final",
    },
});
