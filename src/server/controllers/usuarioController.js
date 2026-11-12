import * as usuarioModel from "../models/usuarioModel.js";
import {
  criarSessao,
  revogarSessao,
  revogarSessoesUsuario,
} from "../utils/sessoes.js";

function textoOpcionalValido(value, maxLength) {
  return value == null || value === "" ||
    (typeof value === "string" && value.trim().length <= maxLength);
}

function textoObrigatorioValido(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function validarPerfil(dados, senhaObrigatoria = false) {
  const documento = typeof dados.cnpj_cpf === "string"
    ? dados.cnpj_cpf.replace(/\D/g, "")
    : "";
  const senha = typeof dados.senha === "string" && dados.senha.length > 0
    ? dados.senha
    : null;
  const camposEndereco = [
    dados.cep,
    dados.logradouro,
    dados.numero,
    dados.cidade,
    dados.estado,
  ];

  if (
    !textoObrigatorioValido(dados.nome, 150) ||
    typeof dados.email !== "string" ||
    dados.email.trim().length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()) ||
    (senhaObrigatoria && !textoObrigatorioValido(dados.senha, 80)) ||
    (!senhaObrigatoria &&
      dados.senha != null &&
      dados.senha !== "" &&
      !textoObrigatorioValido(dados.senha, 80)) ||
    !/^(?:\d{11}|\d{14})$/.test(documento) ||
    !textoOpcionalValido(dados.instituicao_laboratorio, 150) ||
    !textoOpcionalValido(dados.telefone, 20) ||
    !textoObrigatorioValido(dados.cep, 10) ||
    !textoObrigatorioValido(dados.logradouro, 150) ||
    !textoObrigatorioValido(dados.numero, 10) ||
    !textoOpcionalValido(dados.bairro, 50) ||
    !textoObrigatorioValido(dados.cidade, 50) ||
    typeof dados.estado !== "string" ||
    !/^[a-z]{2}$/i.test(dados.estado.trim()) ||
    camposEndereco.some((campo) => typeof campo !== "string")
  ) {
    return null;
  }

  const endereco = [
    `CEP ${dados.cep.trim()}`,
    `${dados.logradouro.trim()}, ${dados.numero.trim()}`,
    dados.bairro?.trim(),
    `${dados.cidade.trim()} - ${dados.estado.trim().toUpperCase()}`,
  ].filter(Boolean).join(", ");

  return {
    nome: dados.nome.trim(),
    cnpj_cpf: documento,
    email: dados.email.trim().toLowerCase(),
    senha,
    instituicao_laboratorio: dados.instituicao_laboratorio?.trim() || null,
    telefone: dados.telefone?.trim() || null,
    endereco,
  };
}

export async function cadastrar(req, res) {
  const dados = validarPerfil(req.body ?? {}, true);
  if (!dados) {
    return res.status(400).json({
      erro: "Preencha os dados do cadastro corretamente.",
    });
  }

  const idCliente = await usuarioModel.criar(dados);

  return res.status(201).json({
    mensagem: "Cadastro realizado com sucesso.",
    id_cliente: idCliente,
    usuario: {
      id_cliente: idCliente,
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
    },
  });
}

export async function login(req, res) {
  const { email, senha } = req.body ?? {};
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof senha !== "string" ||
    senha.length === 0
  ) {
    return res
      .status(400)
      .json({ erro: "Informe um e-mail e uma senha válidos." });
  }

  const usuario = await usuarioModel.autenticar(email.trim().toLowerCase(), senha);
  if (!usuario) {
    return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  }
  const token = criarSessao(usuario.id_cliente);
  return res.json({ mensagem: "Login realizado com sucesso.", usuario, token });
}

export async function obter(req, res) {
  const usuario = await usuarioModel.buscarPorId(req.idCliente);
  if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
  return res.json({ usuario });
}

export async function atualizar(req, res) {
  const dados = validarPerfil(req.body ?? {});
  if (!dados) {
    return res.status(400).json({
      erro: "Preencha os dados do cadastro corretamente.",
    });
  }

  const atualizado = await usuarioModel.atualizar(req.idCliente, dados);
  if (!atualizado) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }

  revogarSessoesUsuario(req.idCliente);
  const usuario = await usuarioModel.buscarPorId(req.idCliente);
  return res.json({
    mensagem: "Cadastro atualizado com sucesso.",
    usuario,
    token: criarSessao(req.idCliente),
  });
}

export async function excluir(req, res) {
  const excluido = await usuarioModel.excluir(req.idCliente);
  if (!excluido) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }
  revogarSessoesUsuario(req.idCliente);
  return res.status(204).end();
}

export async function sair(req, res) {
  revogarSessao(req.tokenSessao);
  return res.status(204).end();
}
