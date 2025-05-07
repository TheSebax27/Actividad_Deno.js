import { Router } from "../Dependencies/Dependencias.ts";
import { getInstructores, postInstructores, putInstructores, deleteInstructores } from "../Controllers/instructorController.ts";

const instructorRouter = new Router();

instructorRouter.get("/instructores", getInstructores);
instructorRouter.post("/instructores", postInstructores);
instructorRouter.put("/instructores/:id", putInstructores);
instructorRouter.delete("/instructores/:id", deleteInstructores);

export { instructorRouter };
