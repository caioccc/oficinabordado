import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      tipo_participacao,
      experiencia_bordado,
      o_que_bordar,
      melhor_dia,
      permite_uso_imagem,
      expectativas,
    } = body;

    // Validação básica dos campos da primeira etapa
    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 },
      );
    }

    const oficinaId = process.env.NEXT_PUBLIC_OFICINA_ID;
    const checkoutUrl = process.env.NEXT_PUBLIC_MP_CHECKOUT_URL;
    const adminSupabase = getSupabaseAdmin();

    // Atualize a chamada da RPC passando os novos campos mapeados
    const { data: inscricaoId, error } = await adminSupabase.rpc(
      "realizar_inscricao",
      {
        p_oficina_id: oficinaId,
        p_nome: nome,
        p_email: email,
        p_telefone: telefone,
        p_mp_preference_id: null,
        // 👇 Novos campos adicionados ao payload da RPC:
        p_tipo_participacao: tipo_participacao,
        p_experiencia_bordado: experiencia_bordado,
        p_o_que_bordar: o_que_bordar,
        p_melhor_dia: melhor_dia,
        p_permite_uso_imagem: permite_uso_imagem,
        p_expectativas: expectativas,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ redirectUrl: checkoutUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno ao processar inscrição" },
      { status: 500 },
    );
  }
}
