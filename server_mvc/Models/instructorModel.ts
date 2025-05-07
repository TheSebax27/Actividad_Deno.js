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
    
    public async actualizarInstructor(): Promise<{ success: boolean; mensaje: string; instr?: Record<string, unknown> }> {
        try {
            if (!this._objInstructor || !this._idInstructor) {
                throw new Error("No se ha proporcionado un objeto instructor o un ID.");
            }
            
            const { nombre, apellido, email, telefono } = this._objInstructor;
            if (!nombre || !apellido || !email || !telefono) {
                throw new Error("Faltan datos del instructor.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            const result = await conexion.execute(
                "UPDATE instructor SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE idinstructor = ?;", 
                [nombre, apellido, email, telefono, this._idInstructor]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: instructor } = await conexion.execute("SELECT * FROM instructor WHERE idinstructor = ?;", [this._idInstructor]);
                
                await conexion.execute("COMMIT;");
                // Aquí está la corrección: verificamos que instructor existe y tiene elementos antes de acceder a instructor[0]
                return { success: true, mensaje: "Instructor actualizado correctamente", instr: instructor && instructor[0] ? instructor[0] : undefined };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar el instructor o el ID no existe.");
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
    
    public async eliminarInstructor(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._idInstructor) {
                throw new Error("No se ha proporcionado un ID de instructor.");
            }
            
            await conexion.execute("START TRANSACTION");
            
            // Primero verificamos si el instructor existe
            const { rows: existeInstructor } = await conexion.execute(
                "SELECT * FROM instructor WHERE idinstructor = ?;", 
                [this._idInstructor]
            );
            
            if (!existeInstructor || existeInstructor.length === 0) {
                await conexion.execute("ROLLBACK");
                return { success: false, mensaje: "El instructor no existe." };
            }
            
            // Verificar si hay referencias en tablas relacionadas
            const { rows: referenciasFicha } = await conexion.execute(
                "SELECT * FROM ficha_has_aprendiz WHERE instructor_idinstructor = ?;", 
                [this._idInstructor]
            );
            
            const { rows: referenciasProfesion } = await conexion.execute(
                "SELECT * FROM instructor_has_profesion WHERE instructor_idinstructor = ?;", 
                [this._idInstructor]
            );
            
            if ((referenciasFicha && referenciasFicha.length > 0) || 
                (referenciasProfesion && referenciasProfesion.length > 0)) {
                // Si hay referencias, primero las eliminamos
                if (referenciasFicha && referenciasFicha.length > 0) {
                    await conexion.execute(
                        "DELETE FROM ficha_has_aprendiz WHERE instructor_idinstructor = ?;", 
                        [this._idInstructor]
                    );
                }
                
                if (referenciasProfesion && referenciasProfesion.length > 0) {
                    await conexion.execute(
                        "DELETE FROM instructor_has_profesion WHERE instructor_idinstructor = ?;", 
                        [this._idInstructor]
                    );
                }
            }
            
            // Ahora eliminamos el instructor
            const result = await conexion.execute(
                "DELETE FROM instructor WHERE idinstructor = ?;", 
                [this._idInstructor]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT");
                return { success: true, mensaje: "Instructor eliminado correctamente" };
            } else {
                await conexion.execute("ROLLBACK");
                throw new Error("No se pudo eliminar el instructor.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}