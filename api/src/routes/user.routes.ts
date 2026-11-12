import { Application, Router } from "express";
import userController from "../controllers/user.controllers";

export default (app: Application): void => {
  const router = Router();

  router.post("/", userController.create);
  router.get("/", userController.getAll);
  router.delete("/:id", userController.remove);
  // Fictitious authentication: checks the username and password, without session or token
  router.post("/login", userController.login);

  app.use("/api/users", router);
};
