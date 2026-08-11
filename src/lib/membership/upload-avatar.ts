import { createServiceClient } from "@/lib/supabase/admin";

export async function uploadAvatarFromDataUrl(
  userId: string,
  dataUrl: string,
): Promise<string | null> {
  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i,
  );
  if (!match) return null;

  const contentType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) return null;

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${userId}/avatar.${ext}`;
  const admin = createServiceClient();

  const { error } = await admin.storage.from("avatars").upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) return null;

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;
}
