import express from 'express';
import { createRouter } from './src/utils';
import {UserController, DataController} from "@controller";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Création d'un router en utilisant les controller
const router = createRouter([UserController, DataController]);

// Ajout des routes à la route /api
app.use('/api', router);

app.listen(3001, () => {
    console.log("Server start port 3000")
});
