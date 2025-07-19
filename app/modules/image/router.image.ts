import type { FastifyInstance } from "fastify";
import { getByUuidFastifySchema } from "../shared/schemas/get-by-uuid.schema";
import * as imageController from "./controller.image";
import { getImagesFastifySchema } from "./schemas/get-images.schema";
import { uploadImageFastifySchema } from "./schemas/upload-image.schema";
import { uploadImagePreValidation } from "./utils/upload-image-pre-validation";

export const imageRouter = async (app: FastifyInstance) => {
    app.post("/:albumId", { schema: uploadImageFastifySchema, preValidation: uploadImagePreValidation }, imageController.uploadImage);
    app.get("/", { schema: getImagesFastifySchema }, imageController.getImages);
    app.get("/:id", { schema: getByUuidFastifySchema }, imageController.getOne);
    app.delete("/:id", { schema: getByUuidFastifySchema }, imageController.deleteImage);
};
