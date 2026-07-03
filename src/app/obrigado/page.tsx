"use client";

import { useEffect } from "react";
import {
  Container,
  Card,
  Title,
  Text,
  Button,
  Stack,
  Center,
} from "@mantine/core";
import { IconBrandWhatsapp, IconCheck } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export default function ObrigadoPage() {
  // Dispara o estouro de confetes assim que a página renderizar com sucesso
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FDA4AF", "#F43F5E", "#BE123C"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FDA4AF", "#F43F5E", "#BE123C"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <Center className="min-h-screen bg-[#FAFAF9] px-4">
      <Container size="xs" className="w-full">
        <Card
          shadow="xl"
          padding="xl"
          radius="lg"
          withBorder
          className="bg-white border-rose-100 text-center"
        >
          <Stack align="center" gap="lg">
            {/* Ícone Lindo de Verificação Concluída */}
            <Center className="w-16 h-16 bg-rose-50 rounded-full border border-rose-100">
              <IconCheck size={32} className="text-rose-600" />
            </Center>

            <Stack gap="xs">
              <Title
                order={1}
                className="text-2xl font-black text-stone-800 tracking-tight"
              >
                Inscrição Pré-Reservada!
              </Title>
              <Text size="sm" className="text-stone-500 leading-relaxed">
                Falta muito pouco! Assim que o Mercado Pago confirmar a
                compensação do seu pagamento, sua vaga estará 100% garantida.
              </Text>
            </Stack>

            <hr className="border-stone-100 w-full" />

            <Stack gap="sm" className="w-full">
              <Text
                size="xs"
                className="text-stone-400 font-bold uppercase tracking-wider"
              >
                Próximo passo obrigatório
              </Text>

              {/* Botão para o Grupo de WhatsApp ou Contato Direto */}
              <Button
                size="lg"
                color="green"
                leftSection={<IconBrandWhatsapp size={22} />}
                className="bg-emerald-600 hover:bg-emerald-700 font-semibold w-full text-white shadow-md transition-transform active:scale-95"
                component="a"
                href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTATO_WHATSAPP}?text=Olá!%20Acabei%20de%20realizar%20o%20pagamento%20da%20minha%20inscrição%20na%20oficina%20de%20bordado!`}
                target="_blank"
              >
                Entrar no Grupo
              </Button>

              <Text size="xs" className="text-stone-400">
                Clique acima para falar comigo ou entrar no grupo de alunas.
              </Text>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Center>
  );
}
