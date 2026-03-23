import { Router, Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { MetaController } from "../controllers/MetaController";

const router = Router();
const metaController = new MetaController();

router.use(authMiddleware);

router.get("/metas", async (req: Request, res: Response) => {
    metaController.getAll(req, res);
});

router.get("/metas/:id", async (req: Request, res: Response) => {
    metaController.getById(req, res);
});

router.post("/metas", async (req: Request, res: Response) => {
    metaController.create(req, res);
});

router.put("/metas/:id", async (req: Request, res: Response) => {
    metaController.update(req, res);
});

router.delete("/metas/:id", async (req: Request, res: Response) => {
    metaController.delete(req, res);
});

router.get("/metas/:id/aportes", async (req: Request, res: Response) => {
    metaController.listAportes(req, res);
});

router.post("/metas/:id/aportes", async (req: Request, res: Response) => {
    metaController.addAporte(req, res);
});

router.delete("/metas/:id/aportes/:aporteId", async (req: Request, res: Response) => {
    metaController.removeAporte(req, res);
});

export default router;
