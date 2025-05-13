// deno-lint-ignore-file 
import { InstructorProfesion } from "../Models/instructorProfesionModel.ts";

export const getInstructorProfesion = async(ctx: any) => {
 const { response } = ctx;
    try {
        const objP = new InstructorProfesion();
        const lista = await objP.seleccionarInstructorProfesion();
        response.status = 200;
        response.body = { success: true, data: lista }
    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const postInstructorProfesion = async(ctx: any) => {
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
            instructor_idinstructor: body.idInstructor, profesion_idprofesion: body.idProfesion
        }
        const objP = new InstructorProfesion(data);
        const result = await objP.insertarInstructorProfesion();
        response.status = 200;
        response.body = { success: true, mensaje: "exito", data: result }

    } catch (error) {
        console.log(error);
        response.status = 500;
        response.body = { success: false, error: "error interno" }
    }
}
export const putInstructorProfesion = async(ctx: any) => {
    const { request, response, params } = ctx;
    try {
        const idInstructor = parseInt(params.id);
        if (isNaN(idInstructor)) {
            response.status = 400;
            response.body = { success: false, error: "ID de instructor inválido" };
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
            instructor_idinstructor: body.nuevoInstructorID,
            profesion_idprofesion: body.idProfesion
        };

        const objP = new InstructorProfesion(data, idInstructor);
        const result = await objP.actualizarInstructorProfesion();

        if (result.success) {
            response.status = 200;
            response.body = {
                success: true,
                mensaje: result.mensaje,
                data: result.data
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
export const deleteInstructorProfesion = async(ctx: any) => {
    const { response, params } = ctx;
    try {
        const idInstructor = parseInt(params.id);
        if (isNaN(idInstructor)) {
            response.status = 400;
            response.body = { success: false, error: "ID de instructor inválido" };
            return;
        }

        // También podemos recibir el ID de profesión si se necesita
        const idProfesion = ctx.query?.idProfesion ? parseInt(ctx.query.idProfesion) : null;
        
        let objP;
        if (idProfesion && !isNaN(idProfesion)) {
            objP = new InstructorProfesion({
                instructor_idinstructor: idInstructor,
                profesion_idprofesion: idProfesion
            });
        } else {
            objP = new InstructorProfesion(null, idInstructor);
        }
        
        const result = await objP.eliminarInstructorProfesion();

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