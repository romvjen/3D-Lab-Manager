import { supabase } from "./supabase";

// Get all equipment (with filters)
export async function getEquipment({
  q = "",
  category = "all",
  status = "all",
} = {}) {
  let query = supabase.from("equipment").select("*");

  if (q) {
    query = query.or(
      `qr_code.ilike.%${q}%,name.ilike.%${q}%,category.ilike.%${q}%,location_path.ilike.%${q}%`
    );
  }

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("name");

  if (error) throw error;

  //  Map database fields → UI-friendly shape
  return data.map((item) => ({
    id: item.qr_code, // UI expects `id` to be the QR code
    name: item.name,
    category: item.category,
    status: item.status,
    locationPath: item.location_path,
    thumbnailUrl: item.thumbnail_url,
    x: item.x,
    y: item.y,
    z: item.z,
  }));
}

// Get single equipment by QR code (NOT UUID)
export async function getEquipmentById(qrCode) {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("qr_code", qrCode)
    .single();

  if (error) throw error;

  //Map to UI structure
  return {
    id: data.qr_code,
    name: data.name,
    category: data.category,
    status: data.status,
    locationPath: data.location_path,
    thumbnailUrl: data.thumbnail_url,
    x: data.x,
    y: data.y,
    z: data.z,
  };
}
