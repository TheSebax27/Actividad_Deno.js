import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface InstructorData {
    idinstructor: number | null;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
}
export class Instructor {
    public _objInstructor: InstructorData | null;
    public _idInstructor: number | null;
    /**
     *
     */
    constructor(objInstructor: InstructorData | null = null, idInstructor: number | null = null) {
        this._objInstructor = objInstructor;
        this._idInstructor = idInstructor;
    }
    public async seleccionarInstructor(): Promise<InstructorData[]> {
        const { rows: inst } = await conexion.execute("SELECT * FROM instructor");
        return inst as InstructorData[];
    }
    public async insertarInstructor(): Promise<{ success: boolean; mensaje: string; instructor?: Record<string, unknown> }> {
        try {
            if (!this._objInstructor) {
                throw new Error("no se proporciono un instructor");
            }
            const { nombre, apellido, email, telefono } = this._objInstructor;
            if (!nombre || !apellido || !email || !telefono) {
                throw new Error("faltan campos");
            }
            await conexion.execute("START TRANSACTION");
            const result = await conexion.execute("INSERT INTO instructor(nombre,apellido,email,telefono) VALUES (?,?,?,?)", [nombre, apellido, email, telefono]);
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { inst } = await conexion.query("SELECT * FROM instructor WHERE idinstructor = LAST_INSERT_ID();");
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
}
