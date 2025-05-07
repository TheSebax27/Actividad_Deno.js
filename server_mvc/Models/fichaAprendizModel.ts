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
}