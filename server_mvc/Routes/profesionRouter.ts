import { Router } from "../Dependencies/Dependencias.ts";
import { getProfesion,postProfesion,putProfesion,deleteProfesion } from "../Controllers/profesionController.ts";
const profesionRouter = new Router();

profesionRouter.get("/profesion", getProfesion);
profesionRouter.post("/profesion", postProfesion);
profesionRouter.put("/profesion/:id", putProfesion);
profesionRouter.delete("/profesion/:id", deleteProfesion);


export { profesionRouter };