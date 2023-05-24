import {Request, Response} from "express";
import { Controller, Get, Path, Query, Req, Res, Required } from '@decorator';

// Création d'un controller users
// appelable via /api/users
@Controller('/users')
export class UserController {

    // Création d'une route
    @Get('/hello/:id/:world')
    getHello(
        @Path('id') id: string,     // Récupération du paramètre id dans le path
        @Path('world') world,
        @Query('test') @Required test,  // Récupération du query param test dans l'url et est requis.
        @Req() req: Request, // récupération de la request
        @Res() res: Response) { // récupération de la response
        return { hello: 'world', id, world, test };
    }

    @Get('/foo/:id/:bar')
    getFoo(
        @Path('id') id: string,
        @Path('bar') bar,
        @Query('test') @Required test,
        @Req() req: Request,
        @Res() res: Response) {
        return { foo: 'bar', id, bar, test };
    }
}
