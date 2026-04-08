import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing({
  errorFormatter: (err) => {
    return {
      message: err.message,
      code: err.code,
    };
  },
});

export const ourFileRouter = {
    imageUploader: f({ 
        image: { 
            maxFileSize: "8MB",
            maxFileCount: 10, // Allow up to 10 images per artwork
        }
    })
        .middleware(async ({ req }) => {
            // In a real app, you would check auth here
            return { userId: "demo-user" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
