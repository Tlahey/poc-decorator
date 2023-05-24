import {Request, Response} from "express";
import { Controller, Get, Post, Path, Query, Req, Res, Required, Status, UseBefore, UseAfter, Headers, Body } from '@decorator';
import { CustomError } from '@error';

@Controller('/data')
export class DataController {
    @Get('/hello/:id/:world')
    getHello(
        @Path('id') id: string,
        @Path('world') world,
        @Query('test') @Required test: string | string[], // check si valeur par défaut = non requis
        @Req() req: Request,
        @Res() res: Response) {
        return { hello: 'world', id, world, test };
    }

    @Status(201)
    @UseBefore(async () => {
        console.log("USE BEFORE");
    })
    @Get('/foo/:id/:bar')
    @UseAfter(async () => {
        console.log("USE AFTER");
    })
    getFoo(
        @Path('id') id: string,
        @Headers('content-type') contentType: string,
        @Path('bar') bar,
        @Query('test') @Required test,
        @Req() req: Request,
        @Res() res: Response) {
        console.log("Execute");
        return { foo: 'bar', id, bar, test, contentType };
    }

    @Post('/create')
    create(
        @Body() @Required person: any,
        @Body('name') name: string
    ) {
        return {
            ...person,
            bodyName: name,
        };
    }

    @Get('/crash-known')
    crashKnown() {
        throw new CustomError();
    }

    @Get('/crash-unkown')
    crashUnknown() {
        throw new Error();
    }

}
