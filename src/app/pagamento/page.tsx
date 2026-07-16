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
} from "@mantine/core";
import { IconQrcode, IconCreditCard } from "@tabler/icons-react";

interface InscricaoDados {
  nome: string;
  preco: number;
  redirectUrl: string;
}

export default function PagamentoPage() {
  const router = useRouter();
  const [metodo, setMetodo] = useState<"pix" | "cartao" | null>(null);
  const [dados, setDados] = useState<InscricaoDados | null>(null);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("inscricao_dados");
    if (!dadosSalvos) {
      router.push("/");
      return;
    }
    setDados(JSON.parse(dadosSalvos));
  }, [router]);

  if (!dados) {
    return (
      <Center className="h-screen bg-[#FAFAF9]">
        <Loader color="rose" size="lg" type="dots" />
      </Center>
    );
  }

  const handlePagar = () => {
    if (metodo === "cartao") {
      localStorage.removeItem("inscricao_dados");
      window.location.assign(dados.redirectUrl);
    } else if (metodo === "pix") {
      router.push("/pagamento/pix");
    }
  };

  return (
    <Container size="sm" className="py-12 px-4">
      <Stack align="center" className="mb-10 text-center">
        <Title
          order={2}
          className="text-2xl md:text-3xl font-bold text-stone-800"
        >
          Forma de Pagamento
        </Title>
        <Text className="text-stone-500 text-base">
          Escolha como deseja pagar sua inscrição
        </Text>
      </Stack>

      <Stack gap="lg">
        {/* Card PIX */}
        <Card
          padding="xl"
          radius="lg"
          withBorder
          className="cursor-pointer select-none transition-all duration-200 ease-in-out hover:border-rose-400 hover:shadow-md hover:scale-[1.02]"
          style={{
            borderWidth: 2,
            borderColor: metodo === "pix" ? "#ec4899" : "rgb(229 231 235)",
            backgroundColor: metodo === "pix" ? "#fdf2f8" : "white",
          }}
          onClick={() => setMetodo("pix")}
        >
          <Group gap="lg" align="center">
            <Center
              className="w-14 h-14 rounded-xl transition-colors duration-200"
              style={{
                backgroundColor: metodo === "pix" ? "#fce7f3" : "#f5f5f4",
              }}
            >
              <IconQrcode
                size={32}
                className="transition-colors duration-200"
                style={{
                  color: metodo === "pix" ? "#ec4899" : "#78716c",
                }}
              />
            </Center>
            <div className="flex-1">
              <Text
                fw={700}
                size="lg"
                className="transition-colors duration-200"
                style={{
                  color: metodo === "pix" ? "#be185d" : "#292524",
                }}
              >
                PIX
              </Text>
              <Text size="sm" className="text-stone-500">
                Pagamento instantâneo. Aprovação imediata.
              </Text>
            </div>
          </Group>
        </Card>

        {/* Card Cartão */}
        <Card
          padding="xl"
          radius="lg"
          withBorder
          className="cursor-pointer select-none transition-all duration-200 ease-in-out hover:border-rose-400 hover:shadow-md hover:scale-[1.02]"
          style={{
            borderWidth: 2,
            borderColor: metodo === "cartao" ? "#ec4899" : "rgb(229 231 235)",
            backgroundColor: metodo === "cartao" ? "#fdf2f8" : "white",
          }}
          onClick={() => setMetodo("cartao")}
        >
          <Group gap="lg" align="center">
            <Center
              className="w-14 h-14 rounded-xl transition-colors duration-200"
              style={{
                backgroundColor: metodo === "cartao" ? "#fce7f3" : "#f5f5f4",
              }}
            >
              <IconCreditCard
                size={32}
                className="transition-colors duration-200"
                style={{
                  color: metodo === "cartao" ? "#ec4899" : "#78716c",
                }}
              />
            </Center>
            <div className="flex-1">
              <Text
                fw={700}
                size="lg"
                className="transition-colors duration-200"
                style={{
                  color: metodo === "cartao" ? "#be185d" : "#292524",
                }}
              >
                Cartão de Crédito
              </Text>
              <Text size="sm" className="text-stone-500">
                Pagamento seguro via Mercado Pago.
              </Text>
              <Text size="sm" className="text-stone-500">
                Valor com acréscimo de taxa de operação financeira.
              </Text>
            </div>
          </Group>
        </Card>

        {/* Botão Pagar */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: metodo ? "100px" : "0px",
            opacity: metodo ? 1 : 0,
          }}
        >
          <Button
            size="lg"
            fullWidth
            className="mt-2 font-semibold shadow-sm text-white"
            style={{ backgroundColor: "#A76D5E" }}
            onClick={handlePagar}
          >
            {metodo === "pix"
              ? "Gerar QR Code PIX"
              : "Ir para Pagamento Seguro"}
          </Button>
        </div>
      </Stack>

      {/* Resumo */}
      <Card
        padding="md"
        radius="md"
        className="mt-8 bg-stone-50 border-stone-200"
        withBorder
      >
        <Group justify="space-between" align="center">
          <Text size="sm" className="text-stone-500">
            Inscrição de{" "}
            <span className="font-semibold text-stone-700">{dados.nome}</span>
          </Text>
          <Text fw={700} size="lg" className="text-stone-800">
            R${" "}
            {Number(dados.preco).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </Group>
      </Card>
    </Container>
  );
}
