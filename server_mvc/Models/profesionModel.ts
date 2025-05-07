import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface ProfesionData {
    idprofesion: number | null;
    nombre_profesion: string;
}

export class Profesion {

    public _objProfesion: ProfesionData | null;
    public _idProfesion: number | null;

    /**
     *
     */
    constructor(objProfesion: ProfesionData | null = null, idProfesion: number | null = null) {
        this._objProfesion = objProfesion;
        this._idProfesion = idProfesion;
    }
    public async seleccionarProfesion(): Promise<ProfesionData[]> {
        const { rows: profesion } = await conexion.execute("SELECT * FROM profesion;");
        return profesion as ProfesionData[];
    }
    public async insertarProfesion(): Promise<{ success: boolean; mensaje: string; profesion?: Record<string, unknown> }> {
        try {
            if (!this._objProfesion) {
                throw new Error("No se ha proporcionado una profesion");
            }
            const { nombre_profesion } = this._objProfesion;
            if (!nombre_profesion) {
                throw new Error("faltan campos");
            }
            await conexion.execute("START TRANSACTION");
            const result = await conexion.execute("INSERT INTO profesion (nombre_profesion) VALUES (?);", [nombre_profesion]);
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
               const {pro} = await conexion.query("SELECT * FROM profesion WHERE idprofesion = LAST_INSERT_ID();");
               await conexion.execute("COMMIT");
               return {success:true, mensaje:"Profesion insertada correctamente", profesion: pro }
            }else{
                throw new Error("error al insertar profesion");
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: "error inesperado" };
            }
        }
    }
}