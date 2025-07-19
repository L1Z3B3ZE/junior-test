import { FastifyReply, FastifyRequest } from "fastify";
import { IHandlingResponseError } from "../../../common/config/http-response";
import { AllowedImageMimeTypes } from "../../../common/enum/allowed-image-mime-types";
import { HandlingErrorType } from "../../../common/enum/error-types";
import { HttpStatusCode } from "../../../common/enum/http-status-code";
import { IUploadImageFastifySchema } from "../schemas/upload-image.schema";

export async function uploadImagePreValidation(req: FastifyRequest<IUploadImageFastifySchema>, rep: FastifyReply) {
    try {
        // Сохраняем файлы с ограничениями
        const data = await req.saveRequestFiles({
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
                files: 1
            }
        });

        const file = data[0];
        if (!file) {
            const info: IHandlingResponseError = {
                type: HandlingErrorType.Found,
                property: "file",
                message: "No file uploaded"
            };
            return rep.code(HttpStatusCode.BAD_REQUEST).send(info);
        }

        // Проверка MIME-типа
        if (!Object.values(AllowedImageMimeTypes).includes(file.mimetype as AllowedImageMimeTypes)) {
            const info = {
                type: HandlingErrorType.Allowed,
                property: "file",
                message: `Invalid file format. Allowed formats: ${Object.values(AllowedImageMimeTypes).join(", ")}`
            };
            return rep.code(HttpStatusCode.BAD_REQUEST).send(info);
        }

        const buffer = await file.toBuffer();

        // Заполняем тело запроса для основной обработки
        req.body = {
            fileBuffer: buffer,
            fileData: {
                filename: file.filename,
                mimetype: file.mimetype,
                encoding: file.encoding,
                fieldname: file.fieldname
            }
        };
    } catch (error) {
        req.log.error(error);
        return rep.code(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            message: "File upload validation failed"
        });
    }
}
