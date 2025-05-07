import { Router } from "../Dependencies/Dependencias.ts";
import { getAprendices, postAprendices, putAprendices, deleteAprendices } from "../Controllers/aprendizController.ts";
const aprendizRouter = new Router();

aprendizRouter.get("/aprendices", getAprendices);
aprendizRouter.post("/aprendices", postAprendices);
aprendizRouter.put("/aprendices/:id", putAprendices);
aprendizRouter.delete("/aprendices/:id", deleteAprendices);
export { aprendizRouter };