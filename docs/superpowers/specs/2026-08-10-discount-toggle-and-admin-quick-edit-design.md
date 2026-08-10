# Discount Toggle + Card Hover Image + Admin Quick Edit — Design

Ngày: 2026-08-10

## Mục tiêu

Bốn tính năng độc lập, gom chung một đợt vì đều xoay quanh giá và bảng quản trị sản phẩm:

1. **Công tắc giảm giá tổng** — một nút bật/tắt toàn site. Tắt thì mọi sản phẩm chỉ hiện giá gốc, dù đã set giá khuyến mãi.
2. **Card sản phẩm đổi ảnh** — rê chuột vào card thì ảnh preview chuyển sang ảnh thứ 2.
3. **Cột "Giá đã giảm"** trong bảng quản trị sản phẩm.
4. **Sửa nhanh tại chỗ** trong bảng quản trị: tên, giá, giá đã giảm, và công tắc ẩn/hiện — không cần mở trang chi tiết.

## Bối cảnh code hiện tại

- `products` có sẵn: `price`, `sale_price`, `discount_percentage`, `is_visible`, `is_available`.
- `site_settings` (key `VARCHAR` PK, value `TEXT`) đã tồn tại từ `scripts/018_create_feedbacks_and_settings.sql` nhưng **chưa được dùng ở bất kỳ đâu trong code**.
- Trang quản trị ghi DB trực tiếp bằng supabase browser client (`createBrowserClient`), không dùng server action. Sau khi ghi thì gọi `router.refresh()`.
- Các trang công khai (`app/page.tsx`, `app/products/page.tsx`, `app/products/[id]/page.tsx`) render động vì supabase server client đọc cookie — không có `revalidate` tĩnh.
- `sonner` toast và `components/ui/switch.tsx` đã có sẵn.
- `sale_price` và `discount_percentage` hiện là hai ô nhập tay rời nhau trong `product-form.tsx`, không ràng buộc gì nhau.

---

## Tính năng 1 — Công tắc giảm giá tổng

### Lưu trữ

Script mới `scripts/021_seed_discount_setting.sql`:

```sql
INSERT INTO site_settings (key, value)
VALUES ('discounts_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
```

Không tạo bảng mới. Không đổi schema `products`.

### Đọc setting

`lib/settings.ts`:

```ts
getDiscountsEnabled(): Promise<boolean>
```

- Dùng supabase server client, `select value from site_settings where key = 'discounts_enabled'`.
- **Mặc định `true`** khi query lỗi hoặc không có row. Lý do: hỏng DB thì hành vi giữ nguyên như hiện tại (có giảm giá), khách không bị đội giá bất ngờ.

### Áp dụng

`lib/pricing.ts`:

```ts
applyDiscountSetting<T>(products: T[], enabled: boolean): T[]
applyDiscountSettingToOne<T>(product: T, enabled: boolean): T
```

Khi `enabled === false`, trả bản sao với `sale_price = null` và `discount_percentage = null`. Khi `true`, trả nguyên bản.

Gọi ở tầng server, **trước khi truyền dữ liệu xuống component**:

| File | Việc cần làm |
|---|---|
| `app/page.tsx` | Bọc mảng `featuredProducts` |
| `app/products/page.tsx` | Bọc mảng `products` sau khi flatten categories |
| `app/products/[id]/page.tsx` | Bọc object sản phẩm đơn trước khi truyền vào `ProductPageClient` |

**`components/product-card.tsx` và `ProductPageClient.tsx` không cần sửa gì cho tính năng này.** Nhánh `sale_price ? ... : ...` và `discount_percentage && ...` sẵn có tự xử lý đúng khi hai trường về `null`.

### Giao diện quản trị

`app/admin/settings/page.tsx` — bỏ phần "Coming Soon", đổi thành client component:

- Card "Khuyến mãi", một `Switch` với nhãn "Bật giảm giá toàn site".
- Mô tả trạng thái: bật → "Giá khuyến mãi đang được áp dụng cho khách"; tắt → "Khách chỉ thấy giá gốc. Giá khuyến mãi đã set vẫn được lưu."
- Bật/tắt = `upsert` vào `site_settings` ngay lập tức, không có nút Lưu riêng. Optimistic update, thất bại thì trả switch về vị trí cũ + toast đỏ.
- Đọc giá trị ban đầu ở server component cha rồi truyền xuống làm prop.

### Cache

Các trang công khai đã render động, không cần `revalidatePath`. Bật/tắt xong tải lại trang là thấy ngay.

---

## Tính năng 2 — Card đổi sang ảnh thứ 2

Sửa `components/product-card.tsx`. Trong khung `aspect-[4/5]`:

- Ảnh 1 giữ nguyên như hiện tại.
- Ảnh 2 chỉ render khi `product.images[1]` tồn tại, đặt chồng lên (`absolute inset-0`), khởi đầu `opacity-0`.

**Máy tính:** ảnh 2 `group-hover:opacity-100`, chuyển màu 500ms. Giữ nguyên hiệu ứng `scale-110` và lớp phủ "Xem chi tiết" đang có.

**Điện thoại:** trong `@media (hover: none)`, chạy CSS keyframe cross-fade chu kỳ 5 giây (mỗi ảnh hiện ~2s, chuyển ~0.5s). Thuần CSS, không JS, nên `ProductCard` vẫn là server component.

Chống nhấp nháy đồng loạt: thêm prop `index?: number` vào `ProductCard`, dùng để đặt `animation-delay` lệch nhau theo vòng 4 nấc — `(index % 4) * 1.2s`. Cả hai chỗ gọi card đều đã có sẵn biến chỉ số trong `.map()`: `app/products/page.tsx` dùng tên `index`, `app/page.tsx` dùng tên `i` (dòng 244). Prop mặc định `0` nếu không truyền.

Sản phẩm chỉ có một ảnh: hành vi không đổi.

Keyframes khai báo trong `app/globals.css` cạnh các animation sẵn có.

---

## Tính năng 3 — Cột "Giá đã giảm" trong bảng quản trị

`components/admin/products-table.tsx`:

- Thêm `sale_price?: number | null` và `discount_percentage?: number | null` vào interface `Product`. Query ở `app/admin/products/page.tsx` đang là `select('*')` nên đã có sẵn dữ liệu, không cần đổi.
- Cột mới **"Giá đã giảm"** ngay sau cột "Giá": hiện `formatPrice(sale_price)` kèm badge `-x%`. Chưa set thì hiện `—` màu nhạt.
- Cập nhật `colSpan` của hàng rỗng từ 7 lên 8.

---

## Tính năng 4 — Sửa nhanh tại chỗ

Toàn bộ nằm trong `components/admin/products-table.tsx` (đã là client component).

### Cột "Thao tác"

Bỏ nút con mắt (link `/products/[id]`).

| Chế độ | Nội dung cột |
|---|---|
| Xem | `[Switch ẩn/hiện]` `[✏️ Sửa nhanh]` `[🗑️ Xoá]` |
| Sửa | `[Switch ẩn/hiện]` `[✓ Lưu]` `[✕ Huỷ]` |

Link tới trang sửa đầy đủ `/admin/products/[id]/edit` chuyển sang **tên sản phẩm** ở chế độ xem, có gạch chân khi rê chuột.

### Công tắc ẩn/hiện

- `Switch` luôn bấm được ở chế độ xem, không cần vào chế độ sửa.
- Bấm = ghi `is_visible` vào DB ngay. Optimistic update; thất bại thì trả switch về trạng thái cũ + toast đỏ.
- Cột "Trạng thái" đọc cùng một state cục bộ nên badge "Đang hiện / Đang ẩn" đổi theo tức thì.

### Chế độ sửa hàng

- State `editingId: string | null` — mỗi lúc chỉ một hàng ở chế độ sửa. Bấm sửa hàng khác trong lúc đang sửa dở: huỷ bản nháp cũ, mở hàng mới.
- Bấm ✏️: ba ô **Tên**, **Giá**, **Giá đã giảm** biến thành `Input` tại chỗ. Các cột khác giữ nguyên.
- **Enter** = lưu. **Esc** = huỷ. Đang lưu thì khoá input và nút.
- Huỷ thì bỏ bản nháp, quay lại giá trị gốc.

### Kiểm tra trước khi ghi

| Điều kiện | Thông báo lỗi |
|---|---|
| Tên rỗng sau khi cắt khoảng trắng | "Tên sản phẩm không được để trống" |
| Giá không phải số, hoặc ≤ 0 | "Giá phải là số lớn hơn 0" |
| Giá đã giảm có nhập nhưng ≤ 0 | "Giá đã giảm phải lớn hơn 0" |
| Giá đã giảm ≥ giá gốc | "Giá đã giảm phải nhỏ hơn giá gốc" |

Sai thì hiện toast đỏ, **giữ nguyên chế độ sửa và nội dung đang gõ**, không ghi DB.

Ô "Giá đã giảm" để trống là hợp lệ — nghĩa là bỏ khuyến mãi.

### Tự tính phần trăm

Giá đã giảm là nguồn sự thật duy nhất. Phần trăm luôn được suy ra:

```
discount_percentage = sale_price ? Math.round((price - sale_price) / price * 100) : null
```

Áp dụng ở cả hai chỗ:

- **Sửa nhanh trong bảng** — tính lúc lưu.
- **`components/admin/product-form.tsx`** — bỏ ô nhập "Phần trăm giảm giá (%)", thay bằng dòng chữ xem trước "≈ -25%" tự cập nhật khi gõ giá đã giảm. Lúc submit thì tính và ghi như công thức trên.

Ô "Giá đã giảm" bị xoá trắng → cả `sale_price` và `discount_percentage` đều về `null`.

### Ghi dữ liệu

Theo đúng pattern đang dùng: supabase browser client `.update({...}).eq('id', id)`, xong `router.refresh()`. Không thêm API route hay server action mới.

---

## Rủi ro và cách xử lý

**Đổi `discount_percentage` sang tự tính sẽ ghi đè số phần trăm nhập tay.** Sản phẩm nào có `discount_percentage` không khớp với `sale_price` (ví dụ `sale_price` trống nhưng `discount_percentage = 20`) sẽ bị đưa về giá trị suy ra ngay lần lưu đầu tiên.

Trước khi đụng vào, chạy câu này để đếm số sản phẩm bị ảnh hưởng:

```sql
SELECT id, name, price, sale_price, discount_percentage,
       CASE WHEN sale_price IS NULL OR price IS NULL OR price = 0 THEN NULL
            ELSE ROUND((price - sale_price) / price * 100)::int END AS computed_percentage
FROM products
WHERE discount_percentage IS DISTINCT FROM (
  CASE WHEN sale_price IS NULL OR price IS NULL OR price = 0 THEN NULL
       ELSE ROUND((price - sale_price) / price * 100)::int END
);
```

(`price` là `DECIMAL(10,2)` và `sale_price` là `NUMERIC` nên phép chia ra số thực, không bị chia nguyên.)

Đưa kết quả cho người dùng xem và xác nhận trước khi làm tiếp phần tự tính phần trăm.

---

## Ngoài phạm vi

- Không đặt lịch giảm giá theo thời gian (đã từng có `sale_start_date` / `sale_end_date`, bị bỏ ở script 011 — không khôi phục).
- Không giảm giá theo danh mục hay theo nhóm sản phẩm. Chỉ một công tắc tổng.
- Không sửa nhanh hàng loạt (chọn nhiều dòng cùng lúc).
- Không sửa nhanh mô tả, ảnh, danh mục, SEO — những thứ đó vẫn ở trang sửa đầy đủ.
- Không đụng tới `is_available` (còn hàng / hết hàng) trong bảng quản trị.

## Kiểm thử

Dự án không có test runner. Kiểm thử thủ công:

1. Tắt giảm giá tổng → trang chủ, trang danh sách, trang chi tiết đều chỉ hiện giá gốc, không còn giá gạch ngang và badge phần trăm.
2. Bật lại → giá khuyến mãi hiện đúng như trước, không mất dữ liệu.
3. Card có từ 2 ảnh: rê chuột đổi ảnh; card 1 ảnh không đổi gì; trên điện thoại các card đổi ảnh lệch nhịp nhau.
4. Bảng quản trị: sửa tên/giá/giá đã giảm rồi lưu → tải lại trang thấy đúng, phần trăm khớp công thức.
5. Bấm công tắc ẩn → sản phẩm biến mất khỏi trang danh sách công khai.
6. Từng trường hợp kiểm tra dữ liệu ở bảng trên đều chặn được và giữ nguyên chữ đang gõ.
