// deno-lint-ignore-file
import { Profesion } from "../Models/profesionModel.ts";

export const getProfesion = async (ctx: any) => {
    const { response } = ctx;
    try {
        const objP = new Profesion();
        const lista = await objP.seleccionarProfesion();
        response.status = 200;
        response.body = { success: true, data: lista }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const postProfesion = async (ctx: any) => {
    const { request, response } = ctx;
    try {
        const contentLength = await request.headers.get("content-length");
        if (contentLength === 0) {
            response.status = 400;
            response.body = { success: false, error: "no se proporciono el body de la peticion" };
            return;
        }
        const body = await request.body.json();
        const data = {
            idprofesion: null, nombre_profesion: body.nombre_profesion
        }
        const objP = new Profesion(data);
        const result = await objP.insertarProfesion();
        response.status = 200;
        response.body = { success: true, mensaje: "exito", data: result }

    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const putProfesion = async (ctx: any) => {
    const { request, response, params } = ctx;
    try {
        const idProfesion = parseInt(params.id);
        if (isNaN(idProfesion)) {
            response.status = 400;
            response.body = { success: false, error: "ID de profesión inválido" };
            return;
        }

        const contentLength = await request.headers.get("content-length");
        if (contentLength === 0) {
            response.status = 400;
            response.body = { success: false, error: "No se ha enviado el cuerpo de la petición" };
            return;
        }

        const body = await request.body.json();
        const data = {
            idprofesion: idProfesion,
            nombre_profesion: body.nombre_profesion
        };

        const objP = new Profesion(data, idProfesion);
        const result = await objP.actualizarProfesion();

        if (result.success) {
            response.status = 200;
            response.body = {
                success: true,
                mensaje: result.mensaje,
                data: result.profesion
            };
        } else {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: result.mensaje
            };
        }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" };
    }
}
export const deleteProfesion = async (ctx: any) => {
    const { response, params } = ctx;
    try {
        const idProfesion = parseInt(params.id);
        if (isNaN(idProfesion)) {
            response.status = 400;
            response.body = { success: false, error: "ID de profesión inválido" };
            return;
        }

        const objP = new Profesion(null, idProfesion);
        const result = await objP.eliminarProfesion();

        if (result.success) {
            response.status = 200;
            response.body = {
                success: true,
                mensaje: result.mensaje
            };
        } else {
            response.status = 404;
            response.body = {
                success: false,
                mensaje: result.mensaje
            };
        }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" };
    }
}