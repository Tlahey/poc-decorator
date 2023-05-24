import { ErrorInterface } from "../interfaces/ErrorInterface";
import express from "express";

export class InternalServer extends Error implements ErrorInterface {
    code = 500;
    message = "Internal server error";

    catch(request: express.Request, response: express.Response, next: express.NextFunction) {
        response.status(this.code).send(this.message);
    }
}
