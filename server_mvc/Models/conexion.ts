import { Client } from "../Dependencies/Dependencias.ts";

export const conexion = await new Client().connect({
 hostname: "localhost",
 username: "root",
    password:"root",
    db: "sena_mvc",
    port: 3306,
});