import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface InstructorProfesionData {
    instructor_idinstructor: number ;
    profesion_idprofesion: number ;
}
export class InstructorProfesion {
    public _objInstructorProfesion: InstructorProfesionData | null;
    public _oldidInstructorProfesion: number | null;
 
    /**
     *
     */
    constructor(objInstructorProfesion: InstructorProfesionData | null = null, idInstructorProfesion: number | null = null) {
        this._objInstructorProfesion = objInstructorProfesion;
        this._oldidInstructorProfesion = idInstructorProfesion;
    }
    public async seleccionarInstructorProfesion(): Promise<InstructorProfesionData[]> {
            const { rows: inst } = await conexion.execute("SELECT * FROM instructor_has_profesion");
            return inst as InstructorProfesionData[];
        }
        public async insertarInstructorProfesion(): Promise<{ success: boolean; mensaje: string; instructor?: Record<string, unknown> }> {
            try {
                if (!this._objInstructorProfesion) {
                    throw new Error("no se proporciono un instructor");
                }
                const { instructor_idinstructor, profesion_idprofesion } = this._objInstructorProfesion;
                if (!instructor_idinstructor || !profesion_idprofesion ) {
                    throw new Error("faltan campos");
                }
                await conexion.execute("START TRANSACTION");
                const result = await conexion.execute("INSERT INTO instructor_has_profesion(instructor_idinstructor, profesion_idprofesion) VALUES (?,?)", [instructor_idinstructor,profesion_idprofesion]);
                if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                    const { inst } = await conexion.query("SELECT * FROM instructor_has_profesion WHERE instructor_idinstructor = ? AND profesion_idprofesion = ? ",[instructor_idinstructor, profesion_idprofesion]);
                    await conexion.execute("COMMIT");
                    return { success: true, mensaje: "instructor registrado correctamente", instructor: inst }
                } else {
                    throw new Error("error al insertar");
                }
    
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return { success: false, mensaje: error.message };
                } else {
                    return { success: false, mensaje: "error inesperado" };
                }
            }
        }
        
    public async actualizarInstructorProfesion(): Promise<{ success: boolean; mensaje: string; data?: Record<string, unknown> }> {
        try {
            if (!this._objInstructorProfesion || !this._oldidInstructorProfesion) {
                throw new Error("No se ha proporcionado la información necesaria para actualizar.");
            }
            
            const { instructor_idinstructor, profesion_idprofesion } = this._objInstructorProfesion;
            if (!instructor_idinstructor || !profesion_idprofesion) {
                throw new Error("Faltan datos para la actualización.");
            }
            const oldi = this._oldidInstructorProfesion;
            await conexion.execute("START TRANSACTION;");
            
            
           
            
            
            const result = await conexion.execute(
                `UPDATE instructor_has_profesion
         SET instructor_idinstructor = ?
         WHERE instructor_idinstructor = ?
           AND profesion_idprofesion   = ?;`, 
                [instructor_idinstructor, oldi, profesion_idprofesion]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: relacion } = await conexion.execute(
                    `SELECT *
                    FROM instructor_has_profesion
                    WHERE instructor_idinstructor = ?
                      AND profesion_idprofesion   = ?;`,
                    [instructor_idinstructor, profesion_idprofesion]
                );
                
                await conexion.execute("COMMIT;");
                return { 
                    success: true, 
                    mensaje: "Relación instructor-profesión actualizada correctamente", 
                    data: relacion && relacion[0] ? relacion[0] : undefined 
                };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar la relación instructor-profesión.");
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
    
    public async eliminarInstructorProfesion(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._objInstructorProfesion && !this._oldidInstructorProfesion) {
                throw new Error("No se ha proporcionado información para eliminar.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            let instructor_id: number;
            let profesion_id: number;
            
            if (this._objInstructorProfesion) {
              
                instructor_id = this._objInstructorProfesion.instructor_idinstructor;
                profesion_id = this._objInstructorProfesion.profesion_idprofesion;
            } else {
              
                instructor_id = this._oldidInstructorProfesion as number;
                
               
                const { rows: relaciones } = await conexion.execute(
                    "SELECT * FROM instructor_has_profesion WHERE instructor_idinstructor = ?;", 
                    [instructor_id]
                );
                
                if (!relaciones || relaciones.length === 0) {
                    await conexion.execute("ROLLBACK;");
                    return { success: false, mensaje: "No existen relaciones para este instructor." };
                }
                
             
                profesion_id = (relaciones[0] as InstructorProfesionData).profesion_idprofesion;
            }
            
           
            const { rows: existeRelacion } = await conexion.execute(
                "SELECT * FROM instructor_has_profesion WHERE instructor_idinstructor = ? AND profesion_idprofesion = ?;", 
                [instructor_id, profesion_id]
            );
            
            if (!existeRelacion || existeRelacion.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La relación instructor-profesión no existe." };
            }
            
           
            const result = await conexion.execute(
                "DELETE FROM instructor_has_profesion WHERE instructor_idinstructor = ? AND profesion_idprofesion = ?;", 
                [instructor_id, profesion_id]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Relación instructor-profesión eliminada correctamente" };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo eliminar la relación instructor-profesión.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}