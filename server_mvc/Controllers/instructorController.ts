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

}
export const deleteInstructores = async(ctx: any) => {

}

