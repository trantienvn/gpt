# Hướng dẫn sử dụng PHP Proxy

## Tính năng

PHP Proxy cho phép bạn gọi các API không hỗ trợ CORS (Cross-Origin Resource Sharing) trực tiếp từ trình duyệt. Thay vì gọi trực tiếp từ JavaScript, request sẽ được chuyển qua server PHP, sau đó PHP sẽ gọi API và trả kết quả về cho trình duyệt.

## Khi nào cần sử dụng Proxy?

Sử dụng proxy khi bạn gặp các lỗi sau trong Console của trình duyệt:

- `CORS policy: No 'Access-Control-Allow-Origin' header is present`
- `Failed to fetch`
- Các lỗi liên quan đến CORS

## Cài đặt

### 1. Yêu cầu

- PHP 7.4 trở lên
- Extension `curl` được bật trong PHP
- Web server (Apache, Nginx, hoặc PHP built-in server)

### 2. Kiểm tra PHP và cURL

```bash
php -v
php -m | grep curl
```

### 3. Chạy ứng dụng

#### Sử dụng PHP Built-in Server (Đơn giản nhất)

```bash
php -S localhost:8000
```

Sau đó truy cập: `http://localhost:8000`

#### Sử dụng Apache/Nginx

Đặt các file vào thư mục web root (htdocs, www, public_html, v.v.)

## Cách sử dụng

1. Mở ứng dụng trong trình duyệt
2. Click vào nút **"Cài đặt"**
3. Tích vào checkbox **"Sử dụng PHP Proxy (cho API không hỗ trợ CORS)"**
4. Nhập API Key và chọn model như bình thường
5. Bắt đầu chat

## Cách hoạt động

### Không dùng Proxy (Mặc định)
```
Trình duyệt → API Server (có thể bị lỗi CORS)
```

### Dùng Proxy
```
Trình duyệt → api-proxy.php → API Server → api-proxy.php → Trình duyệt
```

## Bảo mật

⚠️ **Lưu ý quan trọng:**

- File `api-proxy.php` cho phép chuyển tiếp request đến bất kỳ URL nào
- Chỉ nên sử dụng trên môi trường development/local
- Không nên deploy lên production mà không có xác thực
- API Key vẫn được gửi qua proxy, nên đảm bảo sử dụng HTTPS trong production

### Tăng cường bảo mật (Khuyến nghị cho Production)

Thêm whitelist URL vào `api-proxy.php`:

```php
// Thêm sau dòng $url = $input['url'];
$allowedDomains = [
    'generativelanguage.googleapis.com',
    'api.openai.com',
    'localhost'
];

$urlHost = parse_url($url, PHP_URL_HOST);
if (!in_array($urlHost, $allowedDomains)) {
    http_response_code(403);
    echo json_encode(['error' => 'Domain not allowed']);
    exit();
}
```

## Xử lý lỗi

### Lỗi: "Call to undefined function curl_init()"

Cài đặt PHP cURL extension:

**Ubuntu/Debian:**
```bash
sudo apt-get install php-curl
sudo service apache2 restart
```

**Windows (XAMPP):**
- Mở file `php.ini`
- Bỏ comment dòng: `extension=curl`
- Restart Apache

### Lỗi: "Proxy error"

Kiểm tra:
1. URL API có đúng không
2. API Key có hợp lệ không
3. Kết nối internet
4. Firewall có chặn không

## Hiệu suất

- Proxy sẽ làm tăng độ trễ một chút do phải đi qua server PHP
- Streaming vẫn hoạt động bình thường
- Phù hợp cho development và các ứng dụng nhỏ

## Troubleshooting

### Streaming không hoạt động

Đảm bảo PHP output buffering được tắt. Thêm vào đầu file `api-proxy.php`:

```php
ini_set('output_buffering', 'off');
ini_set('zlib.output_compression', false);
```

### Timeout khi chat dài

Tăng timeout trong `api-proxy.php`:

```php
curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 phút
```

## Giấy phép

MIT License
