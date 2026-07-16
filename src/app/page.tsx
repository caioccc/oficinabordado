"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import {
  Container,
  Card,
  Progress,
  Badge,
  Text,
  Title,
  Button,
  Group,
  Stack,
  TextInput,
  Modal,
  Loader,
  Center,
  Affix,
  Transition,
  Stepper,
  Radio,
  Textarea,
  Anchor,
  Divider,
  SimpleGrid,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IMaskInput } from "react-imask";
import {
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconCalendarEvent,
  IconMapPin,
  IconUsers,
  IconHeart,
  IconScissors,
  IconCoffee,
  IconBook2,
  IconArrowRight,
  IconPlayerPlay,
  IconClock,
  IconGift,
} from "@tabler/icons-react";
import Link from "next/link";

interface OficinaData {
  titulo: string;
  vagas_totais: number;
  vagas_restantes: number;
  preco: number;
}

interface InscricaoForm {
  nome: string;
  email: string;
  telefone: string;
  tipo_participacao: string;
  experiencia_bordado: string;
  o_que_bordar: string;
  melhor_dia: string;
  permite_uso_imagem: string;
  expectativas: string;
}

export default function LandingPage() {
  const [oficina, setOficina] = useState<OficinaData | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isMobile = useMediaQuery("(max-width: 48em)");

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<InscricaoForm>({
    defaultValues: {
      tipo_participacao: "Quero ir só uma vez",
      experiencia_bordado: "Não",
      o_que_bordar: "Um desenho já pronto",
      melhor_dia: "Final de semana",
      permite_uso_imagem: "Sim",
      expectativas: "",
    },
  });

  useEffect(() => {
    let ativo = true;

    const executarBusca = async () => {
      try {
        const response = await axios.get("/api/oficinas");
        if (ativo) {
          setOficina(response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar vagas:", error);
      }
    };

    executarBusca();
    const interval = setInterval(executarBusca, 10000);

    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, []);

  const proximoPasso = async () => {
    let camposValidos = false;

    if (activeStep === 0) {
      camposValidos = await trigger(["nome", "email", "telefone"]);
    } else if (activeStep === 1) {
      camposValidos = await trigger([
        "tipo_participacao",
        "experiencia_bordado",
        "o_que_bordar",
        "melhor_dia",
      ]);
    } else if (activeStep === 2) {
      camposValidos = await trigger(["permite_uso_imagem", "expectativas"]);
    }

    if (camposValidos) {
      setActiveStep((current) => (current < 3 ? current + 1 : current));
    }
  };

  const passoAnterior = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current));

  const onSubmitInscricao = async (data: InscricaoForm) => {
    setEnviando(true);
    try {
      const response = await axios.post("/api/checkout", data);

      if (response.data.redirectUrl) {
        localStorage.setItem(
          "inscricao_dados",
          JSON.stringify({
            nome: data.nome,
            preco: oficina?.preco,
            redirectUrl: response.data.redirectUrl,
          }),
        );
        notifications.show({
          title: "Vaga Reservada!",
          message: "Escolha sua forma de pagamento...",
          color: "green",
          loading: true,
          autoClose: 2000,
        });
        window.location.href = "/pagamento";
      }
    } catch (error: any) {
      notifications.show({
        title: "Ops! Ocorreu um problema",
        message:
          error.response?.data?.error ||
          "Não foi possível processar sua inscrição.",
        color: "red",
      });
    } finally {
      setEnviando(false);
    }
  };

  if (!oficina) {
    return (
      <Center className="h-screen bg-[#FAFAF9]">
        <Loader color="rose" size="lg" type="dots" />
      </Center>
    );
  }

  const percentualPreenchido =
    ((oficina.vagas_totais - oficina.vagas_restantes) / oficina.vagas_totais) *
    100;
  const esgotado = oficina.vagas_restantes <= 0;

  return (
    <>
      {/* ============================================
          SEÇÃO 1 — HERO
          ============================================ */}
      <Container size="sm" className="pt-16 pb-8 px-4 md:pt-24 md:pb-12">
        <Stack align="center" className="text-center">
          <Badge
            style={{ backgroundColor: "#EAE3D8", color: "#846044" }}
            variant="light"
            size="lg"
            radius="sm"
            className="font-semibold px-4 py-1"
          >
            VAGAS EXCLUSIVAS & LIMITADAS
          </Badge>
          <Title
            order={1}
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-800 mt-2"
          >
            {oficina.titulo}
          </Title>
          <Text className="text-stone-500 max-w-md text-base leading-relaxed mt-1">
            Descubra a calmaria e a delicadeza do bordado livre feito à mão. Uma
            experiência única para desacelerar e criar arte.
          </Text>
        </Stack>
      </Container>

      {/* ============================================
          SEÇÃO 2 — CTA CARD (Bloco Branco Flutuante)
          ============================================ */}
      <Container size="sm" className="px-4 pb-16 md:pb-24">
        <Card
          shadow="xl"
          padding="xl"
          radius="xl"
          withBorder
          className="bg-white border-rose-100"
        >
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <IconCalendarEvent size={20} className="text-rose-400" />
                <Text size="sm" className="font-medium text-stone-600">
                  Próxima Turma Presencial
                </Text>
              </Group>
              <Badge
                color={esgotado ? "red" : "rose"}
                variant="filled"
                radius="sm"
              >
                {esgotado ? "ESGOTADO" : "INSCRIÇÕES ABERTAS"}
              </Badge>
            </Group>

            <hr className="border-stone-100" />

            <Group gap="xs" className="mt-1">
              <IconCalendarEvent size={16} style={{ color: "#A76D5E" }} />
              <Text size="sm" fw={600} className="text-stone-700">
                Sexta, 14 de Agosto de 2026 - às 19h
              </Text>
            </Group>

            <div>
              <Group justify="space-between" className="mb-2">
                <Group gap={6}>
                  <IconUsers size={16} className="text-stone-400" />
                  <Text
                    size="xs"
                    className="font-semibold text-stone-500 uppercase tracking-wider"
                  >
                    Ocupação da oficina
                  </Text>
                </Group>
                <Text
                  size="xs"
                  className={`font-bold ${esgotado ? "text-red-500" : "text-rose-600 animate-pulse"}`}
                >
                  {esgotado
                    ? "Nenhuma vaga restante"
                    : `Restam apenas ${oficina.vagas_restantes} vagas!`}
                </Text>
              </Group>
              <Progress
                value={percentualPreenchido}
                color={esgotado ? "red" : "rose.4"}
                size="md"
                radius="xl"
                className="bg-stone-100"
              />
              {!esgotado && (
                <Text size="xs" className="text-stone-400 mt-2">
                  Turma reduzida para garantir atenção exclusiva a cada
                  participante.
                </Text>
              )}
            </div>

            <Group justify="space-between" align="center" className="mt-2">
              <div>
                <Text
                  size="xs"
                  className="text-stone-400 uppercase tracking-wider font-semibold"
                >
                  Valor da Inscrição
                </Text>
                <Text className="text-3xl font-black text-stone-800">
                  R${" "}
                  {Number(oficina.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </div>
              <Button
                size="lg"
                disabled={esgotado}
                onClick={() => {
                  setActiveStep(0);
                  setModalAberto(true);
                }}
                style={{ backgroundColor: "#A76D5E" }}
                className="hover:opacity-90 font-semibold px-8 shadow-sm text-white"
              >
                {esgotado ? "Vagas Esgotadas" : "Garantir Minha Vaga"}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>

      {/* ============================================
          SEÇÃO 3 — A EXPERIÊNCIA
          ============================================ */}
      <Box className="bg-white/50">
        <Container size="md" className="py-16 md:py-24 px-4">
          <Group
            gap="xl"
            align="center"
            className={isMobile ? "flex-col" : "flex-row"}
          >
            <Stack gap="md" className={isMobile ? "w-full" : "flex-1"}>
              <Title
                order={2}
                className="text-2xl md:text-3xl font-bold text-stone-800"
              >
                A Experiência
              </Title>
              <Text className="text-stone-500 text-base leading-relaxed">
                Venha passar uma noite agradável onde o tempo corre devagar. Uma
                pausa na semana para focar no presente, exercitar a paciência e
                sair com uma peça linda feita por você mesma. Redescubra o
                prazer de criar com as mãos.
              </Text>
            </Stack>
            <Group gap="md" className={isMobile ? "w-full" : "flex-1"} grow>
              <Box
                component="img"
                src="/experiencia-1.png"
                alt="Experiência de bordado - parte 1"
                className="w-full h-auto rounded-lg object-cover"
                style={{ aspectRatio: "1/2" }}
              />
              <Box
                component="img"
                src="/experiencia-2.png"
                alt="Experiência de bordado - parte 2"
                className="w-full h-auto rounded-lg object-cover"
                style={{ aspectRatio: "1/2" }}
              />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* ============================================
          SEÇÃO 4 — O QUE ESTÁ INCLUSO
          ============================================ */}
      <Container size="md" className="py-16 md:py-24 px-4">
        <Stack gap="lg">
          <Title
            order={2}
            className="text-2xl md:text-3xl font-bold text-stone-800 text-center"
          >
            Tudo o que está incluso no seu ingresso:
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" className="mt-4">
            <Card
              padding="xl"
              radius="lg"
              withBorder
              className="bg-white border-stone-100 text-center"
            >
              <Stack align="center" gap="md">
                <Center
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: "#F3E8DF" }}
                >
                  <IconScissors size={32} style={{ color: "#A76D5E" }} />
                </Center>
                <Text fw={700} size="md" className="text-stone-700">
                  Kit Completo de Bordado
                </Text>
                <Text size="xs" className="text-stone-500 leading-relaxed">
                  Bastidor de madeira, tecido de algodão cru riscado, meadas de
                  linhas em cores selecionadas, agulhas e tesoura de arremate.
                  Tudo para levar para casa.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="lg"
              withBorder
              className="bg-white border-stone-100 text-center"
            >
              <Stack align="center" gap="md">
                <Center
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: "#F3E8DF" }}
                >
                  <IconCoffee size={32} style={{ color: "#A76D5E" }} />
                </Center>
                <Text fw={700} size="md" className="text-stone-700">
                  Coffee Break Especial
                </Text>
                <Text size="sm" className="text-stone-500 leading-relaxed">
                  Uma pausa deliciosa preparada com carinho pela La Santa
                  Doçaria.
                </Text>
              </Stack>
            </Card>

            <Card
              padding="xl"
              radius="lg"
              withBorder
              className="bg-white border-stone-100 text-center"
            >
              <Stack align="center" gap="md">
                <Center
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: "#F3E8DF" }}
                >
                  <IconBook2 size={32} style={{ color: "#A76D5E" }} />
                </Center>
                <Text fw={700} size="md" className="text-stone-700">
                  Guia de Pontos
                </Text>
                <Text size="sm" className="text-stone-500 leading-relaxed">
                  Um mini-guia ilustrado dos pontos ensinados para continuar
                  praticando em casa. Brinde exclusivo!
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* ============================================
          SEÇÃO 5 — O LOCAL
          ============================================ */}
      <Box className="bg-white/50">
        <Container size="md" className="py-16 md:py-24 px-4">
          <Stack gap="xl">
            <Title
              order={2}
              className="text-2xl md:text-3xl font-bold text-stone-800"
            >
              O Local: La Santa Doçaria
            </Title>

            <Group
              gap="xl"
              align="start"
              className={isMobile ? "flex-col" : "flex-row"}
            >
              {/* Coluna do Vídeo — 9:16 */}
              <Stack
                gap="sm"
                className={isMobile ? "w-full" : "w-[340px] shrink-0"}
              >
                <Box
                  className="relative w-full overflow-hidden rounded-xl bg-stone-200"
                  style={{ aspectRatio: "9/16" }}
                >
                  <video
                    ref={videoRef}
                    src="/video-local.mp4"
                    controls
                    muted
                    loop
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onEnded={() => setVideoPlaying(false)}
                    className="w-full h-full object-cover"
                  />
                  {!videoPlaying && (
                    <Center
                      className="absolute inset-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => videoRef.current?.play()}
                    >
                      <Center className="w-16 h-16 rounded-full bg-white/80 shadow-lg pointer-events-none">
                        <IconPlayerPlay
                          size={28}
                          className="text-stone-700 ml-1"
                        />
                      </Center>
                    </Center>
                  )}
                </Box>
                <Text size="xs" className="text-stone-400 text-center italic">
                  Assista ao vídeo para sentir o clima da atmosfera da La Santa
                  Doçaria.
                </Text>
              </Stack>

              {/* Coluna de Texto */}
              <Stack gap="md" className={isMobile ? "w-full" : "flex-1"}>
                <Text className="text-stone-500 text-base leading-relaxed">
                  Escolhemos a dedo um dos espaços mais charmosos e acolhedores
                  de Campina Grande para que você se sinta em casa. O aroma de
                  café fresco e a atmosfera tranquila são o cenário perfeito
                  para a nossa noite de bordado.
                </Text>

                <Group gap="xs">
                  <IconMapPin size={16} style={{ color: "#A76D5E" }} />
                  <Text size="sm" fw={600} className="text-stone-700">
                    La Santa Doçaria
                  </Text>
                  <Anchor
                    href="https://www.instagram.com/lasantadocaria/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconBrandInstagram
                      size={16}
                      style={{ color: "#98A086" }}
                    />
                  </Anchor>
                </Group>

                <Text size="sm" className="text-stone-500">
                  Av. Mal. Floriano Peixoto, 1520 - Santo Antônio, Campina
                  Grande - PB, 58406-010
                </Text>

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d440.79674062871743!2d-35.876013984165596!3d-7.215618271187231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ac1f6b5ab9cf5f%3A0xa8e075e0d9143b55!2sLa%20Santa%20Do%C3%A7aria!5e0!3m2!1spt-BR!2sbr!4v1784233847631!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: "0.75rem" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />

                <Button
                  component="a"
                  href="https://www.google.com/maps/place/La+Santa+Do%C3%A7aria/@-7.2156183,-35.876014,17z/data=!3m1!4b1!4m6!3m5!1s0x7ac1f6b5ab9cf5f:0xa8e075e0d9143b55!8m2!3d-7.2156183!4d-35.8734393!16s%2Fg%2F11c5vm1t3s"
                  target="_blank"
                  rel="noopener noreferrer"
                  rightSection={<IconArrowRight size={16} />}
                  className="hover:opacity-90 font-semibold text-white"
                  style={{ backgroundColor: "#A76D5E" }}
                >
                  Como chegar (Abrir no Google Maps)
                </Button>
              </Stack>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* ============================================
          SEÇÃO 6 — QUEM VAI TE GUIAR
          ============================================ */}
      <Container size="md" className="py-16 md:py-24 px-4">
        <Group
          gap="xl"
          align="center"
          className={isMobile ? "flex-col" : "flex-row"}
        >
          <Box
            component="img"
            src="/facilitadora.png"
            alt="Luanna Marinho - Facilitadora"
            className={
              isMobile
                ? "w-full h-auto rounded-lg object-cover"
                : "w-[380px] h-auto rounded-lg object-cover shrink-0"
            }
            style={!isMobile ? { aspectRatio: "3/4" } : { aspectRatio: "3/4" }}
          />

          <Stack gap="md" className={isMobile ? "w-full" : "flex-1"}>
            <Title
              order={2}
              className="text-2xl md:text-3xl font-bold text-stone-800"
            >
              Quem vai te guiar
            </Title>
            <Text className="text-stone-500 text-base leading-relaxed">
              Olá! Eu sou a Luanna Marinho, criadora do Ponto Inicial Ateliê.
              Para mim, o bordado livre é muito mais do que fios e agulhas: é um
              portal de calma, terapia e expressão pessoal. Mal posso esperar
              para compartilhar os meus pontos favoritos com você.
            </Text>
            <Button
              component="a"
              href="https://www.instagram.com/pontoinicialatelie/"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              rightSection={<IconArrowRight size={16} />}
              className="font-semibold"
              style={{ borderColor: "#A76D5E", color: "#A76D5E" }}
            >
              {
                isMobile ?
                "Conheça o Ponto Inicial no Instagram" :
                "Conheça o Ponto Inicial Ateliê no Instagram"
              }
            </Button>
          </Stack>
        </Group>
      </Container>

      {/* ============================================
          SEÇÃO 7 — CARD DE FECHAMENTO
          ============================================ */}
      <Box className="bg-white/50">
        <Container size="sm" className="py-16 md:py-24 px-4">
          <Stack align="center" gap="lg" className="text-center">
            <Title
              order={2}
              className="text-2xl md:text-3xl font-bold text-stone-800"
            >
              Sua noite de respiro criativo está a um clique de distância.
            </Title>
            <Text className="text-stone-500 max-w-lg text-base leading-relaxed">
              Não deixe para depois. Como nossas turmas são reduzidas para
              garantir atenção individual, as vagas costumam esgotar
              rapidamente.
            </Text>

            <Card
              shadow="xl"
              padding="xl"
              radius="xl"
              withBorder
              className="bg-white border-rose-100 w-full"
            >
              <Stack gap="md">
                <Text
                  size="sm"
                  fw={700}
                  className="text-center animate-pulse"
                  style={{ color: "#C2410C" }}
                >
                  🔥 Restam apenas {oficina.vagas_restantes} vagas disponíveis!
                </Text>

                <hr className="border-stone-100" />

                <Group justify="center" gap={4}>
                  <Text
                    size="xs"
                    className="text-stone-400 uppercase tracking-wider font-semibold"
                  >
                    Valor da Inscrição
                  </Text>
                </Group>
                <Text className="text-3xl font-black text-stone-800 text-center">
                  R${" "}
                  {Number(oficina.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>

                <Button
                  size="lg"
                  disabled={esgotado}
                  onClick={() => {
                    setActiveStep(0);
                    setModalAberto(true);
                  }}
                  style={{ backgroundColor: "#A76D5E" }}
                  className="hover:opacity-90 font-semibold shadow-sm text-white w-full"
                  rightSection={<IconArrowRight size={18} />}
                >
                  {isMobile
                    ? "Garantir Minha Vaga"
                    : "Quero Garantir Minha Vaga Agora"}
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* ============================================
          SEÇÃO 8 — FOOTER
          ============================================ */}
      <Box className="border-t border-stone-200 bg-white/50">
        <Container size="md" className="py-10 px-4">
          <Group justify="center" gap="xs">
            <Text size="sm" className="text-stone-500">
              Realização:
            </Text>
            <Link
              href="https://www.instagram.com/pontoinicialatelie/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              <IconBrandInstagram size={16} style={{ color: "#98A086" }} />
              <Text size="sm" fw={600} className="text-stone-600 underline">
                Ponto Inicial Ateliê
              </Text>
            </Link>
          </Group>
        </Container>
      </Box>

      {/* ============================================
          MODAL RESPONSIVO COM O STEPPER DO FORMULÁRIO
          ============================================ */}
      <Modal
        opened={modalAberto}
        onClose={() => !enviando && setModalAberto(false)}
        title={
          <Text size="lg" className="font-bold text-stone-800">
            Inscrição + Pesquisa
          </Text>
        }
        fullScreen={isMobile}
        size="xl"
        radius="md"
        padding="xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 3 }}
      >
        <form onSubmit={handleSubmit(onSubmitInscricao)}>
          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
            color="rose"
            size={isMobile ? "xs" : "sm"}
          >
            <Stepper.Step label="Contato" description="Dados básicos">
              <Stack gap="md" className="mt-4">
                <TextInput
                  label="Seu Nome Completo"
                  placeholder="Ex: Maria Silva"
                  size="md"
                  error={errors.nome?.message}
                  {...register("nome", {
                    required: "O nome é obrigatório para o certificado.",
                    minLength: {
                      value: 3,
                      message: "Insira seu nome completo.",
                    },
                    onChange: (e) => {
                      const valor = e.target.value;
                      e.target.value = valor
                        .toLowerCase()
                        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                    },
                  })}
                />

                <TextInput
                  label="Seu Melhor E-mail"
                  placeholder="Ex: maria@email.com"
                  size="md"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "O e-mail é obrigatório.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Insira um e-mail válido.",
                    },
                  })}
                />

                <Controller
                  name="telefone"
                  control={control}
                  rules={{ required: "O telefone é obrigatório." }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="WhatsApp / Telefone"
                      placeholder="(83) 99999-9999"
                      size="md"
                      error={errors.telefone?.message}
                      component={IMaskInput}
                      mask="(00) 00000-0000"
                      value={value || ""}
                      onBlur={onBlur}
                      onAccept={(formattedValue) => onChange(formattedValue)}
                    />
                  )}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Oficina" description="Preferências">
              <Stack gap="lg" className="mt-4">
                <Controller
                  name="tipo_participacao"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      label="Você pretende participar da oficina de forma única ou recorrente?"
                      withAsterisk
                    >
                      <Stack gap="xs" className="mt-2">
                        <Radio
                          value="Quero ir só uma vez"
                          label="Quero ir só uma vez"
                          color="rose"
                        />
                        <Radio
                          value="Pretendo ir mais vezes"
                          label="Pretendo ir mais vezes"
                          color="rose"
                        />
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Controller
                  name="experiencia_bordado"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      label="Você já teve experiência com bordado livre?"
                      withAsterisk
                    >
                      <Stack gap="xs" className="mt-2">
                        <Radio value="Sim" label="Sim" color="rose" />
                        <Radio value="Não" label="Não" color="rose" />
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Controller
                  name="o_que_bordar"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      label="O que você gostaria de aprender a bordar?"
                      withAsterisk
                    >
                      <Stack gap="xs" className="mt-2">
                        <Radio
                          value="Um desenho feito por mim"
                          label="Um desenho feito por mim"
                          color="rose"
                        />
                        <Radio
                          value="Um desenho já pronto"
                          label="Um desenho já pronto"
                          color="rose"
                        />
                        <Radio
                          value="Quero decidir na hora"
                          label="Quero decidir na hora"
                          color="rose"
                        />
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Controller
                  name="melhor_dia"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      label="Qual melhor dia para realização da oficina?"
                      withAsterisk
                    >
                      <Stack gap="xs" className="mt-2">
                        <Radio
                          value="Durante a semana"
                          label="Durante a semana"
                          color="rose"
                        />
                        <Radio
                          value="Final de semana"
                          label="Final de semana"
                          color="rose"
                        />
                      </Stack>
                    </Radio.Group>
                  )}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Expectativas" description="Finalização">
              <Stack gap="lg" className="mt-4">
                <Controller
                  name="permite_uso_imagem"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      label="Posso utilizar sua imagem nas redes sociais?"
                      withAsterisk
                    >
                      <Stack gap="xs" className="mt-2">
                        <Radio value="Sim" label="Sim" color="rose" />
                        <Radio value="Não" label="Não" color="rose" />
                      </Stack>
                    </Radio.Group>
                  )}
                />

                <Textarea
                  label="O que você espera dessa oficina?"
                  placeholder="Ex: Desejo aprender mais um hobby, bordar flores e folhagens..."
                  minRows={3}
                  size="md"
                  {...register("expectativas")}
                />
              </Stack>
            </Stepper.Step>
          </Stepper>

          <Group
            justify="flex-end"
            className="mt-8 border-t border-stone-100 pt-4"
          >
            {activeStep > 0 && (
              <Button
                variant="subtle"
                color="stone"
                onClick={passoAnterior}
                disabled={enviando}
              >
                Voltar
              </Button>
            )}

            {activeStep < 2 ? (
              <Button
                color="rose"
                onClick={proximoPasso}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Próximo Passo
              </Button>
            ) : (
              <Button
                type="button"
                color="rose"
                loading={enviando}
                className="bg-rose-600 hover:bg-rose-700 px-6"
                onClick={handleSubmit(onSubmitInscricao)}
              >
                Concluir e Ir para Pagamento
              </Button>
            )}
          </Group>
        </form>
      </Modal>

      {/* ============================================
          BOTÃO FLUTUANTE WHATSAPP
          ============================================ */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={!modalAberto}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              color="green"
              size="md"
              radius="xl"
              leftSection={<IconBrandWhatsapp size={20} />}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg text-white font-medium"
              component="a"
              href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTATO_WHATSAPP}?text=Olá!%20Estou%20com%20dúvidas%20sobre%20a%20oficina%20de%20bordado.`}
              target="_blank"
            >
              Tem dúvida? Fale comigo
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}
