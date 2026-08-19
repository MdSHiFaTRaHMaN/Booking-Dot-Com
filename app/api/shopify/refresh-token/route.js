import { NextResponse } from 'next/server';
import { refreshShopifyAdminAccessToken, getValidShopifyAdminToken, getShopDomain } from '@/lib/shopify.js';
import connectToDatabase from '@/lib/db.js';
import ShopifyAuth from '@/lib/models/ShopifyAuth.js';

/**
 * GET: Check the current token status, expiration time, and validity
 */
export async function GET() {
  try {
    const shopDomain = getShopDomain();
    const currentToken = await getValidShopifyAdminToken(false);
    const cache = global._shopifyTokenCache || {};

    let dbRecord = null;
    try {
      await connectToDatabase();
      dbRecord = await ShopifyAuth.findOne({ shopDomain }).lean();
    } catch (e) {
      // MongoDB optional
    }

    const expiresAt = cache.expiresAt || dbRecord?.expiresAt;
    const now = Date.now();
    const remainingMs = expiresAt ? new Date(expiresAt).getTime() - now : null;
    const remainingHours = remainingMs ? (remainingMs / (1000 * 60 * 60)).toFixed(2) : null;
    const isExpiringSoon = remainingMs ? remainingMs < 60 * 60 * 1000 : false;

    return NextResponse.json({
      success: true,
      shopDomain,
      hasActiveToken: Boolean(currentToken),
      tokenPreview: currentToken ? `${currentToken.slice(0, 10)}...${currentToken.slice(-6)}` : null,
      expiresAt: expiresAt || null,
      remainingHours: remainingHours ? `${remainingHours} hrs` : 'Unknown',
      isExpiringSoon,
      lastRefreshedAt: cache.lastRefreshedAt || dbRecord?.lastRefreshedAt || null,
      autoRenewalEnabled: true,
      renewalThreshold: 'Renews automatically at 23 hours (1 hour before 24h expiration)',
    });
  } catch (error) {
    console.error('Error checking Shopify token status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Force refresh the Shopify Admin API Access Token immediately
 */
export async function POST(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // No JSON body provided, using default env credentials
    }

    const result = await refreshShopifyAdminAccessToken({
      customDomain: body.shopDomain,
      customClientId: body.clientId,
      customClientSecret: body.clientSecret,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Shopify Admin API Token successfully refreshed!',
        tokenPreview: `${result.accessToken.slice(0, 10)}...${result.accessToken.slice(-6)}`,
        expiresAt: result.expiresAt,
        expiresInHours: (result.expiresIn / 3600).toFixed(1),
        scope: result.scope,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to refresh token from Shopify OAuth endpoint.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error refreshing Shopify access token:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
