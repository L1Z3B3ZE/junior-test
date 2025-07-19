import type { FastifyStaticSwaggerOptions } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { OpenAPIV3 } from "openapi-types";
// @ts-ignore: ignore, no types installed in prod mode
import SwaggerJSDoc from "swagger-jsdoc";
import { HandlingErrorType } from "../enum/error-types";

const errorTypes = Object.values(HandlingErrorType)
    .map((i) => `<li>${i}</li>`)
    .join("");
const swaggerDocument = SwaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "To Do",
            version: "0.1.0",
            description: "<h3>The REST API documentation.</h3>" + "<b>Available error types:</b>" + `<ul>${errorTypes}</ul>`
        },
        servers: [{ url: process.env.APP_HOST }],
        components: {
            securitySchemes: {
                bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            }
        },
        security: [{ bearer: [] }]
    },
    apis: [`${process.cwd()}/external/docs/**/*.yaml`]
});

export const swaggerOption: FastifyStaticSwaggerOptions = {
    mode: "static",
    specification: { document: swaggerDocument as OpenAPIV3.Document }
};

export const swaggerUiOption: FastifySwaggerUiOptions = {
    routePrefix: "docs",
    uiConfig: { docExpansion: "none" }
};
