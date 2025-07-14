import { prisma } from "@/lib/prisma";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  contentType: z.string(),
  name: z.string(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userUsage = prisma.file.aggregate({
    where: { userId },
    _sum: {
      fileSize: true,
    },
  });

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const body = await req.json();
  const { contentType, name } = BodySchema.parse(body);
  const ex = name.split(".").pop();
  const Key = `${randomUUID()}.${ex}`;

  const userQuota = 1024 * 1024 * 100; // 100 MB
  const maxFileSize = userQuota - ((await userUsage)._sum.fileSize || 0);
  if (maxFileSize <= 0) {
    return NextResponse.json({ error: "User quota exceeded" }, { status: 403 });
  }

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key,
    Expires: 3600,
    Conditions: [["content-length-range", 0, maxFileSize]],
    Fields: {
      "Content-Type": contentType,
    },
  });

  await prisma.file.create({
    data: {
      userId,
      fileKey: Key,
      fileName: name,
      fileType: contentType,
      fileSize: null, // Size will be determined after upload
    },
  });

  return NextResponse.json({
    url,
    fields,
    key: Key,
  });
}
