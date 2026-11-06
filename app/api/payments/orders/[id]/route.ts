import { verifiedUserId } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { orderView, refreshOrder } from "@/lib/payments/orders";
import { failure } from "@/lib/utils/http";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await verifiedUserId();
  if (!userId) return failure("Entre com um e-mail confirmado para continuar.", 401);
  const { id } = await params;
  const order = await db.order.findFirst({ where: { id, userId, provider: "abacatepay" } });
  if (!order) return failure("Pagamento não encontrado.", 404);
  try {
    const updated = ["pending", "creating", "uncertain"].includes(order.status) ? await refreshOrder(order) : order;
    return Response.json({ order: orderView(updated) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure("Não foi possível consultar o pagamento. Tente novamente.", 503);
  }
}
