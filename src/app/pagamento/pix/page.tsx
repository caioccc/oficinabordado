"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Center,
  Loader,
  Box,
} from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCopy, IconCheck } from "@tabler/icons-react";
import {
  buildPixPayload,
  getPixKeyFormatted,
  type PixKeyType,
} from "@/lib/pix";

interface InscricaoDados {
  nome: string;
  preco: number;
  redirectUrl: string;
}

export default function PixPage() {
  const router = useRouter();
  const [dados, setDados] = useState<InscricaoDados | null>(null);
  const [copiado, setCopiado] = useState(false);

  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY || "";
  const pixKeyType = (process.env.NEXT_PUBLIC_PIX_KEY_TYPE ||
    "phone") as PixKeyType;
  const pixName = process.env.NEXT_PUBLIC_PIX_NAME || "";
  const pixCity = process.env.NEXT_PUBLIC_PIX_CITY || "";

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("inscricao_dados");
    if (!dadosSalvos) {
      router.push("/");
      return;
    }
    setDados(JSON.parse(dadosSalvos));
  }, [router]);

  const pixKeyFormatted = getPixKeyFormatted(pixKeyType, pixKey);

  if (!dados) {
    return (
      <Center className="h-screen bg-[#FAFAF9]">
        <Loader color="rose" size="lg" type="dots" />
      </Center>
    );
  }

  const pixPayload = buildPixPayload(pixKeyType, pixKey, pixName, dados.preco);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopiado(true);
      notifications.show({
        title: "Código copiado!",
        message: "Cole no app do seu banco para pagar.",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      notifications.show({
        title: "Erro ao copiar",
        message: "Tente selecionar e copiar manualmente.",
        color: "red",
      });
    }
  };

  return (
    <Container size="sm" className="py-12 px-4">
      <Stack align="center" className="mb-8 text-center">
        <Title
          order={2}
          className="text-2xl md:text-3xl font-bold text-stone-800"
        >
          Pague via PIX
        </Title>
        <Text className="text-stone-500 text-base">
          Escaneie o QR Code ou copie o código abaixo
        </Text>
      </Stack>

      <Card
        padding="xl"
        radius="lg"
        withBorder
        className="bg-white border-stone-200"
      >
        <Stack gap="xl" align="center">
          {/* Valor */}
          <Stack gap={4} align="center">
            <Text
              size="sm"
              className="text-stone-400 uppercase tracking-wider font-semibold"
            >
              Valor a pagar
            </Text>
            <Text fw={800} size="xl" className="text-stone-800">
              R${" "}
              {Number(dados.preco).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Stack>

          {/* QR Code */}
          <Box
            p="lg"
            className="rounded-xl bg-white border border-stone-100 shadow-sm"
          >
            <QRCodeSVG
              value={pixPayload}
              size={220}
              level="M"
              bgColor="#ffffff"
              fgColor="#292524"
            />
          </Box>

          {/* Chave PIX */}
          <Stack gap={4} align="center">
            <Text fw={600} size="md" className="text-stone-700">
              {pixKeyFormatted}
            </Text>
          </Stack>

          {/* Código copia e cola */}
          <Stack gap="xs" align="center" className="w-full">
            <Text
              size="xs"
              className="text-stone-400 uppercase tracking-wider font-semibold"
            >
              Código PIX copia e cola
            </Text>
            <Card
              padding="sm"
              radius="md"
              className="w-full bg-stone-50 border-stone-200"
              withBorder
            >
              <Text
                size="xs"
                className="text-stone-500 break-all font-mono leading-relaxed"
                style={{ wordBreak: "break-all" }}
              >
                {pixPayload}
              </Text>
            </Card>
            <Button
              variant="light"
              color="rose"
              size="md"
              fullWidth
              className="mt-1 font-semibold"
              leftSection={
                copiado ? <IconCheck size={18} /> : <IconCopy size={18} />
              }
              onClick={handleCopiar}
              style={{
                backgroundColor: copiado ? "#dcfce7" : undefined,
                color: copiado ? "#166534" : undefined,
              }}
            >
              {copiado ? "Copiado!" : "Copiar código"}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Instruções */}
      <Card
        padding="md"
        radius="md"
        className="mt-6 bg-stone-50 border-stone-200"
        withBorder
      >
        <Stack gap="xs">
          <Text size="sm" fw={600} className="text-stone-600">
            Como pagar:
          </Text>
          <Text size="sm" className="text-stone-500">
            1. Abra o app do seu banco ou carteira digital
          </Text>
          <Text size="sm" className="text-stone-500">
            2. Escolha a opção pagar com PIX
          </Text>
          <Text size="sm" className="text-stone-500">
            3. Escaneie o QR Code ou cole o código copiado
          </Text>
          <Text size="sm" className="text-stone-500">
            4. Confirme o pagamento
          </Text>
        </Stack>
      </Card>

      {/* Botão voltar */}
      <Button
        variant="subtle"
        color="stone"
        size="md"
        className="mt-6 font-semibold"
        leftSection={<IconArrowLeft size={18} />}
        onClick={() => router.push("/pagamento")}
      >
        Voltar e escolher outra forma
      </Button>
    </Container>
  );
}
