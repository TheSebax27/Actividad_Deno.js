import { conexion } from "./conexion.ts";
import { z } from "../Dependencies/Dependencias.ts";

interface InstructorProfesionData {
    instructor_idinstructor: number ;
    profesion_idprofesion: number ;
}
export class InstructorProfesion {
    public _objInstructorProfesion: InstructorProfesionData | null;
    public _idInstructorProfesion: number | null;

    /**
     *
     */
    constructor(objInstructorProfesion: InstructorProfesionData | null = null, idInstructorProfesion: number | null = null) {
        this._objInstructorProfesion = objInstructorProfesion;
        this._idInstructorProfesion = idInstructorProfesion;
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

}