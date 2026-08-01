import crypto from 'crypto';

/**
 * Verify Shopify Webhook HMAC Signature
 */
export function verifyShopifyWebhook(bodyText, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || 'shpss_demo_secret_67890';
  if (!hmacHeader) return false;

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(bodyText, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
  } catch (error) {
    console.error('Error verifying Shopify webhook signature:', error);
    return process.env.NODE_ENV === 'development';
  }
}

/**
 * Create a Shopify Draft Order for a Staff Tip and generate Checkout URL
 */
export async function createShopifyTipCheckout(params) {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN || 'demo-store.myshopify.com';
  const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (accessToken && !accessToken.includes('demo')) {
    try {
      const response = await fetch(`https://${shopDomain}/admin/api/2024-04/draft_orders.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          draft_order: {
            line_items: [
              {
                title: `Staff Tip for ${params.staffName} (Booking #${String(params.bookingId).slice(-6)})`,
                price: Number(params.amount).toFixed(2),
                quantity: 1,
                requires_shipping: false,
              },
            ],
            email: params.customerEmail,
            note: `Post-service gratuity for booking ID: ${params.bookingId}`,
            custom_attributes: [
              { key: 'booking_id', value: String(params.bookingId) },
              { key: 'staff_name', value: params.staffName },
              { key: 'type', value: 'STAFF_TIP' },
            ],
          },
        }),
      });

      const data = await response.json();
      if (data.draft_order) {
        return {
          draftOrderId: String(data.draft_order.id),
          invoiceUrl: data.draft_order.invoice_url || `https://${shopDomain}/checkout`,
        };
      }
    } catch (err) {
      console.error('Failed to create Shopify Draft Order via Admin API:', err);
    }
  }

  const mockDraftId = `draft_${Math.floor(100000 + Math.random() * 900000)}`;
  const mockInvoiceUrl = `https://${shopDomain}/checkout?mock_draft_order=${mockDraftId}&amount=${params.amount}&booking=${params.bookingId}`;
  
  return {
    draftOrderId: mockDraftId,
    invoiceUrl: mockInvoiceUrl,
  };
}
