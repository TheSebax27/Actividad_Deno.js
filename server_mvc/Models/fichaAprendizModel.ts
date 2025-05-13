import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface FichaAprendizData {
    ficha_idficha: number ;
    aprendiz_idaprendiz: number ;
    instructor_idinstructor: number ;
}

export class FichaAprendiz {
    public _objFichaAprendiz: FichaAprendizData | null;
    public _idfichaAprendiz: number | null;

    /**
     *
     */
    constructor(objFichaAprendiz: FichaAprendizData | null = null, idFichaAprendiz: number | null = null) {
        this._objFichaAprendiz = objFichaAprendiz;
        this._idfichaAprendiz = idFichaAprendiz;
    }
    public async seleccionarFichaAprendiz():Promise<FichaAprendizData[]>{
        const {rows: data} = await conexion.execute("SELECT * FROM ficha_has_aprendiz;");
        return data as FichaAprendizData[];
    }
    public async insertarFicha(): Promise<{ success: boolean; mensaje: string; ids?: Record<string, unknown> }> {
        try {
            if (!this._objFichaAprendiz) {
                throw new Error("no se proporciono un objeto FichaAprendiz");
            }
            const { ficha_idficha, aprendiz_idaprendiz, instructor_idinstructor } = this._objFichaAprendiz;
            if (!ficha_idficha || !aprendiz_idaprendiz || !instructor_idinstructor ) {
                throw new Error("faltan campos");
            }
            await conexion.execute("START TRANSACTION");
            const result = await conexion.execute("INSERT INTO ficha_has_aprendiz(ficha_idficha, aprendiz_idaprendiz, instructor_idinstructor) VALUES (?,?,?)", [ficha_idficha, aprendiz_idaprendiz, instructor_idinstructor]);
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { query } = await conexion.query("SELECT * FROM ficha_has_aprendiz WHERE ficha_idficha = ? AND aprendiz_idaprendiz = ? "+
                    "  AND instructor_idinstructor = ?",[ficha_idficha, aprendiz_idaprendiz, instructor_idinstructor]
                );
                await conexion.execute("COMMIT");
                return { success: true, mensaje: "ids registrados correctamente", ids: query }
            } else {
                throw new Error("error al insertar");
            }

        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: `error inesperado${error}` };
            }
        }
    }
    
    public async actualizarFichaAprendiz(): Promise<{ success: boolean; mensaje: string; ids?: Record<string, unknown> }> {
        try {
            if (!this._objFichaAprendiz || !this._idfichaAprendiz) {
                throw new Error("No se ha proporcionado un objeto FichaAprendiz o un ID.");
            }
            
            const fichaID = this._idfichaAprendiz;
            const {aprendiz_idaprendiz, instructor_idinstructor} = this._objFichaAprendiz;
            if (!fichaID || !aprendiz_idaprendiz || !instructor_idinstructor) {
                throw new Error("Faltan datos de la ficha aprendiz.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            const { rows: existe } = await conexion.execute(
                `SELECT * 
                   FROM ficha_has_aprendiz 
                  WHERE ficha_idficha     = ?
                    AND aprendiz_idaprendiz = ?;`,
                [fichaID, aprendiz_idaprendiz]
              );
              if (!existe || existe.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La relación no existe." };
              }
            
           
            const result = await conexion.execute(
                `UPDATE ficha_has_aprendiz
            SET instructor_idinstructor = ?
          WHERE ficha_idficha     = ?
            AND aprendiz_idaprendiz = ?;`, 
                [instructor_idinstructor,fichaID,aprendiz_idaprendiz]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: relacion } = await conexion.execute(
                    `SELECT * 
                    FROM ficha_has_aprendiz 
                   WHERE ficha_idficha        = ?
                     AND aprendiz_idaprendiz  = ?;`,
                 [fichaID, aprendiz_idaprendiz]
                );
                
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Relación actualizada correctamente", ids: relacion && relacion[0] ? relacion[0] : undefined };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar la relación.");
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
    
    public async eliminarFichaAprendiz(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._objFichaAprendiz && !this._idfichaAprendiz) {
                throw new Error("No se ha proporcionado información para eliminar la relación.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
         
            const ficha_id = this._idfichaAprendiz || (this._objFichaAprendiz ? this._objFichaAprendiz.ficha_idficha : null);
            if (!ficha_id) {
                throw new Error("Falta el ID de la ficha.");
            }
            
         
            const { rows: existeFicha } = await conexion.execute(
                "SELECT * FROM ficha_has_aprendiz WHERE ficha_idficha = ?;", 
                [ficha_id]
            );
            
            if (!existeFicha || existeFicha.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La ficha no existe o no tiene aprendices asignados." };
            }
            
          
            if (this._objFichaAprendiz && this._objFichaAprendiz.aprendiz_idaprendiz && this._objFichaAprendiz.instructor_idinstructor) {
                const result = await conexion.execute(
                    "DELETE FROM ficha_has_aprendiz WHERE ficha_idficha = ? AND aprendiz_idaprendiz = ? AND instructor_idinstructor = ?;", 
                    [ficha_id, this._objFichaAprendiz.aprendiz_idaprendiz, this._objFichaAprendiz.instructor_idinstructor]
                );
                
                if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                    await conexion.execute("COMMIT;");
                    return { success: true, mensaje: "Relación eliminada correctamente" };
                } else {
                    await conexion.execute("ROLLBACK;");
                    return { success: false, mensaje: "No se encontró la relación específica" };
                }
            } else {
               
                const result = await conexion.execute(
                    "DELETE FROM ficha_has_aprendiz WHERE ficha_idficha = ?;", 
                    [ficha_id]
                );
                
                if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                    await conexion.execute("COMMIT;");
                    return { success: true, mensaje: `Se eliminaron ${result.affectedRows} relaciones correctamente` };
                } else {
                    await conexion.execute("ROLLBACK;");
                    throw new Error("No se pudieron eliminar las relaciones.");
                }
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}