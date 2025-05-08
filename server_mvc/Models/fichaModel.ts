import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface FichaData {
    idficha: number | null;
    codigo: string;
    fecha_inicio_lectiva: string;
    fecha_fin_lectiva: string;
    fecha_fin_practica: string;
    programa_idprograma: number;
}

export class Ficha{
    public _objFicha: FichaData | null;
    public _idficha: number | null;
    /**
     *
     */
    constructor(objficha: FichaData | null = null, idficha: number | null = null) {
        this._objFicha = objficha;
        this._idficha = idficha;
    }
    public async seleccionarFicha():Promise <FichaData[]>{
        const{rows: ficha}= await conexion.execute("SELECT * FROM ficha;");
        return ficha as FichaData[];
    }
    public async insertarFicha(): Promise<{ success: boolean; mensaje: string; instructor?: Record<string, unknown> }> {
        try {
            if (!this._objFicha) {
                throw new Error("no se proporciono una ficha");
            }
            const { codigo, fecha_inicio_lectiva, fecha_fin_lectiva, fecha_fin_practica, programa_idprograma } = this._objFicha;
            if (!codigo || !fecha_inicio_lectiva || !fecha_fin_lectiva || !fecha_fin_practica || !programa_idprograma) {
                throw new Error("faltan campos");
            }
            await conexion.execute("START TRANSACTION");
            const result = await conexion.execute("INSERT INTO ficha(codigo,fecha_inicio_lectiva,fecha_fin_lectiva, fecha_fin_practica, programa_idprograma) VALUES (?,?,?,?,?)", [codigo, fecha_inicio_lectiva, fecha_fin_lectiva, fecha_fin_practica, programa_idprograma]);
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { inst } = await conexion.query("SELECT * FROM ficha WHERE idficha = LAST_INSERT_ID();");
                await conexion.execute("COMMIT");
                return { success: true, mensaje: "ficha registrada correctamente", instructor: inst }
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

    public async actualizarFicha(): Promise<{ success: boolean; mensaje: string; ficha?: Record<string, unknown> }> {
        try {
            if (!this._objFicha || !this._idficha) {
                throw new Error("No se ha proporcionado un objeto ficha o un ID.");
            }
            
            const { codigo, fecha_inicio_lectiva, fecha_fin_lectiva, fecha_fin_practica, programa_idprograma } = this._objFicha;
            if (!codigo || !fecha_inicio_lectiva || !fecha_fin_lectiva || !fecha_fin_practica || !programa_idprograma) {
                throw new Error("Faltan datos de la ficha.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            
            const { rows: existeFicha } = await conexion.execute(
                "SELECT * FROM ficha WHERE idficha = ?;", 
                [this._idficha]
            );
            
            if (!existeFicha || existeFicha.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La ficha no existe." };
            }
            
          
            const result = await conexion.execute(
                "UPDATE ficha SET codigo = ?, fecha_inicio_lectiva = ?, fecha_fin_lectiva = ?, fecha_fin_practica = ?, programa_idprograma = ? WHERE idficha = ?;", 
                [codigo, fecha_inicio_lectiva, fecha_fin_lectiva, fecha_fin_practica, programa_idprograma, this._idficha]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: ficha } = await conexion.execute("SELECT * FROM ficha WHERE idficha = ?;", [this._idficha]);
                
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Ficha actualizada correctamente", ficha: ficha && ficha[0] ? ficha[0] : undefined };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar la ficha.");
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
    
    public async eliminarFicha(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._idficha) {
                throw new Error("No se ha proporcionado un ID de ficha.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
       
            const { rows: existeFicha } = await conexion.execute(
                "SELECT * FROM ficha WHERE idficha = ?;", 
                [this._idficha]
            );
            
            if (!existeFicha || existeFicha.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "La ficha no existe." };
            }
            
           
            const { rows: referenciasAprendiz } = await conexion.execute(
                "SELECT * FROM ficha_has_aprendiz WHERE ficha_idficha = ?;", 
                [this._idficha]
            );
            
           
            if (referenciasAprendiz && referenciasAprendiz.length > 0) {
                await conexion.execute(
                    "DELETE FROM ficha_has_aprendiz WHERE ficha_idficha = ?;", 
                    [this._idficha]
                );
            }
            
         
            const result = await conexion.execute(
                "DELETE FROM ficha WHERE idficha = ?;", 
                [this._idficha]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Ficha eliminada correctamente" };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo eliminar la ficha.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}