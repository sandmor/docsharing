import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });
  const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

  return NextResponse.json({
    url,
    key: Key,
    publicUrl,
  });
}
