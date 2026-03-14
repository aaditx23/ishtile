import test from 'node:test';
import assert from 'node:assert/strict';
import { ConvexHttpClient } from 'convex/browser';
import { NextRequest } from 'next/server';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { api } from '../convex/_generated/api';
import { signToken } from '../src/lib/auth';
import { tokenStore } from '../src/infrastructure/auth/tokenStore';
import { createOrder } from '../src/application/checkout/createOrder';
import { pathaoClient } from '../src/lib/pathao/client';
import { POST as createCheckoutPathaoOrderRoute } from '../src/app/api/pathao/checkout/create-order/[orderId]/route';
import { POST as pathaoWebhookRoute } from '../src/app/api/webhooks/pathao/route';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
const webhookSecret = process.env.PATHAO_WEBHOOK_SECRET;

const requiredEnv = [
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_APP_URL',
  'JWT_SECRET',
  'PATHAO_WEBHOOK_SECRET',
  'PATHAO_CLIENT_ID',
  'PATHAO_CLIENT_SECRET',
  'PATHAO_USERNAME',
  'PATHAO_PASSWORD',
  'PATHAO_BASE_URL',
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const convex = new ConvexHttpClient(convexUrl!);

type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

function unique(prefix: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${ts}-${rand}`;
}

async function getOrderAsAdmin(orderId: string, adminUserId: string) {
  return await convex.query(api.orders.queries.getOrderById, {
    orderId: orderId as any,
    userId: adminUserId as any,
    role: 'admin',
  });
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPathaoOrderInfoWithRetry(consignmentId: string, attempts = 3) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await pathaoClient.orders.getInfo(consignmentId);
    } catch (err) {
      lastErr = err;
      await sleep(800);
    }
  }
  throw lastErr;
}

async function makeWebhookCall(payload: Record<string, unknown>) {
  const req = new NextRequest(`${baseUrl}/api/webhooks/pathao`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-pathao-signature': webhookSecret!,
    },
    body: JSON.stringify(payload),
  });

  const res = await pathaoWebhookRoute(req);
  const json = await res.json();
  return { status: res.status, body: json };
}

async function listSrcFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx'))) {
        out.push(full);
      }
    }
  }

  await walk(rootDir);
  return out;
}

test('Pathao workflow integration lifecycle', async () => {
  const buyerPhone = `017${Math.floor(10000000 + Math.random() * 89999999)}`;
  const buyerEmail = `${unique('buyer')}@example.com`;
  const buyerUsername = unique('buyer');

  const adminPhone = `018${Math.floor(10000000 + Math.random() * 89999999)}`;
  const adminEmail = `${unique('admin')}@example.com`;

  const buyer = await convex.mutation(api.auth.users.register, {
    phone: buyerPhone,
    email: buyerEmail,
    username: buyerUsername,
    fullName: 'Pathao Test Buyer',
    passwordHash: 'integration-test-hash',
  });

  const admin = await convex.mutation(api.auth.users.createAdmin, {
    phone: adminPhone,
    email: adminEmail,
    passwordHash: 'integration-test-hash',
    fullName: 'Pathao Test Admin',
    username: ''
  });

  const buyerToken = await signToken({ userId: buyer.userId as unknown as string, role: 'buyer' });
  tokenStore.setAccess(buyerToken);

  const category = await convex.mutation(api.categories.mutations.createCategory, {
    name: unique('Category'),
    slug: unique('cat-slug'),
    description: 'Pathao integration category',
    isActive: true,
  });

  const productName = unique('Product');
  const sku = unique('SKU').toUpperCase();
  const variantSku = unique('VSKU').toUpperCase();

  const createdProduct = await convex.mutation(api.products.mutations.createProduct, {
    categoryId: category.id,
    name: productName,
    sku,
    imageUrls: ['https://example.com/test-image.jpg'],
    variants: [
      {
        size: 'M',
        color: 'Blue',
        sku: variantSku,
        price: 1000,
        quantity: 10,
      },
    ],
    adminUserId: admin.userId,
  });

  const product = await convex.query(api.products.queries.getProductById, {
    id: createdProduct.id,
    includeVariants: true,
  });
  const productWithVariants = product as { variants?: Array<{ id: string }> } | null;

  assert.ok(product, 'Product should be queryable after creation');
  assert.ok(productWithVariants?.variants?.length, 'Product should contain at least one variant');

  const variantId = String(productWithVariants!.variants![0].id);

  await convex.mutation(api.cart.mutations.addItem, {
    userId: buyer.userId,
    variantId: variantId as any,
    quantity: 1,
  });

  // Step 1: Create test order in DB using checkout application layer.
  // We mock only the route call here so we can validate it explicitly in Step 2.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('/api/pathao/checkout/create-order/')) {
      return new Response(JSON.stringify({ success: true, data: { skippedInStep1: true } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return await realFetch(input, init);
  };

  const orderFromCheckout = await createOrder({
    shippingName: 'Test User',
    shippingPhone: buyerPhone,
    shippingAddress: 'House 10, Dhanmondi, Dhaka',
    shippingAddressLine: 'House 10, Dhanmondi, Dhaka',
    shippingCity: 'Dhaka',
    shippingCityId: 1,
    shippingZoneId: 1,
    shippingAreaId: 1,
    deliveryMode: 'pathao',
  });

  globalThis.fetch = realFetch;

  const pathaoOrderId = String(orderFromCheckout.id);
  let orderInDb = await getOrderAsAdmin(pathaoOrderId, admin.userId as unknown as string);
  assert.ok(orderInDb, 'Order should exist in DB after createOrder()');
  assert.equal(orderInDb?.deliveryMode, 'pathao');
  assert.equal(orderInDb?.pathaoConsignmentId ?? null, null, 'Consignment should not be set before explicit Step 2 call');

  // Step 2: Trigger Pathao order creation route programmatically (no curl).
  const createOrderReq = new NextRequest(`${baseUrl}/api/pathao/checkout/create-order/${pathaoOrderId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  const createOrderRes = await createCheckoutPathaoOrderRoute(createOrderReq, {
    params: Promise.resolve({ orderId: pathaoOrderId }),
  });
  const createOrderBody = await createOrderRes.json();

  assert.equal(createOrderRes.status, 200, `Checkout Pathao create-order failed: ${JSON.stringify(createOrderBody)}`);
  orderInDb = await getOrderAsAdmin(pathaoOrderId, admin.userId as unknown as string);
  assert.ok(orderInDb?.pathaoConsignmentId, 'Consignment ID should be stored after Pathao order creation');

  const consignmentId = orderInDb!.pathaoConsignmentId!;

  // Store resolution verification
  const activeStore = await convex.query((api as any).shipments.queries.getActivePathaoStore, {});
  assert.ok(activeStore?.storeId, 'Store resolution should persist/reuse an active Pathao store');

  // Step 3: Verify Pathao order exists via SDK client.
  const pathaoInfo = await getPathaoOrderInfoWithRetry(consignmentId);
  const responseConsignment =
    (pathaoInfo as any)?.data?.order?.consignment_id ??
    (pathaoInfo as any)?.data?.consignment_id ??
    null;
  assert.equal(responseConsignment, consignmentId, 'SDK order info consignment ID must match stored consignment ID');

  // Step 4: Simulate webhook event -> order.created -> confirmed
  const createdWebhook = await makeWebhookCall({ event: 'order.created', consignment_id: consignmentId });
  assert.equal(createdWebhook.status, 202, `Webhook order.created failed: ${JSON.stringify(createdWebhook.body)}`);

  orderInDb = await getOrderAsAdmin(pathaoOrderId, admin.userId as unknown as string);
  assert.equal(orderInDb?.status as OrderStatus, 'confirmed');

  // Step 5: Simulate pickup event -> mapped to shipped in current status model.
  const pickedWebhook = await makeWebhookCall({ event: 'order.picked', consignment_id: consignmentId });
  assert.equal(pickedWebhook.status, 202, `Webhook order.picked failed: ${JSON.stringify(pickedWebhook.body)}`);

  orderInDb = await getOrderAsAdmin(pathaoOrderId, admin.userId as unknown as string);
  assert.ok((orderInDb?.pathaoStatus ?? '').toLowerCase().includes('picked'));
  assert.equal(orderInDb?.status as OrderStatus, 'shipped');

  // Step 6: Simulate delivery completion.
  const deliveredWebhook = await makeWebhookCall({ event: 'order.delivered', consignment_id: consignmentId });
  assert.equal(deliveredWebhook.status, 202, `Webhook order.delivered failed: ${JSON.stringify(deliveredWebhook.body)}`);

  orderInDb = await getOrderAsAdmin(pathaoOrderId, admin.userId as unknown as string);
  assert.equal(orderInDb?.status as OrderStatus, 'delivered');

  // Step 7: Duplicate parcel protection.
  const duplicateReq = new NextRequest(`${baseUrl}/api/pathao/checkout/create-order/${pathaoOrderId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${buyerToken}` },
  });
  const duplicateRes = await createCheckoutPathaoOrderRoute(duplicateReq, {
    params: Promise.resolve({ orderId: pathaoOrderId }),
  });
  const duplicateBody = await duplicateRes.json();

  assert.equal(duplicateRes.status, 409, `Duplicate protection should return 409, got ${duplicateRes.status}`);
  assert.equal(duplicateBody?.message, 'Parcel already exists for this order');

  // Step 8: Manual mode safety (no Pathao call).
  await convex.mutation(api.cart.mutations.addItem, {
    userId: buyer.userId,
    variantId: variantId as any,
    quantity: 1,
  });

  let checkoutPathaoCalls = 0;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes('/api/pathao/checkout/create-order/')) {
      checkoutPathaoCalls += 1;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return await realFetch(input, init);
  };

  const manualOrder = await createOrder({
    shippingName: 'Manual User',
    shippingPhone: buyerPhone,
    shippingAddress: 'Manual Address, Dhaka',
    shippingAddressLine: 'Manual Address, Dhaka',
    shippingCity: 'Dhaka',
    shippingCityId: 1,
    shippingZoneId: 1,
    shippingAreaId: 1,
    deliveryMode: 'manual',
  });

  globalThis.fetch = realFetch;

  assert.equal(checkoutPathaoCalls, 0, 'Manual mode must not trigger Pathao checkout route');

  const manualInDb = await getOrderAsAdmin(String(manualOrder.id), admin.userId as unknown as string);
  assert.equal(manualInDb?.deliveryMode, 'manual');
  assert.equal(manualInDb?.pathaoConsignmentId ?? null, null, 'Manual order must not have a consignment ID');

  // Step 9: Architecture policy scan.
  const srcRoot = join(process.cwd(), 'src');
  const srcFiles = await listSrcFiles(srcRoot);

  const illegalSdkImports: string[] = [];
  const illegalLocalhostRefs: string[] = [];
  const illegalPathaoEndpoints: string[] = [];

  for (const file of srcFiles) {
    const rel = relative(process.cwd(), file).replace(/\\/g, '/');
    const content = await readFile(file, 'utf8');

    const hasSdkImport = /from\s+['\"]pathao-courier(?:\/webhooks)?['\"]/g.test(content);
    if (hasSdkImport && !rel.startsWith('src/lib/pathao/')) {
      illegalSdkImports.push(rel);
    }

    if (/localhost|127\.0\.0\.1/gi.test(content)) {
      illegalLocalhostRefs.push(rel);
    }

    if (/courier-api-sandbox\.pathao\.com|aladdin\/api|issue-token/gi.test(content)) {
      illegalPathaoEndpoints.push(rel);
    }
  }

  assert.deepEqual(illegalSdkImports, [], `SDK import violation(s): ${illegalSdkImports.join(', ')}`);
  assert.deepEqual(illegalLocalhostRefs, [], `localhost reference(s) found: ${illegalLocalhostRefs.join(', ')}`);
  assert.deepEqual(illegalPathaoEndpoints, [], `Direct Pathao endpoint reference(s): ${illegalPathaoEndpoints.join(', ')}`);

  // Step 10: Final assertions summary is covered by above checks.

  tokenStore.clearAll();
});
