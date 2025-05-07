import { Application, oakCors } from "./Dependencies/Dependencias.ts";
import { aprendizRouter } from "./Routes/aprendizRouter.ts";
import { fichaRouter } from "./Routes/fichaRouter.ts";
import { profesionRouter } from "./Routes/profesionRouter.ts";
import { programaRouter } from "./Routes/programaRouter.ts";
import { instructorProfesionRouter } from "./Routes/instructorProfesionRouter.ts";
import { fichaAprendizRouter } from "./Routes/fichaAprendizRouter.ts";
import { instructorRouter } from "./Routes/instructorRouter.ts";
const app = new Application();

app.use(oakCors());

const routers = [aprendizRouter, fichaRouter,profesionRouter, programaRouter, instructorProfesionRouter, fichaAprendizRouter, instructorRouter];
routers.forEach(r => {
    app.use(r.routes());
    app.use(r.allowedMethods());
})

console.log("Server running on http://localhost:8000");
app.listen({ port: 8000 });