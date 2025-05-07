// deno-lint-ignore-file
import { Instructor } from "../Models/instructorModel.ts";

export const getInstructores = async(ctx: any) => {
   const { response } = ctx;
    try {
        const objP = new Instructor();
        const lista = await objP.seleccionarInstructor();
        response.status = 200;
        response.body = { success: true, data: lista }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const postInstructores = async(ctx: any) => {
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
            idinstructor: null, nombre: body.nombre, apellido: body.apellido, email: body.email, telefono: body.telefono
        }
        const objP = new Instructor(data);
        const result = await objP.insertarInstructor();
        response.status = 200;
        response.body = { success: true, mensaje: "exito", data: result }

    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const putInstructores = async(ctx: any) => {
    const { response, request, params } = ctx;
    try {
        const idInstructor = parseInt(params.id);
        if (isNaN(idInstructor)) {
            response.status = 400;
            response.body = { success: false, error: "ID de instructor inválido" };
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
            idinstructor: idInstructor, 
            nombre: body.nombre, 
            apellido: body.apellido, 
            email: body.email, 
            telefono: body.telefono 
        };

        const objP = new Instructor(datos, idInstructor);
        const result = await objP.actualizarInstructor();

        response.status = 200;
        response.body = { 
            success: result.success, 
            mensaje: result.mensaje, 
            data: result.instr 
        };
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "Error interno del servidor" };
    }
}

export const deleteInstructores = async(ctx: any) => {
    const { response, params } = ctx;
    try {
        const idInstructor = parseInt(params.id);
        if (isNaN(idInstructor)) {
            response.status = 400;
            response.body = { success: false, error: "ID de instructor inválido" };
            return;
        }

        const objP = new Instructor(null, idInstructor);
        const result = await objP.eliminarInstructor();

        if (result.success) {
            response.status = 200;
            response.body = { 
                success: true, 
                mensaje: "Instructor eliminado correctamente" 
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