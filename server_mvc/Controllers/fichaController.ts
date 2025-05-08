// deno-lint-ignore-file
import { Ficha } from "../Models/fichaModel.ts";

export const getFichas = async(ctx: any) => {
    const { response } = ctx;
    try {
        const objA = new Ficha();
        const lista = await objA.seleccionarFicha();
        response.status = 200;
        response.body = { success: true, data: lista }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" }
    }
}
export const postFichas = async(ctx: any)=>{
const { response, request } = ctx;
    try {
        const contentLength = request.headers.get("content-length");
        if (contentLength === 0) {
            response.status = 400;
            response.body = { success: false, error: "No se ha enviado el cuerpo de la peticion" }
            return;
        }
        const body = await request.body.json();
        const datos = { idficha: null, codigo: body.codigo, fecha_inicio_lectiva: body.fechaInicioL, fecha_fin_lectiva: body.fechaFinL,
            fecha_fin_practica: body.fechaFinP, programa_idprograma: body.idPrograma
         };
        const objA = new Ficha(datos);
        const result = await objA.insertarFicha();
        response.status = 200;
        response.body = {success: true, mensaje:"se registro correctamente la ficha", body: result}
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" }
    }
}
export const putFichas = async(ctx: any)=>{
    const { response, request, params } = ctx;
    try {
        const idFicha = parseInt(params.id);
        if (isNaN(idFicha)) {
            response.status = 400;
            response.body = { success: false, error: "ID de ficha inválido" };
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
            idficha: idFicha, 
            codigo: body.codigo, 
            fecha_inicio_lectiva: body.fechaInicioL, 
            fecha_fin_lectiva: body.fechaFinL,
            fecha_fin_practica: body.fechaFinP, 
            programa_idprograma: body.idPrograma
        };

        const objA = new Ficha(datos, idFicha);
        const result = await objA.actualizarFicha();

        if (result.success) {
            response.status = 200;
            response.body = { 
                success: true, 
                mensaje: result.mensaje,
                data: result.ficha 
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
export const deleteFichas = async(ctx: any)=>{
    const { response, params } = ctx;
    try {
        const idFicha = parseInt(params.id);
        if (isNaN(idFicha)) {
            response.status = 400;
            response.body = { success: false, error: "ID de ficha inválido" };
            return;
        }

        const objA = new Ficha(null, idFicha);
        const result = await objA.eliminarFicha();

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