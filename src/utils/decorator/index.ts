import 'reflect-metadata';
import MetadataKeys from '../Metadata.keys';
import * as express from 'express';

// Création des injecteurs

const injectRoute = (method: string) => (path: string): MethodDecorator => function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("injectRoute ", method, path, target, propertyKey, descriptor);
    const existingRoutes = Reflect.getMetadata(MetadataKeys.ROUTE_METADATA_KEY, target, propertyKey) || [];
    Reflect.defineMetadata(MetadataKeys.ROUTE_METADATA_KEY, [...existingRoutes, { path, method }], target, propertyKey);
}

const injectParam = (requestParam: string) => (propertyName?: string) => function(target: any, propertyKey: string, parameterIndex: number) {
    console.log("injectParam ", JSON.stringify(target), propertyKey, parameterIndex);
    const existingParams = Reflect.getMetadata(MetadataKeys.PARAMS_METADATA_KEY, target, propertyKey) || [];
    Reflect.defineMetadata(MetadataKeys.PARAMS_METADATA_KEY, [...existingParams, { name: propertyName, parameterIndex, type: requestParam }], target, propertyKey);
}

export function Controller(path: string) {
    return function(target: any) {
        console.log("Controller ", path, target);
        Reflect.defineMetadata(MetadataKeys.CONTROLLER_METADATA_KEY, path, target);
    }
}

export function Required(target: any, propertyKey: string | symbol, parameterIndex: number) {
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata(MetadataKeys.REQUIRED_META_KEY, target, propertyKey) || [];
    Reflect.defineMetadata(MetadataKeys.REQUIRED_META_KEY, [...existingRequiredParameters, parameterIndex], target, propertyKey);
}

export function Status(statusCode: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(MetadataKeys.STATUS_METADATA_KEY, statusCode, target, propertyKey);
    }
}

export function UseBefore(action: (req: express.Request, res: express.Response) => Promise<void>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingRoutes = Reflect.getMetadata(MetadataKeys.USE_BEFORE_METADATA_KEY, target, propertyKey) || [];
        Reflect.defineMetadata(MetadataKeys.USE_BEFORE_METADATA_KEY, [...existingRoutes, action], target, propertyKey);
    }
}

export function UseAfter(action: (req: express.Request, res: express.Response) => Promise<void>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingRoutes = Reflect.getMetadata(MetadataKeys.USE_AFTER_METADATA_KEY, target, propertyKey) || [];
        Reflect.defineMetadata(MetadataKeys.USE_AFTER_METADATA_KEY, [...existingRoutes, action], target, propertyKey);
    }
}

// Création des décorateurs

export const Get = injectRoute('get');
export const Post = injectRoute('post');
export const Put = injectRoute('put');
export const Delete = injectRoute('delete');
export const All = injectRoute('all');

export const Req = injectParam('request');
export const Res = injectParam('response');
export const Path = injectParam('params');
export const Query = injectParam('query');
export const Body = injectParam('body');
export const Cookies = injectParam('cookies');
export const Headers = injectParam('headers');
