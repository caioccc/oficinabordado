"use client";

import { useState, useEffect } from "react";
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

  const isMobile = useMediaQuery("(max-width: 48em)");

  // Configuração do React Hook Form
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

  // Polling de Vagas
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

    // Executa a primeira busca de forma assíncrona fora do fluxo síncrono principal
    executarBusca();

    // Define o intervalo para os próximos pollings
    const interval = setInterval(executarBusca, 10000);

    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, []);

  // Avança no Stepper validando apenas os campos da etapa atual antes de mudar de aba
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

  // Envio final do questionário unificado
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
    <Container size="sm" className="py-12 px-4 pb-24 md:py-20">
      <Stack align="center" className="mb-12 text-center">
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

      <Card
        shadow="md"
        padding="xl"
        radius="lg"
        withBorder
        className="bg-white border-rose-100 mb-8"
      >
        <Stack gap="md">
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
          </div>

          <Group justify="space-between" align="flex-end" className="mt-4">
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

      <Stack gap="sm" className="px-2 text-stone-600 mb-12">
        <Group gap="xs">
          <IconHeart size={16} style={{ color: "#98A086" }} />
          <Text size="sm">
            Incluso: kit de bordado (tecido, bastidor, agulhas, meadas e tesoura
            de arremate) e coffee break.
          </Text>
        </Group>

        <Group gap="xs">
          <IconMapPin size={16} style={{ color: "#98A086" }} />
          <Text size="sm">Local: La Santa Doçaria</Text>
          <Anchor
            href="https://www.instagram.com/lasantadocaria/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandInstagram size={16} style={{ color: "#98A086" }} />
          </Anchor>
        </Group>

        <Group gap="xs">
          <IconMapPin size={16} style={{ color: "#98A086" }} />
          <Text size="sm">
            Av. Mal. Floriano Peixoto, 1520 - Santo Antônio, Campina Grande -
            PB, 58406-010
          </Text>
        </Group>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d440.79674062871743!2d-35.876013984165596!3d-7.215618271187231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ac1f6b5ab9cf5f%3A0xa8e075e0d9143b55!2sLa%20Santa%20Do%C3%A7aria!5e0!3m2!1spt-BR!2sbr!4v1784233847631!5m2!1spt-BR!2sbr"
          width="100%"
          height="250"
          style={{ border: 0, borderRadius: "0.5rem" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />

        <Divider />

        <Group gap="xs">
          <Text size="sm">Realização:</Text>
          <Link
            href="https://www.instagram.com/pontoinicialatelie/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <IconBrandInstagram size={16} style={{ color: "#98A086" }} />
            <Text size="sm" className="text-stone-600 underline">
              Ponto Inicial Ateliê
            </Text>
          </Link>
        </Group>
      </Stack>

      {/* MODAL RESPONSIVO COM O STEPPER DO FORMULÁRIO */}
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
            size="sm"
          >
            {/* PASSO 1: DADOS PESSOAIS */}
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

            {/* PASSO 2: INTERESSES E DIAS */}
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

            {/* PASSO 3: EXPECTATIVAS E USO DE IMAGEM */}
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

          {/* CONTROLADORES DE NAVEGAÇÃO DO STEPPER DENTRO DO MODAL */}
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
                type="button" /* Alterado para button para evitar comportamento nativo */
                color="rose"
                loading={enviando}
                className="bg-rose-600 hover:bg-rose-700 px-6"
                /* 👇 CHAMA O HANDLESUBMIT DIRETAMENTE AQUI */
                onClick={handleSubmit(onSubmitInscricao)}
              >
                Concluir e Ir para Pagamento
              </Button>
            )}
          </Group>
        </form>
      </Modal>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
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
              Fale Comigo
            </Button>
          )}
        </Transition>
      </Affix>
    </Container>
  );
}
