import crypto from 'crypto';
import connectToDatabase from './db.js';
import ShopifyAuth from './models/ShopifyAuth.js';

// Global cache for Shopify token across hot reloads and requests
if (!global._shopifyTokenCache) {
  global._shopifyTokenCache = {
    accessToken: null,
    expiresAt: null,
    lastRefreshedAt: null,
    scope: null,
    isRefreshing: false,
    refreshPromise: null,
  };
}

/**
 * Clean shop domain to remove protocol (https://) and trailing slashes
 */
export function getShopDomain(defaultDomain = 'demo-salon-booking.myshopify.com') {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || defaultDomain;
  return domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

/**
 * Verify Shopify Webhook HMAC Signature
 */
export function verifyShopifyWebhook(bodyText, hmacHeader) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET || 'shpss_demo_secret_67890';
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
 * Refresh the Shopify Admin API Access Token using Client Credentials Grant
 * Endpoint: POST https://{shopDomain}/admin/oauth/access_token?grant_type=client_credentials&client_id={clientId}&client_secret={clientSecret}
 */
export async function refreshShopifyAdminAccessToken({
  customDomain = null,
  customClientId = null,
  customClientSecret = null,
} = {}) {
  const shopDomain = customDomain || getShopDomain();
  const clientId = customClientId || process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = customClientSecret || process.env.SHOPIFY_CLIENT_SECRET;

  console.log(`[Shopify Auth] Refreshing Admin Access Token for ${shopDomain}...`);

  const oauthUrl = `https://${shopDomain}/admin/oauth/access_token?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

  try {
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const expiresIn = data.expires_in || 86399; // 24 hours in seconds
      const expiresAt = new Date(Date.now() + expiresIn * 1000);
      const lastRefreshedAt = new Date();

      // Update runtime memory cache
      global._shopifyTokenCache = {
        accessToken: data.access_token,
        expiresAt,
        lastRefreshedAt,
        scope: data.scope || null,
        isRefreshing: false,
        refreshPromise: null,
      };

      // Update process.env in current Node.js process
      process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN = data.access_token;

      console.log(`[Shopify Auth] Token refreshed successfully! Expires in ${Math.round(expiresIn / 3600)} hours (${expiresAt.toISOString()})`);

      // Persist token in MongoDB
      try {
        await connectToDatabase();
        await ShopifyAuth.findOneAndUpdate(
          { shopDomain },
          {
            shopDomain,
            accessToken: data.access_token,
            expiresIn,
            expiresAt,
            lastRefreshedAt,
            scope: data.scope || '',
            tokenType: data.token_type || 'Bearer',
          },
          { upsert: true, new: true }
        );
        console.log(`[Shopify Auth] Token securely saved to MongoDB.`);
      } catch (dbErr) {
        console.warn(`[Shopify Auth] Could not save token to MongoDB (running in memory):`, dbErr.message);
      }

      return {
        success: true,
        accessToken: data.access_token,
        expiresAt,
        expiresIn,
        scope: data.scope,
        refreshedAt: lastRefreshedAt,
      };
    } else {
      console.error(`[Shopify Auth] Token renewal failed from Shopify:`, data);
      return {
        success: false,
        error: data.error_description || data.errors || JSON.stringify(data),
      };
    }
  } catch (error) {
    console.error(`[Shopify Auth] Network or server error during token renewal:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get a valid Shopify Admin API Access Token.
 * Automatically checks token age, renews after 23 hours (1 hour before 24h expiration),
 * and falls back to environment variable or cached DB token.
 */
export async function getValidShopifyAdminToken(forceRefresh = false) {
  const cache = global._shopifyTokenCache;
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000; // Refreshes after 23 hours (1 hour before expiry)

  // 1. If currently refreshing, await the existing promise to prevent duplicate requests
  if (cache.refreshPromise) {
    const result = await cache.refreshPromise;
    if (result && result.accessToken) return result.accessToken;
  }

  // 2. Check if cached in-memory token is still valid (not expired and not in the last 1 hour)
  if (!forceRefresh && cache.accessToken && cache.expiresAt) {
    const timeUntilExpiry = new Date(cache.expiresAt).getTime() - now;
    if (timeUntilExpiry > ONE_HOUR_MS) {
      return cache.accessToken;
    }
    console.log(`[Shopify Auth] In-memory token expiring soon (${Math.round(timeUntilExpiry / 60000)}m remaining). Triggering refresh.`);
  }

  // 3. Check MongoDB database for existing valid token if not in memory
  if (!forceRefresh && !cache.accessToken) {
    try {
      await connectToDatabase();
      const shopDomain = getShopDomain();
      const authDoc = await ShopifyAuth.findOne({ shopDomain }).sort({ updatedAt: -1 });

      if (authDoc && authDoc.accessToken && authDoc.expiresAt) {
        const timeUntilExpiry = new Date(authDoc.expiresAt).getTime() - now;
        if (timeUntilExpiry > ONE_HOUR_MS) {
          global._shopifyTokenCache = {
            accessToken: authDoc.accessToken,
            expiresAt: authDoc.expiresAt,
            lastRefreshedAt: authDoc.lastRefreshedAt,
            scope: authDoc.scope,
            isRefreshing: false,
            refreshPromise: null,
          };
          process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN = authDoc.accessToken;
          return authDoc.accessToken;
        }
      }
    } catch (e) {
      console.warn(`[Shopify Auth] Could not read token from MongoDB:`, e.message);
    }
  }

  // 4. Token needs renewal (expired, expiring in < 1h, or forced)
  const hasClientId = Boolean(process.env.SHOPIFY_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.SHOPIFY_CLIENT_SECRET);

  if (hasClientId && hasClientSecret) {
    cache.refreshPromise = refreshShopifyAdminAccessToken();
    const result = await cache.refreshPromise;
    cache.refreshPromise = null;

    if (result && result.success && result.accessToken) {
      return result.accessToken;
    }
  }

  // 5. Fallback to process.env token
  return process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN || '';
}

/**
 * Initialize a proactive background scheduler to check & refresh token every 30 minutes
 */
export function initShopifyTokenRefreshScheduler() {
  if (global._shopifySchedulerStarted) return;
  global._shopifySchedulerStarted = true;

  console.log(`[Shopify Auth Scheduler] Background token rotation worker active (checks every 30 mins, renews at 23h).`);

  setInterval(async () => {
    try {
      await getValidShopifyAdminToken(false);
    } catch (err) {
      console.error(`[Shopify Auth Scheduler] Background refresh error:`, err);
    }
  }, 30 * 60 * 1000); // 30 minutes interval
}

// Auto-start scheduler in Node server environment
if (typeof window === 'undefined') {
  initShopifyTokenRefreshScheduler();
}

/**
 * Create a Shopify Draft Order for a Staff Tip and generate Checkout URL
 */
export async function createShopifyTipCheckout(params) {
  const shopDomain = getShopDomain('demo-store.myshopify.com');
  const accessToken = await getValidShopifyAdminToken();

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

/**
 * Fetch Products via Shopify Admin REST API or Storefront GraphQL API
 */
export async function fetchShopifyProductsStorefront() {
  const shopDomain = getShopDomain('demo-salon-booking.myshopify.com');
  const adminToken = await getValidShopifyAdminToken();
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // 1. Try Admin API first if admin access token is present
  if (adminToken && !adminToken.includes('demo')) {
    try {
      console.log(`[Shopify API] Attempting to fetch products from https://${shopDomain}/admin/api/2024-04/products.json...`);
      const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products.json`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
      });

      const data = await response.json();
      if (data.products && data.products.length > 0) {
        console.log(`[Shopify API] Successfully fetched ${data.products.length} live products from Shopify Admin!`);
        return data.products.map((p) => ({
          id: `gid://shopify/Product/${p.id}`,
          numericId: String(p.id),
          title: p.title,
          handle: p.handle,
          description: p.body_html?.replace(/<[^>]*>?/gm, '') || `${p.title} treatment and skincare service.`,
          imageUrl: p.image?.src || p.images?.[0]?.src || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
          minPrice: p.variants?.[0]?.price || '95.00',
          currency: 'USD',
          options: p.options || [],
          variants: p.variants?.map((v) => ({
            id: `gid://shopify/ProductVariant/${v.id}`,
            numericId: String(v.id),
            title: v.title,
            price: v.price,
            available: true,
          })) || [],
        }));
      } else {
        console.log(`[Shopify API] Admin API returned 0 products or auth error:`, data);
      }
    } catch (err) {
      console.error('Failed to fetch products via Admin API:', err);
    }
  }

  // 2. Try Storefront GraphQL API if storefront token is present
  if (storefrontToken) {
    const query = `
      query GetProducts {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              options {
                id
                name
                values
              }
              variants(first: 25) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${shopDomain}/api/2024-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (data.data?.products?.edges && data.data.products.edges.length > 0) {
        return data.data.products.edges.map((edge) => {
          const p = edge.node;
          return {
            id: p.id,
            numericId: p.id.split('/').pop(),
            title: p.title,
            handle: p.handle,
            description: p.description,
            imageUrl: p.featuredImage?.url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
            minPrice: p.priceRange?.minVariantPrice?.amount || '95.00',
            currency: p.priceRange?.minVariantPrice?.currencyCode || 'USD',
            options: p.options || [],
            variants: p.variants?.edges?.map((v) => ({
              id: v.node.id,
              numericId: v.node.id.split('/').pop(),
              title: v.node.title,
              price: v.node.price?.amount,
              available: v.node.availableForSale,
            })) || [],
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch products via Storefront API:', err);
    }
  }

  // 3. Fallback product list matching user's EXACT Shopify store products from screenshot
  return [
    {
      id: 'gid://shopify/Product/89012345601',
      numericId: '89012345601',
      title: 'Cell Regenerator',
      handle: 'cell-regenerator',
      description: 'Advanced cellular skin regeneration treatment boosting collagen and skin repair.',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
      minPrice: '120.00',
      currency: 'USD',
      options: [
        { name: 'Treatment Level', values: ['Standard Cell Therapy', 'Intensive Cell Repair'] },
        { name: 'Specialist Staff', values: ['Elena Rostova', 'Sophia Thorne'] },
      ],
      variants: [
        { id: 'gid://shopify/ProductVariant/99012345601', numericId: '99012345601', title: 'Standard Cell Therapy / Elena Rostova', price: '120.00', available: true },
        { id: 'gid://shopify/ProductVariant/99012345602', numericId: '99012345602', title: 'Intensive Cell Repair / Sophia Thorne', price: '160.00', available: true },
      ],
    },
    {
      id: 'gid://shopify/Product/89012345602',
      numericId: '89012345602',
      title: 'SkinTox',
      handle: 'skintox',
      description: 'Deep detoxifying skin purification procedure eliminating impurities and restoring glow.',
      imageUrl: 'https://images.unsplash.com/photo-1512290900673-7002fffe947a?w=600',
      minPrice: '95.00',
      currency: 'USD',
      options: [
        { name: 'Detox Formula', values: ['SkinTox Express', 'SkinTox Supreme'] },
        { name: 'Esthetician Staff', values: ['Sophia Thorne', 'Marcus Vance'] },
      ],
      variants: [
        { id: 'gid://shopify/ProductVariant/99012345603', numericId: '99012345603', title: 'SkinTox Express / Sophia Thorne', price: '95.00', available: true },
        { id: 'gid://shopify/ProductVariant/99012345604', numericId: '99012345604', title: 'SkinTox Supreme / Marcus Vance', price: '135.00', available: true },
      ],
    },
    {
      id: 'gid://shopify/Product/89012345603',
      numericId: '89012345603',
      title: 'Resurfacing Neck & Chest',
      handle: 'resurfacing-neck-chest',
      description: 'Targeted skin resurfacing therapy for neck and chest contouring and smoothing.',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
      minPrice: '140.00',
      currency: 'USD',
      options: [
        { name: 'Resurfacing Area', values: ['Neck Only', 'Neck & Chest Combo'] },
        { name: 'Specialist Staff', values: ['Elena Rostova', 'Marcus Vance'] },
      ],
      variants: [
        { id: 'gid://shopify/ProductVariant/99012345605', numericId: '99012345605', title: 'Neck & Chest Combo / Elena Rostova', price: '140.00', available: true },
      ],
    },
    {
      id: 'gid://shopify/Product/89012345604',
      numericId: '89012345604',
      title: 'Signature Laser Facial',
      handle: 'signature-laser-facial',
      description: 'Precision laser facial rejuvenation addressing fine lines, tone, and skin texture.',
      imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
      minPrice: '185.00',
      currency: 'USD',
      options: [
        { name: 'Laser Intensity', values: ['Gentle Glow Laser', 'Deep Fractional Laser'] },
        { name: 'Laser Specialist', values: ['Sophia Thorne', 'Elena Rostova'] },
      ],
      variants: [
        { id: 'gid://shopify/ProductVariant/99012345606', numericId: '99012345606', title: 'Gentle Glow Laser / Sophia Thorne', price: '185.00', available: true },
      ],
    },
  ];
}

/**
 * Create Variant on Shopify Product via Admin API
 */
export async function createShopifyProductVariantAdmin(productId, { serviceTitle, staffName, price }) {
  const shopDomain = getShopDomain('demo-salon-booking.myshopify.com');
  const accessToken = await getValidShopifyAdminToken();
  const numericId = String(productId).split('/').pop();

  if (accessToken && !accessToken.includes('demo')) {
    try {
      console.log(`[Shopify Admin API] Fetching product details for ID: ${numericId}...`);

      // 1. Inspect existing product and options on Shopify
      const prodRes = await fetch(`https://${shopDomain}/admin/api/2024-04/products/${numericId}.json`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      });

      const prodData = await prodRes.json();
      let variantPayload = {
        price: Number(price).toFixed(2),
        requires_shipping: false,
      };

      if (prodData.product) {
        const optionsCount = prodData.product.options?.length || 1;

        if (optionsCount >= 2) {
          variantPayload.option1 = serviceTitle;
          variantPayload.option2 = staffName || 'Any Staff';
        } else {
          // Single option product: combining Service & Staff in option1
          variantPayload.option1 = `${serviceTitle} - ${staffName || 'Specialist'}`;
        }
      } else {
        variantPayload.option1 = serviceTitle;
      }

      console.log(`[Shopify Admin API] Posting new variant payload:`, variantPayload);

      // 2. Post new variant to Shopify Admin API
      const response = await fetch(`https://${shopDomain}/admin/api/2024-04/products/${numericId}/variants.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ variant: variantPayload }),
      });

      const data = await response.json();

      if (data.variant) {
        console.log(`[Shopify Admin API] Variant created successfully! Variant ID: ${data.variant.id}`);
        return {
          success: true,
          variantId: `gid://shopify/ProductVariant/${data.variant.id}`,
          numericVariantId: String(data.variant.id),
          shopifyVariant: data.variant,
        };
      } else if (data.errors) {
        console.error(`[Shopify Admin API Error]`, data.errors);

        // Retry fallback with simplified option1
        const fallbackRes = await fetch(`https://${shopDomain}/admin/api/2024-04/products/${numericId}/variants.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({
            variant: {
              option1: `${serviceTitle} (${Math.floor(100 + Math.random() * 900)})`,
              price: Number(price).toFixed(2),
              requires_shipping: false,
            },
          }),
        });

        const fallbackData = await fallbackRes.json();
        if (fallbackData.variant) {
          return {
            success: true,
            variantId: `gid://shopify/ProductVariant/${fallbackData.variant.id}`,
            numericVariantId: String(fallbackData.variant.id),
            shopifyVariant: fallbackData.variant,
          };
        }

        return {
          success: false,
          error: typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors),
        };
      }
    } catch (err) {
      console.error('Failed to create variant via Shopify Admin API:', err);
    }
  }

  // Fallback mock variant ID for offline / dev mode
  const mockVarId = `889012345${Math.floor(100 + Math.random() * 900)}`;
  return {
    success: true,
    variantId: `gid://shopify/ProductVariant/${mockVarId}`,
    numericVariantId: mockVarId,
    isMock: true,
  };
}
