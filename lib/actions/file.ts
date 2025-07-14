"use server";

import { prisma } from "@/lib/prisma";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import z from "zod";

const confirmUploadSchema = z.object({
  fileKey: z.string(),
  documentId: z.string(),
});

export async function confirmUpload(data: z.infer<typeof confirmUploadSchema>) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const { fileKey, documentId } = confirmUploadSchema.parse(data);

  // Update the file with the document ID
  const updateResult = await prisma.file.update({
    where: { fileKey },
    data: { documentId },
  });

  if (!updateResult) {
    throw new Error("File not found");
  }

  // Get the file size from S3
  const headCommand = new HeadObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey,
  });

  const headResult = await s3.send(headCommand);

  const fileSize = headResult.ContentLength;

  // Update the file size in the database
  const updatedFile = await prisma.file.update({
    where: { fileKey },
    data: { fileSize },
  });

  if (!updatedFile) {
    throw new Error("Failed to update file size");
  }

  return { success: true };
}
