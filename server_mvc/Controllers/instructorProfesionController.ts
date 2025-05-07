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

}
export const deleteInstructorProfesion = async(ctx: any) => {

}

