export const statusMessages: Record<number, string> = {
  400: "Esse pedido não fazia sentido para a mesa.",
  401: "Sua sessão nesta mesa não vale mais. Entre de novo.",
  403: "Essa ação não é sua para fazer agora.",
  404: "Não encontrei essa mesa.",
  409: "Isso não cabe no momento da partida.",
  422: "Faltou preencher algo.",
  429: "Muitos toques seguidos. Espere um instante.",
  500: "A mesa tropeçou aqui do lado do servidor.",
  502: "A mesa está fora do ar por um instante.",
  503: "A mesa está fora do ar por um instante.",
  504: "A mesa demorou demais para responder.",
};

export const fallbackMessage = "Algo deu errado na mesa.";
export const unreadableMessage = "A mesa respondeu de um jeito que não entendi.";
export const offlineMessage = "Você está sem internet. A mesa continua esperando.";
export const unreachableMessage = "Não conseguimos falar com a mesa. Tentando de novo.";

export function messageForStatus(status: number): string {
  return statusMessages[status] ?? fallbackMessage;
}

export function networkMessage(online: boolean): string {
  return online ? unreachableMessage : offlineMessage;
}
