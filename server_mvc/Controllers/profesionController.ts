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

}
export const deleteProfesion = async (ctx: any) => {

}
