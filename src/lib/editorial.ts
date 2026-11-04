import { vistoCharacters } from "./vistoCharacters";
import { agendoWhatsAppLaunch } from "./agendoWhatsAppLaunch";

export const products = [
  {
    id: "visto" as const, name: "Visto", cardTitle: "Acompanhe o trabalho. Confira o registro.", cardDescription: "Checklists, fotos e histórico para saber o que foi feito e o que precisa de atenção.", highlights: ["Rotinas", "Evidências", "Relatórios"], category: "Rotinas e controle operacional", status: "Em operação",
    logo: "/assets/products/visto-wordmark.svg", symbol: "/assets/products/visto-symbol.svg", href: "https://visto.hawksbi.com.br/", action: "Acessar o Visto",
    title: "Saiba o que foi feito. Veja o que precisa de atenção.",
    description: "Software de gestão de rotinas operacionais, checklists e evidências. O Visto conecta quem executa o trabalho a quem precisa acompanhar e decidir.",
    intro: "Uma tarefa concluída conta uma parte da história. Saber o que foi feito, em qual setor e com qual evidência permite acompanhar a operação com mais contexto.",
    features: [
      { title: "Clareza para executar", text: "Uma fila organiza rotinas por horário e setor. Cada pessoa encontra os itens a responder e os registros que precisa fazer." },
      { title: "Evidência junto da ação", text: "Respostas e fotos acompanham a execução. O histórico mantém o contexto de cada envio para a gestão consultar e revisar." },
      { title: "Uma leitura da operação", text: "Relatórios reúnem os registros para acompanhar rotinas, temperaturas e conformidade. Filtros ajudam a olhar o período e o escopo relevantes." },
    ],
    audience: "Para equipes com rotinas recorrentes, verificações de qualidade e necessidade de registrar o que acontece na operação.",
    note: "As novidades em preparação estão identificadas no blog. A disponibilidade de cada atualização depende da versão publicada.",
  },
  {
    id: "agendo" as const, name: "Agendo", cardTitle: "Deixe o cliente escolher o horário.", cardDescription: "Uma página com a sua marca para agendar serviços. Você acompanha os pedidos e gerencia a agenda.", highlights: ["Agenda online", "Página própria", "Gestão de pedidos"], category: "Agenda e atendimento", status: "Em operação",
    logo: "/assets/products/agendo-logo.png", symbol: "", href: "https://agendo.hawksbi.com.br/", action: "Conhecer o Agendo",
    title: "Seus clientes agendam. Você acompanha cada pedido.",
    description: "Agendamento online com a identidade do seu negócio. Seus clientes escolhem serviço, profissional e horário; você gerencia os pedidos.",
    intro: "Compartilhe sua página de agendamento e acompanhe os pedidos pelo painel. Quando a aprovação é manual, você decide quais horários confirmar.",
    features: [
      { title: "Um caminho para agendar", text: "O cliente escolhe profissional, serviço e horário pela página pública, sem precisar criar uma conta para consultar a agenda." },
      { title: "A decisão continua sua", text: "No modo manual, o pedido aguarda aprovação. A gestão reúne próximos atendimentos, solicitações e a rotina do negócio." },
      { title: "A marca do seu negócio", text: "Logo, cor e foto de apresentação personalizam a página. A mesma identidade acompanha o painel de gestão, preservando a leitura dos estados da agenda." },
    ],
    audience: "Criado para negócios que atendem com hora marcada, como salões, barbearias, estúdios de beleza e profissionais independentes.",
    note: "O Agendo está em operação. A integração com WhatsApp está disponível mediante implementação, com canais, mensagens e fluxos configurados para cada negócio. O uso de IA depende da solução implementada.",
  },
  {
    id: "conexo" as const, name: "Conexo", cardTitle: "Continue a conversa com o contexto em mãos.", cardDescription: "Estamos desenvolvendo um espaço para reunir canais, histórico e equipe no atendimento.", highlights: ["Conversas", "Histórico", "Equipe"], category: "Atendimento multicanal", status: "Em validação",
    logo: "/assets/products/conexo-wordmark.svg", symbol: "/assets/products/conexo-symbol.svg", href: "https://conexo.hawksbi.com.br/", action: "Visitar o Conexo",
    title: "A conversa muda de canal. O contexto continua.",
    description: "Conheça o Conexo, produto da Hawks BI em validação para reunir canais e preservar o contexto do atendimento entre automação e equipe.",
    intro: "Quando uma conversa passa de uma pessoa para outra, o cliente não deveria precisar começar de novo. O Conexo nasce para organizar esse encontro entre canais, histórico e equipe.",
    features: [
      { title: "Conversas no mesmo lugar", text: "A proposta reúne WhatsApp, Instagram e e-mail em uma experiência de atendimento. A disponibilidade dos canais é acompanhada durante a validação." },
      { title: "Histórico que acompanha", text: "O contexto da conversa ajuda a equipe a entender o pedido e continuar o atendimento sem depender de repasses soltos." },
      { title: "Passagem para a equipe", text: "Automação e atendimento humano fazem parte do mesmo fluxo. A proposta é dar continuidade à conversa quando uma pessoa precisa assumir." },
    ],
    audience: "Para operações que recebem conversas em diferentes canais e precisam organizar a continuidade do atendimento.",
    note: "O Conexo está em validação. Converse com a Hawks para conhecer o escopo atual e avaliar os canais necessários à sua operação.",
  },
  {
    id: "atolocal" as const, name: "Ato Local by Hawks BI", cardTitle: "Ato Local by Hawks BI",
    cardDescription: "Boletim independente de Gravataí, operado pela Hawks BI. Acompanhe o Diário Oficial e as sessões da Câmara pelo WhatsApp.",
    highlights: ["Diário Oficial", "Câmara", "WhatsApp"], category: "Informação local", status: "Em operação",
    logo: "/assets/products/ato-local-wordmark.png", symbol: "", href: "https://atolocal.hawksbi.com.br/", action: "Acessar o Ato Local",
    title: "Ato Local by Hawks BI",
    description: "O Ato Local é um boletim independente de Gravataí, operado pela Hawks BI, com resumos do Diário Oficial e das sessões da Câmara pelo WhatsApp.",
    intro: "O boletim reúne informações publicadas pela Prefeitura e pela Câmara de Gravataí. Os resumos dão contexto e indicam as fontes para quem quiser consultar os documentos originais.",
    features: [
      { title: "Diário Oficial", text: "Consulte resumos de atos publicados no Diário Oficial de Gravataí e acesse as fontes indicadas no boletim." },
      { title: "Sessões da Câmara", text: "Acompanhe os assuntos discutidos nas sessões e consulte os materiais da Câmara." },
      { title: "Consulta pelo WhatsApp", text: "Abra o menu do Ato Local para escolher o que deseja consultar." },
    ],
    audience: "Para moradores e quem acompanha as decisões da Prefeitura e da Câmara de Gravataí.",
    note: "O Ato Local é um boletim independente da Hawks BI. As publicações oficiais permanecem disponíveis nos canais da Prefeitura e da Câmara.",
  },
];
export type Product = typeof products[number];
export type ProductId = Product["id"];
export type Article = {
  image?: { src: string; alt: string; width: number; height: number };
  slug: string; product: ProductId; products?: ProductId[]; kind?: "news" | "patch-notes";
  editorialStatus?: "published" | "draft"; title: string; summary: string; date: string;
  metaTitle?: string; metaDescription?: string; intro?: string[]; status: string; note: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[]; steps?: string[]; closingParagraphs?: string[] }[];
  faq?: { question: string; answer: string; link?: { label: string; href: string } }[];
  cta?: { title: string; text: string; label: string; href: string };
};
const editorialArticles: Article[] = [
  vistoCharacters,
  agendoWhatsAppLaunch,
  {
    slug: "visto-relatorios-filtros-e-exportacao", product: "visto", date: "2026-10-08", status: "Em preparação",
    title: "Relatórios do Visto: o recorte certo, do filtro à exportação.",
    summary: "Período e setor mais visíveis, nomes legíveis e exportações vinculadas aos dados que você está consultando.",
    note: "Atualização implementada e integrada em 8 de outubro. A publicação desta versão ainda precisa ser confirmada.",
    sections: [
      { title: "Período e setor no centro da leitura", paragraphs: ["Um relatório só ajuda quando fica claro o que ele está mostrando. A atualização do Visto leva os filtros de período e setor aos quatro modelos operacionais, tornando esse recorte visível durante a consulta.", "O intervalo de datas também passa a se manter válido quando o início ou o fim muda. Na tela e nos arquivos exportados, o setor aparece pelo nome, para que o contexto continue legível fora do sistema."] },
      { title: "O arquivo acompanha a consulta", paragraphs: ["Trocar o período ou a unidade exige carregar outra base de informações. Enquanto isso acontece, a exportação fica indisponível. O mesmo vale quando a consulta encontra um erro: o sistema evita gerar um CSV ou PDF usando dados da seleção anterior.", "Depois que a consulta atual termina com sucesso, o arquivo pode ser gerado. A conferência também acontece antes de disponibilizar um PDF que levou mais tempo para ficar pronto."] },
      { title: "O que muda no dia a dia", paragraphs: ["Imagine consultar a semana de um setor e, em seguida, mudar para outro. A atualização ajuda a manter a mesma referência entre o filtro escolhido, o relatório na tela e o documento compartilhado com a equipe.", "O foco está na clareza da consulta e na consistência da exportação. Os cálculos dos relatórios e as permissões de acesso permanecem os mesmos."] },
    ],
  },
  {
    slug: "visto-historico-revisao-e-evidencias", product: "visto", date: "2026-10-08", status: "Em preparação",
    title: "Um histórico mais claro para revisar a operação.",
    summary: "Responsável pela revisão, horário da decisão e regras de foto ganham contexto no histórico do Visto.",
    note: "Melhorias integradas em 8 de outubro e preparadas para publicação. A disponibilidade na versão em operação ainda precisa ser confirmada.",
    sections: [
      { title: "Execução e revisão têm papéis diferentes", paragraphs: ["Concluir uma rotina e revisar o que foi enviado são momentos distintos. O histórico do Visto passa a apresentar, quando disponíveis, o nome de quem tomou a decisão atual de revisão, o horário e a justificativa.", "Esse contexto fica separado do estado da execução. Assim, a gestão pode identificar a decisão de revisão sem confundi-la com a resposta registrada por quem realizou a tarefa."] },
      { title: "A regra de foto daquela execução", paragraphs: ["A consulta passa a mostrar a política de foto que estava salva no item executado: sem foto, foto opcional, obrigatória ou obrigatória pela câmera. A referência é a execução registrada, mesmo que a rotina tenha mudado depois.", "Respostas de sim ou não também ganham uma apresentação mais direta, como Feito e Não feito. Quando o estado já comunica a mesma informação, a repetição é removida."] },
      { title: "Mais contexto, sem reescrever o passado", paragraphs: ["Para quem revisa uma rotina, isso reduz a necessidade de interpretar rótulos técnicos ou buscar uma regra fora do registro. A leitura do envio fica mais próxima das perguntas reais da operação: o que foi respondido, qual evidência era exigida e quem revisou.", "Esses ajustes melhoram a apresentação dos dados existentes. Eles não alteram respostas históricas nem criam uma trilha de todas as decisões anteriores: a revisão exibida é a decisão atual."] },
    ],
  },
  {
    slug: "agendo-identidade-do-negocio", product: "agendo", date: "2026-10-08", status: "Registro de desenvolvimento",
    title: "O Agendo com a cara de quem atende.",
    summary: "Logo, cor e foto de apresentação aproximam a página de agendamento da identidade de cada negócio.",
    note: "Este artigo registra a validação da personalização. O Agendo está em operação; consulte a Hawks sobre a disponibilidade de cada recurso.",
    sections: [
      { title: "A primeira impressão pertence ao negócio", paragraphs: ["A página de agendamento é uma extensão do atendimento. Na evolução mais recente da identidade do Agendo, cada negócio pode ter uma foto de apresentação independente do logo, além da sua própria cor.", "A foto aparece na entrada da experiência, onde ajuda o cliente a reconhecer quem vai atendê-lo. Nos passos compactos e no recibo, o espaço continua reservado às informações do agendamento."] },
      { title: "A mesma marca também no painel", paragraphs: ["Logo e cor salvos para o negócio acompanham a página pública e o painel de gestão. A identificação fica consistente entre o que o cliente vê e o ambiente usado pelo profissional.", "Cores claras recebem ajustes de contraste para manter textos e ações legíveis. Os estados da agenda conservam seus significados, mesmo quando a identidade visual do negócio muda."] },
      { title: "Personalizar sem mudar as regras da agenda", paragraphs: ["A edição da marca fica sob responsabilidade de quem administra o negócio. Foto e logo podem ser atualizados de forma independente, sem exigir que ambos sejam reenviados a cada alteração.", "Essa personalização não altera a aprovação de horários. Quando o negócio trabalha no modo manual, uma solicitação continua aguardando a decisão do profissional. A novidade está no modo de apresentar a experiência; a forma de atender continua sendo respeitada."] },
    ],
  },
  {
    slug: "agendo-atendimento-assistido-whatsapp", product: "agendo", date: "2026-10-08", status: "Registro de desenvolvimento",
    title: "Atendimento assistido no Agendo: entender antes de agendar.",
    summary: "A evolução do atendimento pelo WhatsApp prioriza contexto, informações completas e a aprovação do profissional.",
    note: "Este artigo registra os testes de 8 de outubro. Em 15 de outubro de 2026, a integração com WhatsApp passou a estar disponível mediante implementação. O uso de IA depende da solução definida para cada negócio; consulte a nota de lançamento entre os artigos relacionados.",
    sections: [
      { title: "Uma mensagem pode querer dizer várias coisas", paragraphs: ["Perguntar como funciona um serviço não é o mesmo que pedir um horário. As revisões recentes do atendimento assistido do Agendo trabalham essa diferença, distinguindo dúvidas sobre políticas, informações de serviços, pedidos de agendamento e solicitações de atendimento humano.", "Quando faltam dados necessários para um pedido, a interpretação deve reconhecer a dúvida e continuar a conversa. O objetivo é evitar que uma informação incompleta seja tratada como uma escolha já feita pelo cliente."] },
      { title: "A conversa usa o conteúdo aprovado", paragraphs: ["O negócio prepara as descrições dos serviços, perguntas frequentes e políticas que orientam o atendimento. A versão aprovada é a referência para as respostas; editar um rascunho não substitui automaticamente aquilo que já foi aprovado.", "A evolução também preserva informações parciais da conversa quando elas ainda são relevantes. Isso permite pedir o que falta, em vez de recomeçar a coleta a cada mensagem."] },
      { title: "O pedido chega à mesma agenda", paragraphs: ["A implementação dos pedidos pelo WhatsApp utiliza as mesmas regras da página de agendamento. No modo manual, receber um pedido não confirma o horário: a aprovação continua sendo uma ação explícita do profissional.", "Antes da liberação, o atendimento passa por avaliações de interpretação e testes da jornada completa. A melhoria mais recente integra esse trabalho de validação; ela não representa um lançamento público do recurso."] },
    ],
  },
];
export const articles: Article[] = editorialArticles.filter(article => article.editorialStatus !== "draft");
export const productPath = (id: ProductId) => `/produtos/${id}/`;
export const articlePath = (slug: string) => `/blog/${slug}/`;
export const formatDate = (date: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
