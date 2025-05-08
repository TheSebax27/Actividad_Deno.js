// deno-lint-ignore-file
import { request } from "node:http";
import { Programa } from "../Models/programaModel.ts";
import { error } from "node:console";

export const getProgramas = async(ctx: any) => {
const {response} = ctx;
try {
    const objP = new Programa();
    const lista = await objP.seleccionarPrograma();
    response.status = 200;
    response.body = {success: true, data:lista}
} catch (error) {
    console.log(error);
    response.status = 500;
    response.body = {success:false, error: "error insterno"}
}
}
export const postProgramas = async(ctx: any) => {
const {request,response} = ctx;
try {
    const contentL = request.headers.get("content-length");
    if (contentL === 0) {
        response.status = 400;
        response.body = {success: false, error:"no se proporciono el cuerpo"};
        return;
    }
    const body = await request.body.json();
    const data = {
        idprograma: null, nombre_programa: body.nombre_programa
    }
    const objP = new Programa(data);
    const result = await objP.insertarPrograma();
    response.status = 200;
    response.body = {success: true, mensaje:"exito", data: result}
} catch (error) {
    console.log(error);
    response.status = 500;
    response.body = {success:false, error: "error insterno"}
}
}
export const putProgramas = async(ctx: any) => {
    const { response, request, params } = ctx;
    try {
        const idPrograma = parseInt(params.id);
        if (isNaN(idPrograma)) {
            response.status = 400;
            response.body = { success: false, error: "ID de programa inválido" };
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
            idprograma: idPrograma, 
            nombre_programa: body.nombre_programa
        };

        const objP = new Programa(datos, idPrograma);
        const result = await objP.actualizarPrograma();

        response.status = 200;
        response.body = { 
            success: result.success, 
            mensaje: result.mensaje, 
            data: result.prog 
        };
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" };
    }
}

export const deleteProgramas = async(ctx: any) => {
    const { response, params } = ctx;
    try {
        const idPrograma = parseInt(params.id);
        if (isNaN(idPrograma)) {
            response.status = 400;
            response.body = { success: false, error: "ID de programa inválido" };
            return;
        }

        const objP = new Programa(null, idPrograma);
        const result = await objP.eliminarPrograma();

        if (result.success) {
            response.status = 200;
            response.body = { 
                success: true, 
                mensaje: "Programa eliminado correctamente" 
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