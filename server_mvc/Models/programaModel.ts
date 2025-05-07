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
}
