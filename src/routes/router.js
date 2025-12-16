"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var usuario_controller_1 = require("../controllers/usuario.controller");
var cliente_controller_1 = require("../controllers/cliente.controller");
exports.router = (0, express_1.Router)();
// usuario
exports.router.post('/criar-usuario', usuario_controller_1.criarUsuario);
// cliente
exports.router.get('/clientes', cliente_controller_1.listarCliente);
