import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface AprendizData {
    idaprendiz: number | null;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
}
export class Aprendiz {
    public _objAprendiz: AprendizData | null;
    public _idAprendiz: number | null;
    /**
     *
     */
    constructor(objAprendiz: AprendizData | null = null, idAprendiz: number | null = null) {
        this._objAprendiz = objAprendiz;
        this._idAprendiz = idAprendiz;
    }

    public async seleccionarAprendiz(): Promise<AprendizData[]> {
        const { rows: aprendiz } = await conexion.execute("SELECT * FROM aprendiz;");
        return aprendiz as AprendizData[];
    }
    public async insertarAprendiz(): Promise<{ success: boolean; mensaje: string; apren?: Record<string, unknown> }> {
        try {

            if (!this._objAprendiz) {
                throw new Error("No se ha proporcionado un objeto aprendiz.");
            }
            const { nombre, apellido, email, telefono } = this._objAprendiz;
            if (!nombre || !apellido || !email || !telefono) {
                throw new Error("Faltan datos del aprendiz.");
            }
            await conexion.execute("START TRANSACTION;");
            const result = await conexion.execute(
                "INSERT INTO aprendiz (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?);", [nombre, apellido, email, telefono])
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { aprendiz } = await conexion.query("SELECT * FROM aprendiz WHERE idaprendiz = LAST_INSERT_ID();");

                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Aprendiz insertado correctamente", apren: aprendiz };
            }else{
                throw new Error("No se pudo insertar el aprendiz.");
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: "Error inesperado" };
            }
        }
    }

}
