export interface CardCheckout {
  mount(target: HTMLElement): Promise<void>;
  tokenize(customer: { name: string; email: string; taxId: string; cellphone: string }): Promise<{ token: string }>;
  destroy(): void;
}
declare global {
  interface Window {
    AbacatePay?: {
      create(options: { publicKey: string; amount: number; locale: "pt" | "en"; icons: boolean;
        onCardChange: (state: { canTokenize: boolean }) => void }): CardCheckout;
    };
  }
}
