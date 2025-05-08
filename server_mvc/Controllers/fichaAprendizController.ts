// deno-lint-ignore-file
import { FichaAprendiz } from "../Models/fichaAprendizModel.ts";

export const getFichasAprendiz = async(ctx: any) => {
const {response} = ctx;
try {
    const objFA = new FichaAprendiz();
    const lista = await objFA.seleccionarFichaAprendiz();
    response.status = 200;
    response.body = {success: true, data: lista}
} catch (error) {
    response.status = 500;
    response.body = {success: false, error:"error interno"};
}
}
export const postFichasAprendiz = async(ctx: any) => {
 const {request, response} = ctx;
 try {
    const length = request.headers.get("content-length");
    if (length === 0) {
        response.status= 400;
        response.body = {success: false, error: "falta el cuerpo de la peticion"};
        return;
    }
    const body = await request.body.json();
    const data = {
        ficha_idficha: body.idFicha, aprendiz_idaprendiz: body.idAprendiz, instructor_idinstructor: body.idInstructor
    }
    const objFA = new FichaAprendiz(data);
    const resul = await objFA.insertarFicha();
    response.status = 200;
    response.body = {success: true, mensaje: "exito", data: resul} 
 } catch (error) {
    response.status = 500;
    response.body = {success: true, error: "error interno"}
 }
}
export const putFichasAprendiz = async(ctx: any) => {
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
        const data = {
            ficha_idficha: body.idFicha, 
            aprendiz_idaprendiz: body.idAprendiz, 
            instructor_idinstructor: body.idInstructor
        };

        const objFA = new FichaAprendiz(data, idFicha);
        const result = await objFA.actualizarFichaAprendiz();

        if (result.success) {
            response.status = 200;
            response.body = {
                success: true,
                mensaje: result.mensaje,
                data: result.ids
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
export const deleteFichasAprendiz = async(ctx: any) => {
    const { response, params } = ctx;
    try {
        const idFicha = parseInt(params.id);
        if (isNaN(idFicha)) {
            response.status = 400;
            response.body = { success: false, error: "ID de ficha inválido" };
            return;
        }

        const objFA = new FichaAprendiz(null, idFicha);
        const result = await objFA.eliminarFichaAprendiz();

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