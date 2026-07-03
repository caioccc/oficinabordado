import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const oficinaId = process.env.NEXT_PUBLIC_OFICINA_ID;

    const { data, error } = await supabase
      .from("oficinas")
      .select("titulo, vagas_totais, vagas_restantes, preco")
      .eq("id", oficinaId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Oficina não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
