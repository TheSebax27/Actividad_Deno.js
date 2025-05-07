import { Router } from "../Dependencies/Dependencias.ts";
import { getProgramas, postProgramas, putProgramas, deleteProgramas } from "../Controllers/programaController.ts";

const programaRouter = new Router();

programaRouter.get("/programas", getProgramas);
programaRouter.post("/programas", postProgramas);
programaRouter.put("/programas/:id", putProgramas);
programaRouter.delete("/programas/:id", deleteProgramas);

export{programaRouter};