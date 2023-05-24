import 'reflect-metadata';
import MetadataKeys from './Metadata.keys';
import express, {NextFunction, Request, Response} from "express";
import { BadRequest } from "@error";
import {ErrorInterface} from "../errors/interfaces/ErrorInterface";
import {InternalServer} from "../errors/http/InternalServer";

type MethodType = 'get' | 'post' | 'put' | 'delete';

// Fonction qui permet de décorer l'appel au service
function getMiddlewareForControllerMethod(
    controllerInstance: any,
    methodName: string,
    sortedParamsMeta: any,
    requiredParametersIndex: number[],
    successStatus?: number
) {

    return async (req: Request, res: Response, next: NextFunction) => {

        // Create an object to store the values for each parameter
        const paramValues = [];

        // Iterate through each parameter and try to get its value from the request object
        for(const param of sortedParamsMeta) {

            // On récupère les informations du paramètre
            const { name, type, parameterIndex } = <any>param;

            // On check dans le paramètre de la fonction, s'il possède un nom, qu'il y a la valeur
            if (name && req[type] && req[type][name]) {
                paramValues.push(req[type][name]);
            }
            // Dans le cas où il n'y a pas de nom, on vérifie que le paramètre est présent et contient une valeur
            else if (!name && (typeof req[type] === 'object' && Object.keys(req[type]).length > 0)) {
                paramValues.push(req[type]);
            }
            // Si aucun paramètre n'a été trouvé, on vient vérifier que celui-ci est pas dans la liste des paramètres requis
            // Si c'est le cas, alors on retourne l'erreur à l'utilisateur
            else if (requiredParametersIndex.includes(parameterIndex)) {
                throw new BadRequest(`Missing required ${type}` + (name && `.${name}` || ''));
            }
            // Dans le cas contraire, on vient ajouter une valeur undefined
            else {
                paramValues.push(undefined);
            }
        }

        // On exécute la fonction en lui injectant les paramètres traités précédement
        const result = await controllerInstance[methodName](...paramValues);

        // Si on a un status de retour prédéfini, on l'ajoute au status
        successStatus && res.status(successStatus);

        // On retourne dans la réponse le résultat
        res.json(result);
    };
}

// Gestion des erreurs, si la fonction est issu de l'interface ErrorInterface, on execute la fonction catch
// Sinon on throw une internal server error
function ErrorMiddlewareHandler(error: Error | ErrorInterface, request: express.Request, response: express.Response, next: express.NextFunction) {
    if("catch" in error) {
        error.catch(request, response, next);
    } else {
        (new InternalServer()).catch(request, response, next);
    }
}

// Fonction permettant d'exécuter les actions
const useHandler = (useActions: Array<(req: express.Request, res: express.Response) => void>) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // On récupère l'ensemble des actions et on les exécute 1 par 1
    try {
        for (const useAction of useActions) {
            await useAction(req, res);
        }
    } catch (err) {
        next(err);
    }
};

export function createRouter(controllers: any[]) {

    // init un nouveau router
    const router = express.Router();

    // Pour l'ensemble des controllers
    controllers.forEach((controller) => {

        const instance = new controller();

        // On récupère toutes les méthodes associés à la class
        const methodsNames = Object.getOwnPropertyNames(controller.prototype);

        // On récupère le path associé au controller @Controller("path")
        const controllerPath = Reflect.getMetadata(MetadataKeys.CONTROLLER_METADATA_KEY, controller);

        // Pour chacune des méthodes de la class
        for (const methodName of methodsNames) {

            // On récupère toutes les routes associés à la méthode (@Get / @Post / ....) il peut y avoir plusieurs routes pour la même fonction
            const routeConfigs = Reflect.getMetadata(MetadataKeys.ROUTE_METADATA_KEY, controller.prototype, methodName);

            // Si une route est trouvé
            if (routeConfigs) {

                // Alors pour chacune de ces routes, on vient créer le middleware
                for (const routeConfig of routeConfigs) {

                    // On récupère le type de la méthode (Get / POst ...)
                    const methodType: MethodType = routeConfig.method;

                    // On récupère le path associé à la méthode (@Get('path'))
                    const path = controllerPath + routeConfig.path;

                    // On vient récupérer toutes les autres inforamtions associé à la fonction
                    // - Actions à exécuter avant
                    // - Action à exécuter après
                    // - Les paramètres requis pour la fonction
                    // - Le status de la fonction si elle retourne un succés (TODO: peut être améliorer en étant injecté directement dans la method)
                    // - Récupère l'ensemble des paramètres de la méthode à récupérer
                    const useBefore = Reflect.getMetadata(MetadataKeys.USE_BEFORE_METADATA_KEY, controller.prototype, methodName) || [];
                    const useAfter = Reflect.getMetadata(MetadataKeys.USE_AFTER_METADATA_KEY, controller.prototype, methodName) || [];
                    const requiredParameters: number[] = Reflect.getMetadata(MetadataKeys.REQUIRED_META_KEY, controller.prototype, methodName) || [];
                    const status = Reflect.getMetadata(MetadataKeys.STATUS_METADATA_KEY, controller.prototype, methodName);
                    const paramsMetadata = Reflect.getMetadata(MetadataKeys.PARAMS_METADATA_KEY, controller.prototype, methodName) || [];

                    // On remet dans l'ordre les paramètres pour l'injection
                    const sortedParamsMeta = paramsMetadata?.sort((a, b) => a.parameterIndex - b.parameterIndex);

                    // Création de la suite d'appel pour le router
                    const actions = [
                        ...useBefore,
                        getMiddlewareForControllerMethod(instance, methodName, sortedParamsMeta, requiredParameters, status),
                        ...useAfter,
                    ].filter(Boolean);

                    // On crée la route avec les actions associés
                    router[methodType](path, useHandler(actions));
                }
            }
        }
    });

    router.use(ErrorMiddlewareHandler);

    return router;
}
