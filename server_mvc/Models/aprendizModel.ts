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
                const { rows: aprendiz } = await conexion.execute("SELECT * FROM aprendiz WHERE idaprendiz = LAST_INSERT_ID();");
                
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Aprendiz insertado correctamente", apren: aprendiz && aprendiz[0] ? aprendiz[0] : undefined };
            }else{
                throw new Error("No se pudo insertar el aprendiz.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            if (error instanceof z.ZodError) {
                return { success: false, mensaje: error.message };
            } else {
                return { success: false, mensaje: "Error inesperado" };
            }
        }
    }
    
    public async actualizarAprendiz(): Promise<{ success: boolean; mensaje: string; apren?: Record<string, unknown> }> {
        try {
            if (!this._objAprendiz || !this._idAprendiz) {
                throw new Error("No se ha proporcionado un objeto aprendiz o un ID.");
            }
            
            const { nombre, apellido, email, telefono } = this._objAprendiz;
            if (!nombre || !apellido || !email || !telefono) {
                throw new Error("Faltan datos del aprendiz.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            const result = await conexion.execute(
                "UPDATE aprendiz SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE idaprendiz = ?;", 
                [nombre, apellido, email, telefono, this._idAprendiz]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                const { rows: aprendiz } = await conexion.execute("SELECT * FROM aprendiz WHERE idaprendiz = ?;", [this._idAprendiz]);
                
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Aprendiz actualizado correctamente", apren: aprendiz && aprendiz[0] ? aprendiz[0] : undefined };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo actualizar el aprendiz o el ID no existe.");
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
    
    public async eliminarAprendiz(): Promise<{ success: boolean; mensaje: string }> {
        try {
            if (!this._idAprendiz) {
                throw new Error("No se ha proporcionado un ID de aprendiz.");
            }
            
            await conexion.execute("START TRANSACTION;");
            
            // Primero verificamos si el aprendiz existe
            const { rows: existeAprendiz } = await conexion.execute(
                "SELECT * FROM aprendiz WHERE idaprendiz = ?;", 
                [this._idAprendiz]
            );
            
            if (!existeAprendiz || existeAprendiz.length === 0) {
                await conexion.execute("ROLLBACK;");
                return { success: false, mensaje: "El aprendiz no existe." };
            }
            
            // Verificar si hay referencias en tablas relacionadas (ficha_has_aprendiz)
            const { rows: referencias } = await conexion.execute(
                "SELECT * FROM ficha_has_aprendiz WHERE aprendiz_idaprendiz = ?;", 
                [this._idAprendiz]
            );
            
            if (referencias && referencias.length > 0) {
                // Si hay referencias, primero eliminarlas
                await conexion.execute(
                    "DELETE FROM ficha_has_aprendiz WHERE aprendiz_idaprendiz = ?;", 
                    [this._idAprendiz]
                );
            }
            
            // Ahora eliminamos el aprendiz
            const result = await conexion.execute(
                "DELETE FROM aprendiz WHERE idaprendiz = ?;", 
                [this._idAprendiz]
            );
            
            if (result && typeof result.affectedRows === "number" && result.affectedRows > 0) {
                await conexion.execute("COMMIT;");
                return { success: true, mensaje: "Aprendiz eliminado correctamente" };
            } else {
                await conexion.execute("ROLLBACK;");
                throw new Error("No se pudo eliminar el aprendiz.");
            }
        } catch (error) {
            await conexion.execute("ROLLBACK;");
            return { success: false, mensaje: `Error al eliminar: ${error}` };
        }
    }
}