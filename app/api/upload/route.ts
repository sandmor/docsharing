import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  contentType: z.string(),
  name: z.string(),
});

export async function POST(req: NextRequest) {
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

  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key,
    Expires: 3600,
    Conditions: [["content-length-range", 0, maxFileSize]],
    Fields: {
      "Content-Type": contentType,
    },
  });

  return NextResponse.json({
    url,
    fields,
    key: Key,
  });
}
