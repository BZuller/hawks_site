import type { Article } from "./editorial";

export const vistoNovemberUpdates: Article = {
  slug: "visto-novidades-novembro-2026",
  product: "visto",
  editorialStatus: "published",
  date: "2026-11-10",
  title: "O que mudou no Visto em novembro",
  metaTitle: "Novidades do Visto em novembro de 2026 | Hawks BI",
  summary: "Veja o que mudou nas rotinas pelo celular, no acesso à conta, na análise de 15 e 30 dias e na exportação do PDF de temperaturas.",
  status: "Disponível no Visto",
  note: "Este resumo reúne melhorias publicadas entre 31 de outubro e 10 de novembro de 2026.",
  image: {
    src: "/assets/characters/visto-painel-demonstracao.jpg",
    alt: "Simulação do Painel do Visto, com rotinas do dia e uma ocorrência de temperatura. Dados fictícios.",
    width: 1290,
    height: 1006,
  },
  sections: [
    {
      title: "Pendências e envio mais claros no celular",
      paragraphs: [
        "A lista de rotinas destaca o que ainda precisa ser feito. Durante a execução, o Visto deixa mais claro quais itens faltam responder e quando o envio está disponível.",
        "Para quem confere uma abertura ou um fechamento no celular, fica mais fácil retomar a rotina e localizar o próximo item.",
      ],
    },
    {
      title: "Recupere o acesso pelo próprio login",
      paragraphs: [
        "O Gui passou a fazer parte da tela de entrada. Se precisar redefinir a senha, use “Esqueci minha senha” para pedir um link por e-mail.",
        "Os campos de senha começam ocultos. O botão de olho permite conferir o que foi digitado antes de continuar.",
      ],
    },
    {
      title: "Confira atenção e temperaturas em períodos maiores",
      paragraphs: [
        "Corrigimos a análise do Painel que podia parar de carregar em recortes de 15 e 30 dias. Esses períodos ajudam a revisar as ocorrências com atenção e os registros de temperatura sem dividir o mês em várias consultas.",
        "Ao revisar o período, abra as ocorrências que pedem atenção para consultar a rotina correspondente.",
      ],
    },
    {
      title: "Gere o PDF de temperaturas pelo período selecionado",
      paragraphs: [
        "Corrigimos uma falha de carregamento que podia impedir o download do PDF de temperaturas em períodos mensais.",
        "Em Relatórios, abra Temperaturas, selecione o período e os filtros do equipamento. Depois use “Gerar PDF” para baixar os registros do recorte.",
      ],
    },
  ],
  cta: {
    title: "Conheça o Visto",
    text: "Veja como a equipe executa os checklists e como a gestão consulta pendências e temperaturas.",
    label: "Ver como funciona",
    href: "https://visto.hawksbi.com.br/#como-funciona",
  },
};
