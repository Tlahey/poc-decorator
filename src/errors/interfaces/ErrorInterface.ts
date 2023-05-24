import express from "express";

export interface ErrorInterface {
    catch(request: express.Request, response: express.Response, next: express.NextFunction): void;
}
