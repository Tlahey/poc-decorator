import express from "express";
import { ErrorInterface } from './interfaces/ErrorInterface';

/**
 * Création d'une erreur custom,
 * Elle possède une fonction catch qui, quand on throw une erreur, process le message.
 * Il sera possible de gérer plus finement les erreurs
 * TODO: Peut être faire un AbstractError qui possède une fonction catch par défaut pour ne pas devoir la redéfinir à chaque fois ?
 */
export class CustomError extends Error implements ErrorInterface {
    catch(request: express.Request, response: express.Response, next: express.NextFunction) {
        response.status(305).send('Custom');
    }
}
