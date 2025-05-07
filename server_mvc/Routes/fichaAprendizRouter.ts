import { Router } from "../Dependencies/Dependencias.ts";
import { getFichasAprendiz, postFichasAprendiz, putFichasAprendiz,deleteFichasAprendiz } from "../Controllers/fichaAprendizController.ts";  

const fichaAprendizRouter = new Router();

fichaAprendizRouter.get("/fichaAprendiz", getFichasAprendiz);  
fichaAprendizRouter.post("/fichaAprendiz", postFichasAprendiz);
fichaAprendizRouter.put("/fichaAprendiz/:id", putFichasAprendiz);
fichaAprendizRouter.delete("/fichaAprendiz/:id", deleteFichasAprendiz);

export { fichaAprendizRouter };