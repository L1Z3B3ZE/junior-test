import { format } from "date-fns-tz";
import pino from "pino";

const transport = pino.transport({
    targets: [
        {
            target: "pino-pretty",
            options: {
                translateTime: false,
                colorize: true
            }
        }
    ]
});

const pinoConfig = pino(
    {
        base: null,
        level: process.env.LOGGER_LEVEL || "info",
        serializers: {
            stack: (stack: string | undefined) => {
                return stack ? stack.replace("Error", "").replaceAll("\n", "").trim().split("  at ") : undefined;
            }
        },
        formatters: {
            level(label) {
                return { level: label.toUpperCase() };
            }
        },
        timestamp: () => `,"time":"${format(new Date(), "yyyy-MM-dd HH:mm:ss", { timeZone: "Asia/Tomsk" })}"`
    },
    transport
);

export const logger = pinoConfig;
