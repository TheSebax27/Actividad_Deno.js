import { Router } from "../Dependencies/Dependencias.ts";
import {getInstructorProfesion, postInstructorProfesion, putInstructorProfesion, deleteInstructorProfesion} from "../Controllers/instructorProfesionController.ts";

const instructorProfesionRouter = new Router();

instructorProfesionRouter.get("/instructorProfesion", getInstructorProfesion);
instructorProfesionRouter.post("/instructorProfesion", postInstructorProfesion);
instructorProfesionRouter.put("/instructorProfesion/:id", putInstructorProfesion);
instructorProfesionRouter.delete("/instructorProfesion/:id", deleteInstructorProfesion);

export { instructorProfesionRouter };