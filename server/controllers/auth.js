import bscrypt from "bcryptjs";
import { User } from "../models/index.js";
import { jwt } from "../utils/index.js";

async function register(req, res) {
  try {
    const { usuario, password } = req.body;

    const user = new User({
      usuario: usuario.toLowerCase(),
    });

    const salt = bscrypt.genSaltSync(10);
    const hashPassword = bscrypt.hashSync(password, salt);
    user.password = hashPassword;

    const userStorage = await user.save();

    res.status(201).send(userStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al registrar el usuario" });
  }
}

async function login(req, res) {
  try {
    const { usuario, password } = req.body;

    const usuarioLowerCase = usuario.toLowerCase();

    const userStorage = await User.findOne({ usuario: usuarioLowerCase });

    if (!userStorage) {
      res.status(404).send({ msg: "Usuario no encontrado" });
      return;
    }

    const isPasswordValid = bscrypt.compareSync(password, userStorage.password);

    if (!isPasswordValid) {
      res.status(401).send({ msg: "Contraseña incorrecta" });
      return;
    }

    res.status(200).send({
      access: jwt.createAccessToken(userStorage),
      refresh: jwt.createRefreshToken(userStorage),
    });
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).send({ msg: "Token requerido" });
      return;
    }

    const hasExpired = jwt.hasExpiredToken(refreshToken);

    if (hasExpired) {
      res.status(400).send({ msg: "Token expirado" });
      return;
    }

    const { user_id } = jwt.decoded(refreshToken);

    const userStorage = await User.findById(user_id);

    if (!userStorage) {
      res.status(404).send({ msg: "Usuario no encontrado" });
      return;
    }

    res.status(200).send({
      accessToken: jwt.createAccessToken(userStorage),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error del servidor" });
  }
}

export const AuthController = {
  register,
  login,
  refreshAccessToken,
};
