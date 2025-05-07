import { Router } from "../Dependencies/Dependencias.ts";
import { getFichas, postFichas, putFichas, deleteFichas } from "../Controllers/fichaController.ts";

const fichaRouter = new Router();

fichaRouter.get("/fichas", getFichas);
fichaRouter.post("/fichas", postFichas);
fichaRouter.put("/fichas/:id", putFichas);
fichaRouter.delete("/fichas/:id", deleteFichas);

export { fichaRouter };