# Address & File Upload API

## User Shipping Addresses — `/api/v1/users/addresses`

All address endpoints require a valid **JWT Bearer token** in the `Authorization` header.
The token identifies the user — you can only access your own addresses.

---

### GET `/api/v1/users/addresses`

Returns all saved shipping addresses for the authenticated user.

**Auth:** Required (Bearer token)

**Response**

```json
{
  "success": true,
  "message": "Addresses retrieved",
  "data": null,
  "listData": [
    {
      "id": 1,
      "userId": 42,
      "name": "John Doe",
      "phone": "01700000000",
      "addressLine": "123 Main Street",
      "city": "Dhaka",
      "area": "Gulshan",
      "postalCode": "1212",
      "cityId": 1,
      "zoneId": 2,
      "areaId": 15,
      "isDefault": true,
      "createdAt": "2026-03-07T10:00:00",
      "updatedAt": "2026-03-07T10:00:00"
    }
  ]
}
```

Results are ordered: default address first, then newest first.

---

### POST `/api/v1/users/addresses`

Save a new shipping address for the authenticated user.

**Auth:** Required (Bearer token)

**Request Body**

```json
{
  "addressLine": "123 Main Street",
  "city": "Dhaka",
  "name": "John Doe",
  "phone": "01700000000",
  "area": "Gulshan",
  "postalCode": "1212",
  "cityId": 1,
  "zoneId": 2,
  "areaId": 15,
  "isDefault": false
}
```

| Field         | Type      | Required | Description                        |
|---------------|-----------|----------|------------------------------------|
| `addressLine` | `string`  | ✅        | Full address (max 500 chars)       |
| `city`        | `string`  | ✅        | City name (max 100 chars)          |
| `name`        | `string`  | ❌        | Recipient name                     |
| `phone`       | `string`  | ❌        | Recipient phone                    |
| `area`        | `string`  | ❌        | Area / locality                    |
| `postalCode`  | `string`  | ❌        | Postal code                        |
| `cityId`      | `integer` | ❌        | Pathao city ID (from locations API)|
| `zoneId`      | `integer` | ❌        | Pathao zone ID                     |
| `areaId`      | `integer` | ❌        | Pathao area ID                     |
| `isDefault`   | `boolean` | ❌        | Set as default address (false)     |

**Behaviour**
- Returns **409 Conflict** if an address with the same `addressLine` + `city` already exists for this user.
- If `isDefault: true`, any previously default address is automatically cleared.

**Response** — `201 Created`

```json
{
  "success": true,
  "message": "Address saved",
  "data": { /* UserAddressDto */ },
  "listData": null
}
```

---

### PUT `/api/v1/users/addresses/{addressId}`

Update an existing saved address. Only the owner can update their own address.

**Auth:** Required (Bearer token)

**Path Param:** `addressId` — integer ID of the address

**Request Body** — all fields optional

```json
{
  "name": "Jane Doe",
  "phone": "01800000000",
  "addressLine": "456 New Road",
  "city": "Chittagong",
  "area": "Agrabad",
  "postalCode": "4100",
  "cityId": 2,
  "zoneId": 5,
  "areaId": 30,
  "isDefault": true
}
```

- Returns **404** if the address does not exist or belongs to a different user.
- If `isDefault: true`, all other default addresses for this user are cleared first.

**Response** — `200 OK`

```json
{
  "success": true,
  "message": "Address updated",
  "data": { /* UserAddressDto */ },
  "listData": null
}
```

---

### DELETE `/api/v1/users/addresses/{addressId}`

Delete a saved address. Only the owner can delete their own address.

**Auth:** Required (Bearer token)

**Path Param:** `addressId` — integer ID of the address

- Returns **404** if the address does not exist or belongs to a different user.

**Response** — `200 OK`

```json
{
  "success": true,
  "message": "Address deleted",
  "data": null,
  "listData": null
}
```

---

### TypeScript Types

```typescript
interface UserAddressDto {
  id: number;
  userId: number;
  name: string | null;
  phone: string | null;
  addressLine: string;
  city: string;
  area: string | null;
  postalCode: string | null;
  cityId: number | null;
  zoneId: number | null;
  areaId: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /api/v1/users/addresses
type ListAddressesResponse = {
  success: boolean;
  message: string;
  data: null;
  listData: UserAddressDto[];
};

// POST /api/v1/users/addresses
interface CreateAddressInput {
  addressLine: string;       // required
  city: string;              // required
  name?: string;
  phone?: string;
  area?: string;
  postalCode?: string;
  cityId?: number;
  zoneId?: number;
  areaId?: number;
  isDefault?: boolean;       // default: false
}
type CreateAddressResponse = DataResponse<UserAddressDto>;

// PUT /api/v1/users/addresses/{addressId}
type UpdateAddressInput = Partial<CreateAddressInput>;
type UpdateAddressResponse = DataResponse<UserAddressDto>;

// DELETE /api/v1/users/addresses/{addressId}
type DeleteAddressResponse = ActionResponse;
```

---

### How User Identification Works

Every request carries an `Authorization: Bearer <jwt>` header.
The server decodes the token → extracts `user_id` → all DB queries are filtered by that ID:

```
GET /api/v1/users/addresses
  └─ JWT decoded → user_id = 42
  └─ SELECT * FROM user_addresses WHERE user_id = 42

PUT /api/v1/users/addresses/7
  └─ JWT decoded → user_id = 42
  └─ SELECT * FROM user_addresses WHERE id = 7 AND user_id = 42
  └─ 404 if not found (also covers addresses belonging to other users)
```

There is no way to access or modify another user's addresses.

---

### Auto-save on Order Placement

When a buyer places an order via `POST /api/v1/orders`, the shipping address is
**automatically saved** to `user_addresses` (best-effort — order is never blocked
if the save fails). Duplicate check (`addressLine` + `city`) prevents repeated
orders from creating duplicate saved addresses.

---

---

## File Upload API — `/api/v1/files`

Single endpoint that handles all file uploads to Cloudinary.
Other APIs (products, categories, memos) accept Cloudinary URLs — this is
the only place files are actually sent to Cloudinary.

---

### POST `/api/v1/files/upload`

Upload one or more image or PDF files to Cloudinary.

**Auth:** Required (Bearer token — buyer or admin)

**Content-Type:** `multipart/form-data`

**Query Param**

| Param    | Type     | Default    | Allowed values                        |
|----------|----------|------------|---------------------------------------|
| `folder` | `string` | `products` | `products`, `categories`, `uploads`  |

**Form Fields**

| Field   | Type             | Description                              |
|---------|------------------|------------------------------------------|
| `files` | `File[]`         | One or more files (images or PDFs)       |

**Accepted file types**

| Type   | Extensions              | Max size |
|--------|-------------------------|----------|
| Image  | `.jpg`, `.jpeg`, `.png`, `.webp` | 5 MB |
| PDF    | `.pdf`                  | 5 MB     |

File type is detected from the **file content (magic bytes)** — not just the extension.

**Response** — `200 OK`

```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": null,
  "listData": [
    "https://res.cloudinary.com/demo/image/upload/products/shirt_a1b2c3d4.jpg",
    "https://res.cloudinary.com/demo/image/upload/products/photo_e5f6a7b8.jpg"
  ]
}
```

`listData` is an array of Cloudinary secure URLs — one per successfully uploaded file.

**Error responses**

| Status | Reason                                         |
|--------|------------------------------------------------|
| `422`  | All files failed validation (wrong type, too large, corrupt) |
| `503`  | Cloudinary credentials not configured on server |

If some files succeed and some fail, `200` is returned with a partial message:
```json
{
  "success": true,
  "message": "Uploaded 2 file(s) with 1 error(s): bad.exe: Unsupported file type",
  "data": null,
  "listData": ["https://...url1", "https://...url2"]
}
```

**Empty upload** — sending no files returns `200` with an empty array:
```json
{ "success": true, "message": "No files provided", "data": null, "listData": [] }
```

---

### Cloudinary Folder Routing

| `folder` param | Cloudinary path          | Use for               |
|----------------|--------------------------|-----------------------|
| `products`     | `products/{name}_{uuid}` | Product images        |
| `categories`   | `categories/{name}_{uuid}` | Category images     |
| `uploads`      | `uploads/{name}_{uuid}`  | General uploads       |
| *(invalid)*    | `products/...` (fallback)| Unknown values default to `products` |

PDFs always go to `memos/` regardless of the `folder` param.

---

### TypeScript Usage

```typescript
// Upload product images
async function uploadProductImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach(f => form.append("files", f));

  const res = await axios.post<ApiResponse>(
    "/api/v1/files/upload?folder=products",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.listData as string[]; // Cloudinary URLs
}

// Upload category image
async function uploadCategoryImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);

  const res = await axios.post<ApiResponse>(
    "/api/v1/files/upload?folder=categories",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return (res.data.listData as string[])[0];
}

// Upload memo PDF
async function uploadMemoPdf(file: File): Promise<string> {
  const form = new FormData();
  form.append("files", file);

  // folder param is ignored for PDFs — they always go to memos/
  const res = await axios.post<ApiResponse>(
    "/api/v1/files/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return (res.data.listData as string[])[0];
}
```

---

### Typical Workflow

```
1. User selects image(s) in frontend
2. POST /api/v1/files/upload?folder=products  →  get Cloudinary URLs
3. Use those URLs in POST /api/v1/products  { imageUrls: [...] }
```

The backend never stores files locally. Cloudinary URLs are stored
directly in the database columns (`image_urls`, `pdf_url`, etc).
