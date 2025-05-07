// deno-lint-ignore-file
import { responseRange } from "jsr:@oak/commons@^1.0/range";
import { Aprendiz } from "../Models/aprendizModel.ts";

export const getAprendices = async (ctx: any) => {
    const { response } = ctx;
    try {
        const objA = new Aprendiz();
        const lista = await objA.seleccionarAprendiz();
        response.status = 200;
        response.body = { success: true, data: lista }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" }
    }
}
export const postAprendices = async (ctx: any) => {
    const { response, request } = ctx;
    try {
        const contentLength = request.headers.get("content-length");
        if (contentLength === 0) {
            response.status = 400;
            response.body = { success: false, error: "No se ha enviado el cuerpo de la peticion" }
            return;
        }
        const body = await request.body.json();
        const datos = { idaprendiz: null, nombre: body.nombre, apellido: body.apellido, email: body.email , telefono: body.telefono };
        const objA = new Aprendiz(datos);
        const result = await objA.insertarAprendiz();
        response.status = 200;
        response.body = {success: true, mensaje:"se registro correctamente el aprendiz", body: result}
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" }
    }
}
export const putAprendices = async (ctx: any) => {
    const { response, request, params } = ctx;
    try {
        const idAprendiz = parseInt(params.id);
        if (isNaN(idAprendiz)) {
            response.status = 400;
            response.body = { success: false, error: "ID de aprendiz inválido" };
            return;
        }

        const contentLength = request.headers.get("content-length");
        if (contentLength === 0) {
            response.status = 400;
            response.body = { success: false, error: "No se ha enviado el cuerpo de la petición" };
            return;
        }

        const body = await request.body.json();
        const datos = { 
            idaprendiz: idAprendiz, 
            nombre: body.nombre, 
            apellido: body.apellido, 
            email: body.email, 
            telefono: body.telefono 
        };

        const objA = new Aprendiz(datos, idAprendiz);
        const result = await objA.actualizarAprendiz();

        response.status = 200;
        response.body = { 
            success: result.success, 
            mensaje: result.mensaje, 
            data: result.apren 
        };
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" };
    }
}

export const deleteAprendices = async (ctx: any) => {
    const { response, params } = ctx;
    try {
        const idAprendiz = parseInt(params.id);
        if (isNaN(idAprendiz)) {
            response.status = 400;
            response.body = { success: false, error: "ID de aprendiz inválido" };
            return;
        }

        const objA = new Aprendiz(null, idAprendiz);
        const result = await objA.eliminarAprendiz();

        if (result.success) {
            response.status = 200;
            response.body = { 
                success: true, 
                mensaje: "Aprendiz eliminado correctamente" 
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