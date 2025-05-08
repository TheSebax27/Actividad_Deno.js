import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface ProgramaData {
    idprograma: number | null;
    nombre_programa:string;
}

export class Programa {
    public _objPrograma: ProgramaData | null;
    public _idPrograma: number | null;
    /**
     *
     */
    constructor(objProgrma:ProgramaData | null = null, idPrograma: number | null = null) {
        this._objPrograma = objProgrma;
        this._idPrograma = idPrograma;
    }
    public async seleccionarPrograma():Promise<ProgramaData[]>{
        const{rows: data} = await conexion.execute("SELECT * FROM programa;");
        return data as ProgramaData[];
    }
    public async insertarPrograma(): Promise<{success: boolean; mensaje: string; programa?:Record<string,unknown>}>{
        try {
            if (!this._objPrograma) {
                throw new Error("no se proporciono el objeto");
            }
            const{nombre_programa} = this._objPrograma;
            if (!nombre_programa) {
                throw new Error("faltan campos");
            }
            await conexion.execute("START TRANSACTION");
            const result = await conexion.execute("INSERT INTO programa(nombre_programa) VAlUES (?);",[nombre_programa]);
            if (result && typeof result.affectedRows==="number" && result.affectedRows>0) {
                const{pro} = await conexion.query("SELECT * FROM programa WHERE idprograma = LAST_INSERT_ID();");

                await conexion.execute("COMMIT");
                return {success:true, mensaje:"programa registrado correctamente", programa:pro};
            }else{
                throw new Error("error al insertar");
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return{success:false, mensaje: error.message};
            }else{
                return{success:false, mensaje: "error interno"};

            }
        }
    }
    
    public async actualizarPrograma(): Promise<{ success: boolean; mensaje: string; prog?: Record<string, unknown> }> {
        try {
            if (!this._objPrograma || !this._idPrograma) {
                throw new Error("No se ha proporcionado un objeto programa o un ID.");
            }
            
            const { nombre_programa } = this._objPrograma;
            if (!nombre_programa) {
                throw new Error("Faltan datos del programa.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            const result = await conexion.execute(
                "UPDATE programa SET nombre_programa = ? WHERE idprograma = ?;", 
                [nombre_programa, this._idPrograma]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: programa } = await conexion.execute("SELECT * FROM programa WHERE idprograma = ?;", [this._idPrograma]);
                
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Programa actualizado correctamente", prog: programa && programa[0] ? programa[0] : undefined };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar el programa o el ID no existe.");
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
    
    public async eliminarPrograma(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._idPrograma) {
                throw new Error("No se ha proporcionado un ID de programa.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
           
            const { rows: existePrograma } = await conexion.execute(
                "SELECT * FROM programa WHERE idprograma = ?;", 
                [this._idPrograma]
            );
            
            if (!existePrograma || existePrograma.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "El programa no existe." };
            }
            
            
            const { rows: referenciasFicha } = await conexion.execute(
                "SELECT * FROM ficha WHERE programa_idprograma = ?;", 
                [this._idPrograma]
            );
            
            if (referenciasFicha && referenciasFicha.length > 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "No se puede eliminar el programa porque está siendo utilizado en fichas." };
            }
            
            
            const result = await conexion.execute(
                "DELETE FROM programa WHERE idprograma = ?;", 
                [this._idPrograma]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Programa eliminado correctamente" };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo eliminar el programa.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}