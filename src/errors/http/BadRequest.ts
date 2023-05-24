import { ErrorInterface } from "../interfaces/ErrorInterface";
import express from "express";

export class BadRequest extends Error implements ErrorInterface {
    code = 400;
    message = "Bad request";

    catch(request: express.Request, response: express.Response, next: express.NextFunction) {
        response.status(this.code).send(this.message);
    }
}
