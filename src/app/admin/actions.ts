"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function requireAdmin(): Promise<SupabaseClient> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) throw new Error("No autorizado");
  return supabase;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createRestaurante(formData: FormData) {
  const supabase = await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || nombre);

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!slug) throw new Error("El slug no es válido");

  const { error } = await supabase.from("negocios").insert({
    nombre,
    slug,
    activo: true,
  });

  if (error) {
    if (error.code === "23505")
      throw new Error("Ya existe un restaurante con ese slug");
    throw new Error("No se pudo crear el restaurante");
  }

  revalidatePath("/admin");
}

export async function activarRestaurante(id: number) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("negocios")
    .update({ activo: true })
    .eq("id", id);
  if (error) throw new Error("No se pudo activar el restaurante");
  revalidatePath("/admin");
}

export async function updateRestaurante(formData: FormData) {
  const supabase = await requireAdmin();

  const id = Number(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim());
  const activo = formData.get("activo") === "on";
  const suspendido = formData.get("suspendido") === "on";
  const plan = String(formData.get("plan") ?? "").trim() || null;
  const fechaPago = String(formData.get("fecha_pago") ?? "").trim() || null;
  const ownerId = String(formData.get("owner_id") ?? "").trim() || null;

  // Qué idiomas concretos, además del español, puede activar este
  // restaurante por su cuenta desde su panel
  // (src/app/dashboard/configuracion) -- lo eliges tú aquí, restaurante
  // por restaurante. El dueño solo puede marcar los que estén en esta
  // lista; si quiere otro, tiene que pedirlo y se le añade desde aquí.
  const IDIOMAS_VALIDOS = ["en", "de", "it", "sv", "fr"];
  const idiomasPermitidos = formData
    .getAll("idiomas_permitidos")
    .map(String)
    .filter((l) => IDIOMAS_VALIDOS.includes(l));

  if (!id) throw new Error("Restaurante no válido");
  if (!nombre) throw new Error("El nombre es obligatorio");
  if (!slug) throw new Error("El slug no es válido");

  const { error } = await supabase
    .from("negocios")
    .update({
      nombre,
      slug,
      activo,
      suspendido,
      plan,
      fecha_pago: fechaPago,
      owner_id: ownerId,
      idiomas_permitidos: idiomasPermitidos,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505")
      throw new Error("Ya existe un restaurante con ese slug");
    if (error.code === "22P02")
      throw new Error("El UID del propietario no es válido");
    throw new Error("No se pudo guardar el restaurante");
  }

  revalidatePath("/admin");
}

export async function deleteRestaurante(id: number) {
  const supabase = await requireAdmin();

  // No hay migraciones versionadas en este repo para confirmar que las
  // claves foráneas de platos/categorias hacia negocios tienen
  // ON DELETE CASCADE, así que se borran explícitamente los platos y
  // categorías del negocio antes de borrar el negocio en sí, para no
  // arriesgarnos a que falle a medias por una restricción de clave foránea.
  const { error: platosError } = await supabase
    .from("platos")
    .delete()
    .eq("negocio_id", id);
  if (platosError)
    throw new Error("No se pudieron eliminar los platos del restaurante");

  const { error: categoriasError } = await supabase
    .from("categorias")
    .delete()
    .eq("negocio_id", id);
  if (categoriasError)
    throw new Error("No se pudieron eliminar las categorías del restaurante");

  const { error } = await supabase.from("negocios").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar el restaurante");

  revalidatePath("/admin");
}
