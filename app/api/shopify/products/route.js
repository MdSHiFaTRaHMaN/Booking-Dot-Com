import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db.js';
import Service from '@/lib/models/Service.js';
import Staff from '@/lib/models/Staff.js';
import { fetchShopifyProductsStorefront, createShopifyProductVariantAdmin, getShopDomain } from '@/lib/shopify.js';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch products via Storefront API
    const storefrontProducts = await fetchShopifyProductsStorefront();

    // 2. Fetch Services and Staff from DB
    const allServices = await Service.find({ status: 'ACTIVE' }).populate({ path: 'assignedStaff', model: Staff });
    const allStaff = await Staff.find({ status: 'ACTIVE' });

    // 3. Merge MongoDB Services & Staff under each Shopify Product
    const enrichedProducts = storefrontProducts.map((prod) => {
      const pId = prod.id;
      const numericId = prod.numericId;

      // Match services that belong to this product OR fallback assignment
      const assignedServices = allServices.filter(
        (s) => s.shopifyProductId === pId || s.shopifyProductId === numericId || !s.shopifyProductId
      );

      // Match staff assigned to this product or all staff
      const assignedStaff = allStaff.filter(
        (st) => st.shopifyProductIds?.includes(pId) || st.shopifyProductIds?.includes(numericId) || true
      );

      return {
        ...prod,
        assignedServices,
        assignedStaff,
      };
    });

    return NextResponse.json({
      success: true,
      shopDomain: getShopDomain('demo-salon-booking.myshopify.com'),
      isLiveCredentialsConfigured: Boolean(
        (process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN && !process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN.includes('demo')) ||
        (process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET)
      ),
      products: enrichedProducts,
      allDbServices: allServices,
      allDbStaff: allStaff,
    });
  } catch (error) {
    console.error('Error fetching Shopify products API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { shopifyProductId, serviceTitle, servicePrice, durationMinutes, staffId, category, description } = body;

    if (!shopifyProductId || !serviceTitle || !servicePrice) {
      return NextResponse.json(
        { success: false, error: 'Shopify Product ID, Service Title, and Price are required.' },
        { status: 400 }
      );
    }

    // 1. Find assigned staff if provided
    let staffDoc = null;
    if (staffId) {
      staffDoc = await Staff.findById(staffId);
      if (staffDoc) {
        if (!staffDoc.shopifyProductIds) staffDoc.shopifyProductIds = [];
        if (!staffDoc.shopifyProductIds.includes(shopifyProductId)) {
          staffDoc.shopifyProductIds.push(shopifyProductId);
          await staffDoc.save();
        }
      }
    }

    // 2. Create Variant on Shopify via Admin API
    const variantResult = await createShopifyProductVariantAdmin(shopifyProductId, {
      serviceTitle,
      staffName: staffDoc ? staffDoc.name : 'Any Staff',
      price: servicePrice,
    });

    // 3. Create Service in MongoDB linked to this Shopify Product & Variant
    const newService = await Service.create({
      title: serviceTitle,
      description: description || `Product specific service for ${shopifyProductId}`,
      durationMinutes: Number(durationMinutes || 60),
      bufferMinutes: 15,
      price: Number(servicePrice),
      category: category || 'Custom Service',
      imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500',
      shopifyProductId: shopifyProductId,
      shopifyVariantId: variantResult.variantId,
      assignedStaff: staffDoc ? [staffDoc._id] : [],
      status: 'ACTIVE',
    });

    if (staffDoc && !staffDoc.services.includes(newService._id)) {
      staffDoc.services.push(newService._id);
      await staffDoc.save();
    }

    return NextResponse.json(
      {
        success: true,
        service: newService,
        variantResult,
        message: 'Product variant & service successfully created and synced!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product service/variant:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
