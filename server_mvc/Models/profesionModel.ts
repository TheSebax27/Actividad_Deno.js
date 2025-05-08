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
    
    public async actualizarProfesion(): Promise<{ success: boolean; mensaje: string; profesion?: Record<string, unknown> }> {
        try {
            if (!this._objProfesion || !this._idProfesion) {
                throw new Error("No se ha proporcionado un objeto profesión o un ID.");
            }
            
            const { nombre_profesion } = this._objProfesion;
            if (!nombre_profesion) {
                throw new Error("Faltan datos de la profesión.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
          
            const { rows: existeProfesion } = await conexion.execute(
                "SELECT * FROM profesion WHERE idprofesion = ?;", 
                [this._idProfesion]
            );
            
            if (!existeProfesion || existeProfesion.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La profesión no existe." };
            }
            
           
            const result = await conexion.execute(
                "UPDATE profesion SET nombre_profesion = ? WHERE idprofesion = ?;", 
                [nombre_profesion, this._idProfesion]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: profesion } = await conexion.execute(
                    "SELECT * FROM profesion WHERE idprofesion = ?;", 
                    [this._idProfesion]
                );
                
                await conexion.execute("COMMIT;");
                return { 
                    success: true, 
                    mensaje: "Profesión actualizada correctamente", 
                    profesion: profesion && profesion[0] ? profesion[0] : undefined 
                };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar la profesión.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: `Error inesperado: ${error}` };
            }
        }
    }
    
    public async eliminarProfesion(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._idProfesion) {
                throw new Error("No se ha proporcionado un ID de profesión.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
           
            const { rows: existeProfesion } = await conexion.execute(
                "SELECT * FROM profesion WHERE idprofesion = ?;", 
                [this._idProfesion]
            );
            
            if (!existeProfesion || existeProfesion.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La profesión no existe." };
            }
            
           
            const { rows: referencias } = await conexion.execute(
                "SELECT * FROM instructor_has_profesion WHERE profesion_idprofesion = ?;", 
                [this._idProfesion]
            );
            
            if (referencias && referencias.length > 0) {
                
                await conexion.execute(
                    "DELETE FROM instructor_has_profesion WHERE profesion_idprofesion = ?;", 
                    [this._idProfesion]
                );
            }
            
            
            const result = await conexion.execute(
                "DELETE FROM profesion WHERE idprofesion = ?;", 
                [this._idProfesion]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Profesión eliminada correctamente" };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo eliminar la profesión.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}