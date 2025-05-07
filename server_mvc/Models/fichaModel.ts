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
    
}
