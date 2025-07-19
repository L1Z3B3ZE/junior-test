import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Kysely, ParseJSONResultsPlugin, PostgresDialect, sql } from "kysely";
import { Pool, types } from "pg";
import type { DB } from "../types/kysely/db.type";
import { logger } from "./pino-plugin";

declare module "fastify" {
    interface FastifyInstance {
        kysely: Kysely<DB>;
    }
}

export let sqlCon: Kysely<DB>;

export const KyselyConfig: FastifyPluginAsync = fp(async (fastify: FastifyInstance): Promise<void> => {
    try {
        types.setTypeParser(types.builtins.NUMERIC, function (val: string) {
            if (val !== undefined && val !== null) {
                return Number(val);
            }
            return val;
        });

        const pgDialect = new PostgresDialect({
            pool: new Pool({
                host: process.env.POSTGRES_HOST,
                port: Number(process.env.POSTGRES_PORT),
                user: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                database: process.env.POSTGRES_DATABASE
            })
        });

        const db = new Kysely<DB>({
            dialect: pgDialect,
            plugins: [new ParseJSONResultsPlugin()],
            log(event) {
                if (process.env.DB_LOGS === "true" && event.level === "query") {
                    logger.debug(
                        {
                            durationMs: `${event.queryDurationMillis.toFixed(2)} ms`,
                            sql: event.query.sql
                        },
                        "[SQL]"
                    );
                }
                if ((process.env.DB_LOGS === "error" || process.env.DB_LOGS === "debug") && event.level === "error") {
                    logger.error(
                        {
                            ...event
                        },
                        "[SQL]"
                    );
                }
            }
        });

        await sql<void>`SELECT 1`.execute(db);
        logger.info("[Postgres]: connection established");

        fastify.decorate("kysely", db);
        sqlCon = db;

        fastify.addHook("onClose", async () => {
            await db.destroy();
        });
    } catch (e) {
        logger.error("[Postgres]: failed to establish database connection. See details:");
        logger.error(e);
        process.exit(1);
    }
});
