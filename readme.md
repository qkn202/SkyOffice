# 🏰 SkyOffice — Hogwarts Open World Castle Edition (Lâu Đài Hogwarts 2.5D)

> **Không gian học tập, làm việc ảo & nhập vai ma thuật phong cách Lâu Đài Hogwarts (2.5D Isometric RPG).**  
> Hệ thống kết nối liên hoàn **Đại Sảnh Đường (The Great Hall)** và **4 Phòng Sinh Hoạt Chung (House Common Rooms)** thành một thế giới mở 3600 × 2400 px, cho phép người chơi tự do đi bộ khám phá bằng bàn phím qua các hành lang đá hoàng gia lộng lẫy.

---

## 📌 Mục Lục (Table of Contents)

1. [Tổng Quan Dự Án (Project Overview)](#-tổng-quan-dự-án-project-overview)
2. [Kiến Trúc Thế Giới Mở Hub & Spoke (Castle Layout)](#-kiến-trúc-thế-giới-mở-hub--spoke-castle-layout)
3. [Thiết Kế Hành Lang Đá Hoàng Gia Nghệ Thuật (Artisan Corridors)](#-thiết-kế-hành-lang-đá-hoàng-gia-nghệ-thuật-artisan-corridors)
4. [Cấu Trúc 5 Khu Vực & Tọa Độ (5 Castle Wings & Coordinates)](#-cấu-trúc-5-khu-vực--tọa-độ-5-castle-wings--coordinates)
5. [Cơ Chế Bản Đồ 2.5D, Tọa Độ & Va Chạm (2.5D Engine & Colliders)](#-cơ-chế-bản-đồ-25d-tọa-độ--va-chạm-25d-engine--colliders)
6. [Hệ Thống Tương Tác & Phép Thuật (Interactive Systems)](#-hệ-thống-tương-tác--phép-thuật-interactive-systems)
7. [Hệ Thống Điểm Nhà & Bảng Vinh Danh (House Points & Galleons)](#-hệ-thống-điểm-nhà--bảng-vinh-danh-house-points--galleons)
8. [Cổng Mini Game Multiplayer (Seven Potters & Undercover)](#-cổng-mini-game-multiplayer)
9. [Bạn Bè, Biểu Cảm & Sự Kiện (Social Hub & Proximity Media)](#-bạn-bè-biểu-cảm--sự-kiện-social-hub--proximity-media)
10. [Phím Tắt Điều Khiển (Keyboard & Mouse Controls)](#-phím-tắt-điều-khiển-keyboard--mouse-controls)
11. [Kiến Trúc Kỹ Thuật & Công Nghệ (Tech Stack)](#-kiến-trúc-kỹ-thuật--công-nghệ-tech-stack)
12. [Cấu Trúc Thư Mục (Project Structure)](#-cấu-trúc-thư-mục-project-structure)
13. [Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart & Setup)](#-hướng-dẫn-cài-đặt--khởi-chạy-quickstart--setup)
14. [Quy Trình Tái Tạo Bản Đồ (Map Generation Workflow)](#-quy-trình-tái-tạo-bản-đồ-map-generation-workflow)
15. [Triển Khai Production 24/7 (Deployment Guide)](#-triển-khai-production-247-deployment-guide)

---

## 🧙‍♂️ Tổng Quan Dự Án (Project Overview)

Dự án được xây dựng và mở rộng từ nền tảng **SkyOffice** (Virtual Office mã nguồn mở thắng giải Monte Jade 2021). Toàn bộ không gian văn phòng phẳng truyền thống đã được nâng cấp toàn diện thành **Quần Thể Lâu Đài Hogwarts 2.5D Isometric RPG**:

- **Bản đồ thế giới mở (3600 × 2400 px):** Nối liền mạch Đại Sảnh Đường với 4 Nhà qua các hành lang đá có mái vòm gothic, tranh sơn dầu biết cử động và đuốc sáng rực rỡ.
- **Tự do di chuyển bằng bàn phím (WASD / Mũi Tên):** Người chơi có thể tự do đi bộ từ Đại Sảnh vào bất kỳ phòng sinh hoạt chung nào mà không cần bấm phím `M`, không có màn hình đen chờ tải hay cửa sổ pop-up cản trở.
- **Đại Sảnh Đường làm chuẩn thiết kế (Standard Benchmark 100%):** Giữ nguyên vẹn 100% tỷ lệ và độ chi tiết nguyên tác của Đại Sảnh Đường (`1376 × 768 px`) với 4 dãy bàn tiệc của 4 Nhà, bàn Ban Giám Hiệu High Table, ngọn lửa Floo và Chiếc Nón Phân Loại.
- **4 Phòng Sinh Hoạt Chung chuẩn nguyên tác (75% Cozy Scale):** Tinh chỉnh kích thước ấm cúng (`1032 × 576 px`) đúng chất ký túc xá học sinh, tạo sự phân cấp không gian rõ rệt và sẵn sàng để client trang trí và tương tác thêm đồ đạc sau này.
- **Hệ thống ánh sáng Chiaroscuro & Phép thuật:** Đàn nến bay lơ lửng dập dềnh (`floating candles`), quầng sáng đuốc bập bùng, ngọn lửa Floo xanh ngọc và đốm lửa bập bùng tại lò sưởi của 4 Nhà.
- **Tính năng học nhóm & làm việc:** Ngồi ghế học bài (`E`), bàn máy tính chia sẻ màn hình (`R`), bảng vẽ nhóm WBO (`Whiteboard`), chat vị trí gần (`Proximity Chat/Video`) và vung đũa vẽ bùa chú ma thuật (`Wand Gesture Spell System`).

---

## 🏰 Kiến Trúc Thế Giới Mở Hub & Spoke (Castle Layout)

Lâu đài Hogwarts được quy hoạch theo mô hình **Hub & Spoke (Trục Trung Tâm & 4 Cánh Lâu Đài)** trên canvas tổng thể `3600 × 2400 px`. Thiết kế này đảm bảo không gian rộng mở, kích thước cân đối và **tuyệt đối không bị đè lấn hình ảnh**:

```
      [ 🦁 THÁP GRYFFINDOR (75%) ]                          [ 🦅 THÁP RAVENCLAW (75%) ]
      (Tông Đỏ Son & Lò Sưởi Đá)                            (Tông Xanh Navy & Tượng Đá)
                  \                                                       /
            Hành lang Tây Bắc                                       Hành lang Đông Bắc
            (Thảm Đỏ Viền Vàng)                                    (Thảm Xanh Viền Bạc)
                    \                                                       /
                     ╠═════════════ [ 🏰 ĐẠI SẢNH ĐƯỜNG (100%) ] ════════════╣
                     ║                 (HUB Trung Tâm Chuẩn)                 ║
                    /                                                       \
            Hành lang Tây Nam                                       Hành lang Đông Nam
            (Thảm Xanh Rắn Bạc)                                    (Thảm Vàng Viền Đen)
                  /                                                       \
      [ 🐍 HẦM SLYTHERIN (75%) ]                            [ 🦡 HẦM HUFFLEPUFF (75%) ]
      (Tông Xanh Lục & Đáy Hồ Đen)                          (Tông Vàng Mật Ong & Gỗ Sồi)
```

1. **HUB Trung Tâm (The Great Hall - 100% Scale: 1376 × 768 px):**
   - Vị trí: Tọa độ gốc `(1112, 816)` trên bản đồ 3600 × 2400.
   - Bố cục nguyên tác với 4 dãy bàn tiệc:
     - 🦡 **Hufflepuff** (Khăn vàng viền đen)
     - 🦅 **Ravenclaw** (Khăn xanh lam viền đồng)
     - 🦁 **Gryffindor** (Khăn đỏ thắm viền vàng)
     - 🐍 **Slytherin** (Khăn xanh lục viền bạc)
   - Bục Ban Giám Hiệu High Table với Cụ Dumbledore, Giáo sư McGonagall và Giáo sư Snape.
   - Chiếc Nón Phân Loại làm lễ phân Nhà cho học sinh mới.

2. **4 Cánh Lâu Đài (4 House Spokes - 75% Scale: 1032 × 576 px):**
   - 🦁 **Tháp Gryffindor (Tây Bắc):** Tọa độ gốc `(140, 140)`, lò sưởi ấm bập bùng, thảm đỏ sư tử, ghế bành nhung ấm áp.
   - 🐍 **Hầm Ngục Slytherin (Tây Nam):** Tọa độ gốc `(140, 1680)`, lò sưởi chạm khắc rắn bạc, ánh xanh ngọc huyền bí nhìn ra đáy Hồ Đen.
   - 🦅 **Tháp Ravenclaw (Đông Bắc):** Tọa độ gốc `(2420, 140)`, trần vòm thiên văn, tượng Rowena Ravenclaw cẩm thạch, giá sách cổ.
   - 🦡 **Tầng Hầm Hufflepuff (Đông Nam):** Tọa độ gốc `(2420, 1680)`, trần vòm gỗ sồi, các chậu thảo dược treo trần, thùng rượu mật ong ấm cúng.

---

## 🏛️ Thiết Kế Hành Lang Đá Hoàng Gia Nghệ Thuật (Artisan Corridors)

Phần hành lang kết nối giữa Đại Sảnh và 4 Nhà đã được thiết kế lại hoàn toàn thông qua bộ sinh map thủ công mỹ thuật (`scripts/build_artisan_hogwarts_world.py`):

1. **Khắc Phục Hoàn Toàn Lỗi Vết Đen (Alpha Transparency Preservation):**
   - Tệp đồ họa `great_hall_25d.png` và các phòng sinh hoạt chung có sẵn kênh Alpha trong suốt ở các góc.
   - Quá trình ghép map bảo toàn nguyên vẹn kênh Alpha của các phòng và phủ lên nền trời sao đêm huyền ảo (`backdrop_night`), xóa bỏ 100% các khối hộp đen bị cắt lấn.
2. **Khắc Phục Lỗi Vết Cắt Bàn Tiệc (Table Overlay Slicing Bug):**
   - Đã loại bỏ các lớp sprite phủ bàn tiệc cũ (`tableOverlays`) gây cắt ngang các dãy bàn trong Đại Sảnh, đảm bảo các dãy bàn tiệc hiển thị liền khối, sắc nét.
3. **Mặt Sàn Lát Đá Hoa Cương Cổ (Natural Flagstone Floor):**
   - Trích xuất từ kết cấu đá tự nhiên 2.5D chân thực (`sample_corridor_floor.png`), đồng điệu 100% với chất liệu sàn của Đại Sảnh Đường.
4. **Lan Can & Tường Đá 3D (3D Stone Parapet Walls):**
   - Tường đá dày dặn với gờ bo viền đá khối (`coping stones`) và chân tường đá xám cổ điển, tạo cảm giác kiến trúc vững chãi.
5. **Thảm Nhung Dệt Viền Vàng 4 Nhà (Velvet Carpet Runners):**
   - Trải thảm nhung theo dọc chiều dài hành lang với màu sắc đại diện cho từng Nhà:
     - Đỏ thắm viền chỉ vàng hoàng gia dẫn về Tháp Gryffindor.
     - Xanh lục bảo viền chỉ bạc ánh trăng dẫn về Hầm Slytherin.
     - Xanh sapphire viền chỉ đồng thiên văn dẫn về Tháp Ravenclaw.
     - Vàng mật ong viền chỉ nhung đen dẫn về Hầm Hufflepuff.
6. **Tranh Sơn Dầu Phù Thủy & Chân Đuốc Chiếu Sáng (Portraits & Torch Sconces):**
   - Bố trí các bức tranh sơn dầu có khung mạ vàng dọc hành lang (`sample_wall_portraits.png`).
   - Các trụ đá gothic được gắn chân đuốc sắt mỹ thuật tỏa quầng sáng ấm áp (`Chiaroscuro lighting halo`), tạo không khí kỳ ảo đúng chuẩn Hogwarts về đêm.
7. **Cổng Vòm Đá Khắc Tên Nhà (Carved Stone Lintel Banners):**
   - Bảng biển hiệu chạm khắc bằng đá chào đón học sinh khi bước qua cửa: `🦁 THÁP GRYFFINDOR`, `🐍 HẦM SLYTHERIN`, `🦅 THÁP RAVENCLAW`, `🦡 TẦNG HẦM HUFFLEPUFF`.

---

## 🧭 Cấu Trúc 5 Khu Vực & Tọa Độ (5 Castle Wings & Coordinates)

Toàn bộ thế giới có kích thước chuẩn **3600 × 2400 px**:

| Khu Vực | Tỷ Lệ | Kích Thước | Tọa Độ Gốc (X, Y) | Tọa Độ Spawn Mặc Định | Bounding Box Nhận Diện | Đặc Điểm Nổi Bật |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **🏰 Đại Sảnh Đường** | **100% (Chuẩn)** | 1376 × 768 | `(1112, 816)` | `(1800, 1450)` | `1350 ≤ X ≤ 2250` | 4 dãy bàn tiệc, High Table, Nón Phân Loại |
| **🦁 Tháp Gryffindor** | **75% (Cozy)** | 1032 × 576 | `(140, 140)` | `(650, 550)` | `X < 1350, Y < 1100` | Cánh Tây Bắc, lò sưởi ấm, thảm đỏ sư tử |
| **🐍 Hầm Ngục Slytherin** | **75% (Cozy)** | 1032 × 576 | `(140, 1680)` | `(650, 2090)` | `X < 1350, Y ≥ 1100` | Cánh Tây Nam, lò sưởi rắn bạc, view Hồ Đen |
| **🦅 Tháp Ravenclaw** | **75% (Cozy)** | 1032 × 576 | `(2420, 140)` | `(2930, 550)` | `X > 2250, Y < 1100` | Cánh Đông Bắc, trần sao, tượng cẩm thạch |
| **🦡 Tầng Hầm Hufflepuff** | **75% (Cozy)** | 1032 × 576 | `(2420, 1680)` | `(2930, 2090)` | `X > 2250, Y ≥ 1100` | Cánh Đông Nam, vòm gỗ sồi, chậu thảo dược |

---

## 📐 Cơ Chế Bản Đồ 2.5D, Tọa Độ & Va Chạm (2.5D Engine & Colliders)

1. **Tấm Nền Đồ Họa Đơn Khối Tích Hợp (Composite Background Plate):**
   - Tệp ảnh: `client/public/assets/map/v2/hogwarts_castle_world.png` (3600 × 2400 px, 3.9 MB).
   - Render ở depth `-1000`, ôm trọn toàn bộ thế giới Hogwarts không vết nứt.
2. **Hệ Thống Va Chạm Thông Minh (Arcade Physics Static Colliders):**
   - Khởi tạo tại `setupWorldColliders()` trong [`RoomDefinitions.ts`](file:///Users/khang/skyoffice-base/client/src/scenes/hogwarts/RoomDefinitions.ts).
   - Chắn các bờ tường chu vi ngoài, bục High Table, lò sưởi và 4 dãy bàn tiệc.
   - **4 hành lang đá nối Đại Sảnh sang 4 Nhà hoàn toàn thông thoáng**, người chơi đi qua lại 100% không bị kẹt hay khựng tường vô hình.
3. **Tự Động Nhận Diện Không Gian (Spatial Room Tracking):**
   - Hàm `getRoomAtPosition(x, y)` tự động tính toán khu vực người chơi đang đứng theo thời gian thực.
   - Khi bước từ Đại Sảnh vào Tháp Gryffindor, giao diện tự động cập nhật banner: `🦁 Tháp Sinh Hoạt Chung Gryffindor` và đồng bộ Nhà hiện tại qua Colyseus Server.
4. **Chiều Sâu Động Y-Sorting (Dynamic Depth):**
   - Mọi thực thể di động (`myPlayer`, `otherPlayer`) và ghế ngồi đều cập nhật depth theo vị trí `y`: `sprite.setDepth(sprite.y)`.

---

## 🪄 Hệ Thống Tương Tác & Phép Thuật (Interactive Systems)

1. **Ngồi Ghế Học Bài (`E`):**
   - Hơn 30 vị trí ghế dọc theo 4 dãy bàn Đại Sảnh và trong phòng sinh hoạt chung của 4 Nhà.
   - Đến gần ghế và bấm `E` để ngồi xuống học bài / hội thoại.
2. **Bàn Máy Tính & Chia Sẻ Màn Hình (`R`):**
   - Kích hoạt tính năng chia sẻ màn hình và làm việc nhóm trực tuyến.
3. **Bảng Vẽ Nhóm WBO (`Whiteboard`):**
   - Tương tác với bảng trắng để mở giao diện vẽ sơ đồ ý tưởng nhóm theo thời gian thực.
4. **Nghi Thức Nón Phân Loại (`T`):**
   - Đến gần Chiếc Nón Phân Loại ở giữa Đại Sảnh và bấm `T` để tham gia trả lời câu hỏi và được phân vào Nhà phù hợp.
5. **Vung Đũa Vẽ Cử Chỉ Phép Thuật (Wand Gesture Drawing System):**
   - Nhấp chuột trái để hiện đốm sáng; giữ và kéo chuột trái trên bản đồ để vẽ bùa, rồi thả để thi triển. Bấm `B` để xem mẫu nét vẽ:
     - 🌟 **LUMOS:** Vẽ vòng tròn khép kín — Thắp sáng đầu đũa phép, xua tan màn đêm.
     - 🔥 **INCENDIO:** Vẽ hình tam giác nhọn hướng lên — Phun ngọn lửa ma thuật bùng cháy.
     - 🛡️ **PROTEGO:** Vẽ vòng cung bán nguyệt che chở — Tạo khiên chắn phản đòn bảo vệ.
     - ⚡ **EXPELLIARMUS:** Vẽ đường zic-zac tia chớp — Bùa giải giới phóng tia sáng đỏ.
     - 🪶 **WINGARDIUM LEVIOSA:** Vẽ chữ V lượn sóng — Bùa bay lơ lửng với hạt bụi lấp lánh.
     - 🦌 **EXPECTO PATRONUM:** Vẽ vòng xoáy trôn ốc — Triệu hồi Thần Hộ Mệnh bạc tỏa sáng.
6. **Mạng Lưới Lò Sưởi Floo & Bản Đồ Đạo Tặc (`M` hoặc `F`):**
   - Bấm phím `M` để mở Bản Đồ Đạo Tặc, bấm chọn khu vực bất kỳ để dịch chuyển nhanh bằng bột Floo.

---

## 🏆 Hệ Thống Điểm Nhà & Bảng Vinh Danh (House Points & Galleons)

Hệ thống ghi nhận điểm thưởng và phân phát Galleons hàng tuần cho học sinh:

1. **Ghi Nhận Điểm Nhà Bảo Mật (Secure House Point Awards):**
   - Xác thực qua Firebase ID Token và kiểm tra danh sách `HOUSE_POINT_GRANTOR_UIDS` từ máy chủ.
   - Ghi nhật ký sự kiện bất biến (`house_point_events`) và tổng hợp điểm tuần vào Firestore.
2. **Chốt Sổ & Trao Thưởng Galleons Hàng Tuần:**
   - Server job tự động lưu snapshot danh sách thành viên hợp lệ từ `shout_users`.
   - Nhà chiến thắng trong tuần sẽ được trao thưởng số lượng Galleon cấu hình qua `WEEKLY_GALLEON_REWARD_PER_MEMBER` trực tiếp vào ví `galleon_wallets`.

---

## 🕹️ Cổng Mini Game Multiplayer

Nút 🎮 tại thanh công cụ dưới màn hình mở cổng kết nối tới các trò chơi đồng đội:

- **Bảy Potter (Seven Potters):** Chế độ bay phối hợp cùng đồng đội để thoát khỏi sự truy đuổi của Tử thần Thực tử (Chạy tại port 3000).
- **Undercover Hogwarts:** Trò chơi suy luận xã hội tìm kiếm kẻ ẩn danh nội gián trong lâu đài (Chạy tại port 5175).
- **Tính Năng Đồng Bộ Phòng:**
  - Tự động truyền tham số `skyofficePlayer`, `skyofficeName`, `skyofficeHouse`, và mã `room`.
  - Cho phép gửi lời mời toàn phòng qua chat, sẵn sàng phòng đấu và đồng bộ điểm Nhà sau trận đấu.

---

## 🧑‍🤝‍🧑 Bạn Bè, Biểu Cảm & Sự Kiện (Social Hub & Proximity Media)

- **Đàm Thoại Khoảng Cách Gần (Proximity Video/Audio via PeerJS):** Tự động kết nối WebRTC âm thanh và hình ảnh khi các nhân vật tiến lại gần nhau trong phạm vi lâu đài.
- **Hồ Sơ Phù Thủy Cá Nhân:** Hiển thị tên, Nhà được phân loại, danh hiệu, cấp bậc và trạng thái trực tuyến.
- **Biểu Cảm Thời Gian Thực (Emotes):** Vẫy tay chào (`H`), vỗ tay, thả tim, cười, tung hoa và thi triển phép thuật vui nhộn.
- **Bảng Sự Kiện Trường Học:** Đăng ký tham gia các buổi học nhóm, câu lạc bộ đấu pháp thuật và kỳ thi O.W.L.

---

## 🎮 Phím Tắt Điều Khiển (Keyboard & Mouse Controls)

| Phím / Thao Tác | Hành Động | Phạm Vi & Ghi Chú |
| :--- | :--- | :--- |
| `W`, `A`, `S`, `D` hoặc `Mũi Tên` | **Di chuyển nhân vật** | Tự do đi bộ xuyên suốt giữa Đại Sảnh và 4 Nhà |
| **Cần Điều Khiển Ảo (Joystick)** | **Di chuyển trên mobile/chuột** | Cần điều khiển góc dưới bên trái, hỗ trợ chạm cảm ứng hoặc kéo chuột |
| `E` | **Ngồi xuống ghế** | Hơn 30 ghế quanh các bàn ăn và phòng sinh hoạt |
| `R` | **Mở máy tính** | Kích hoạt chia sẻ màn hình học nhóm |
| `T` | **Đội Nón Phân Loại** | Kích hoạt nghi lễ phân Nhà tại bục Đại Sảnh |
| `M` | **Mở Bản Đồ Đạo Tặc** | Xem toàn cảnh lâu đài và dịch chuyển tức thời |
| `F` | **Mở Mạng Lưới Floo** | Dịch chuyển nhanh bằng bột Floo qua lò sưởi |
| `B` | **Sách Thần Chú & Cử Chỉ** | Xem mẫu vẽ cử chỉ ma thuật và danh mục phép thuật |
| `L` | **Thả Thiên Đăng Ước Nguyện** | Viết lời chúc và thả đèn lồng bay lên trời đêm Trung Thu |
| `N` | **Bật / Tắt Nhạc Nền (BGM)** | Bật hoặc tắt giai điệu nhạc nền Trung Thu & Hogwarts |
| `H` | **Vẫy tay chào** | Gửi biểu cảm nhanh tới các phù thủy xung quanh |
| `Enter` | **Mở khung Chat** | Gửi tin nhắn văn bản toàn sảnh hoặc nội bộ Nhà |
| `ESC` | **Đóng bảng / Thoát** | Đóng modal đang mở hoặc thoát chế độ ngồi |
| **Giữ Chuột Trái + Rê Vẽ** | **Vung đũa vẽ bùa chú** | Nhận diện cử chỉ bùa chú (Lumos, Incendio, Protego...) |

---

## 🛠 Kiến Trúc Kỹ Thuật & Công Nghệ (Tech Stack)

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT                            │
│  React 18 + Redux Toolkit (UI / Chat / Modals / Map)   │
│  Phaser 3 (Game Engine, 2.5D Renderer, Arcade Physics) │
│  HogwartsRoomManager (World State, Lighting, Tracking) │
│  WandSpellSystem (Gesture Recognition, Spells FX)      │
│  PeerJS (WebRTC Audio / Video / Screen Sharing)        │
└───────────────────────────▲────────────────────────────┘
                            │ WebSocket (Colyseus Protocol)
┌───────────────────────────▼────────────────────────────┐
│                      SERVER                            │
│  Node.js + Express + TypeScript                        │
│  Colyseus Framework (Multiplayer Room / State Sync)    │
│  Room Switching & Spatial House Synchronization        │
│  Firebase Admin SDK (House Points, Weekly Galleons)    │
│  Port: 2567                                            │
└────────────────────────────────────────────────────────┘
```

- **Frontend Client:** [Phaser 3.55+](https://phaser.io/) + [React 18](https://react.dev/) + [Redux Toolkit](https://redux-toolkit.js.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/).
- **Backend Multiplayer:** [Colyseus Framework](https://colyseus.io/) (Đồng bộ vị trí nhân vật, phòng học, ghế ngồi, vật phẩm).
- **Proximity Media:** [PeerJS](https://peerjs.com/) (P2P WebRTC Proximity Video/Audio theo cự ly gần).
- **Database & Cloud:** [Firebase Firestore](https://firebase.google.com/) (Lưu trữ hồ sơ học sinh, điểm Nhà và lịch sử trao giải).
- **Code Quality:** Tất cả các module code tuân thủ nghiêm ngặt nguyên tắc chia tách submodule (dưới 500 dòng/file).

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```bash
skyoffice-base/
├── README.md                                # Tài liệu kiến trúc toàn diện (file này)
├── package.json                             # Dependencies backend Colyseus
├── tsconfig.json                            # TypeScript configuration server
│
├── scripts/                                 # Bộ công cụ Python sinh & xử lý map 2.5D
│   ├── build_artisan_hogwarts_world.py      # ⭐ Script chính sinh map liên hoàn 3600x2400
│   ├── sample_corridor_floor.png            # Texture mẫu sàn đá hoa cương cổ
│   └── sample_wall_portraits.png            # Texture mẫu tranh sơn dầu phù thủy
│
├── server/                                  # BACKEND (Colyseus WebSocket Server)
│   ├── index.ts                             # Entry point server (port 2567)
│   ├── housePoints.ts                       # API trao Điểm Nhà và giải thưởng Galleons
│   └── rooms/
│       ├── SkyOffice.ts                     # Logic phòng, đổi phòng & đồng bộ người chơi
│       ├── commands/                        # Colyseus state mutation commands
│       └── schema/                          # State schema (Player, OfficeState, ChatMessage)
│
└── client/                                  # FRONTEND (Game Phaser 3 + React UI)
    ├── package.json                         # Dependencies client
    ├── vite.config.ts                       # Cấu hình Vite dev / production build
    ├── public/
    │   └── assets/                          # Tài nguyên đồ họa và âm thanh
    │       ├── map/
    │       │   ├── v2/
    │       │   │   ├── hogwarts_castle_world.png      # ⭐ Bản đồ liên hoàn thế giới mở (3600x2400)
    │       │   │   ├── great_hall_25d.png             # Bản đồ Đại Sảnh Đường gốc (1376x768)
    │       │   │   ├── gryffindor_common_room_25d.png # Phòng sinh hoạt Gryffindor
    │       │   │   ├── slytherin_common_room_25d.png  # Phòng sinh hoạt Slytherin
    │       │   │   ├── ravenclaw_common_room_25d.png  # Phòng sinh hoạt Ravenclaw
    │       │   │   └── hufflepuff_common_room_25d.png # Phòng sinh hoạt Hufflepuff
    │       │   └── FloorAndGround.png                 # Tileset đá và tường thành cổ
    │       ├── character/                             # Spritesheet nhân vật khăn choàng 4 Nhà
    │       └── npc/                                   # Spritesheet các giáo sư và học sinh
    │
    └── src/
        ├── scenes/
        │   ├── Bootstrap.ts                 # Preload toàn bộ assets, nạp texture thế giới
        │   ├── Game.ts                      # Scene chính: camera follow, controls, player spawn
        │   ├── HogwartsRoomManager.ts       # ⭐ Quản lý bản đồ 3600x2400, ánh sáng, định tuyến
        │   ├── WandSpellSystem.ts           # Hệ thống vẽ cử chỉ vung đũa phép (Gesture FX)
        │   └── hogwarts/
        │       ├── RoomDefinitions.ts       # ⭐ Tọa độ 5 khu vực, colliders, ghế ngồi
        │       └── HogwartsLightingEffects.ts# Đàn nến bay và ánh sáng Chiaroscuro
        └── components/
            ├── MaraudersMap.tsx             # Bản Đồ Đạo Tặc dịch chuyển tức thời
            ├── MiniGamesDialog.tsx          # Cổng mini game Bảy Potter & Undercover
            ├── SocialHubDialog.tsx          # Hồ sơ người chơi, biểu cảm và sự kiện
            ├── SortingCeremony.tsx          # Nghi lễ phân Nhà Chiếc Nón Phân Loại
            └── SpellbookModal.tsx           # Sách hướng dẫn bùa chú ma thuật
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart & Setup)

### 1. Yêu Cầu Tiên Quyết (Prerequisites)
- [Node.js](https://nodejs.org/) phiên bản **18.x trở lên**.
- Trình quản lý gói `npm` (hoặc `yarn`).
- Python 3.9+ cùng thư viện `Pillow` và `numpy` (nếu muốn chạy lại script tạo bản đồ).

### 2. Khởi Chạy Hệ Thống

Mở 2 cửa sổ terminal:

#### Cửa sổ 1: Server (Colyseus)
```bash
cd /Users/khang/skyoffice-base
npm install
npm start
```
> Server khởi chạy tại: `http://localhost:2567` (WebSocket: `ws://localhost:2567`).

#### Cửa sổ 2: Client (Vite Dev Server)
```bash
cd /Users/khang/skyoffice-base/client
npm install
npm run dev
```
> Client khởi chạy tại: `http://localhost:5173`. Truy cập trình duyệt để tham gia vào lâu đài!

### 3. Build Kiểm Tra Lỗi & Đóng Gói (Production Build)
```bash
cd /Users/khang/skyoffice-base/client
npm run build
```

---

## 🎨 Quy Trình Tái Tạo Bản Đồ (Map Generation Workflow)

Khi cần tùy biến hoặc trang trí thêm đồ đạc cho các phòng sinh hoạt chung hay thay đổi hoa văn hành lang:

1. Chỉnh sửa tham số hoặc bổ sung hình ảnh trong script:
   ```bash
   python3 scripts/build_artisan_hogwarts_world.py
   ```
2. Script sẽ tự động:
   - Tải nền đêm trời sao `backdrop_night.png`.
   - Tạo 4 hành lang đá hoàng gia nghệ thuật có thảm nhung viền vàng, tranh sơn dầu và đuốc sáng.
   - Ghép Đại Sảnh Đường chuẩn 100% tại tọa độ trung tâm `(1112, 816)`.
   - Ghép 4 phòng sinh hoạt chung 75% scale tại 4 góc cánh lâu đài, bảo toàn kênh Alpha trong suốt.
   - Xuất tệp đồ họa tối ưu về `client/public/assets/map/v2/hogwarts_castle_world.png`.
3. Trình duyệt đang bật Vite sẽ tự động hot-reload bản đồ mới ngay tức khắc.

---

## 🌐 Triển Khai Production (Deployment Guide)

Frontend và multiplayer server được triển khai tách biệt. Vercel phục vụ giao diện tĩnh; Render chạy Node.js/Colyseus theo cấu hình trong `render.yaml`.

### 1. Kiến Trúc Triển Khai (Cloud Architecture)
- **Frontend Web (Vercel CDN):**
  - **Live URL:** [https://hpvn-social.vercel.app](https://hpvn-social.vercel.app)
  - **Cấu hình:** File `vercel.json` định tuyến SPA, tối ưu cache asset và rewrite các API liên quan.
  - **Tự động deploy:** Mỗi khi push code lên nhánh `hpvn-social` trên GitHub, Vercel sẽ tự động build và cập nhật phiên bản mới nhất.
- **Backend Multiplayer Server (Render Cloud):**
  - **Primary URL:** [https://skyoffice-server-m7o7.onrender.com](https://skyoffice-server-m7o7.onrender.com)
  - **WebSocket Endpoint:** `wss://skyoffice-server-m7o7.onrender.com`
  - **Cấu hình:** File `render.yaml` (Render Blueprint), Node Web Service gói **Free** tại khu vực Singapore.
  - **Health Check:** `https://skyoffice-server-m7o7.onrender.com/health` (trả về `{"status":"ok","service":"skyoffice"}`).
  - **Endpoint phía client:** `VITE_SERVER_URL` ghi đè URL mặc định; khi chạy local, mặc định là `ws://localhost:2567`.
  - **Lưu ý cấu hình production:** Kiểm tra bundle Vercel ngày 2026-09-25 cho thấy `VITE_SERVER_URL` đang được build thành `wss://scholarships-rev-active-byte.trycloudflare.com`, dù `client/.env.production` trỏ tới Render. Vì vậy bản Vercel hiện tại vẫn phụ thuộc vào Cloudflare Tunnel/máy đang chạy tunnel; Render đang phản hồi health check nhưng chưa phải endpoint trong bundle production. Muốn tắt máy cá nhân, đổi biến `VITE_SERVER_URL` trong Vercel Production thành URL Render ở trên rồi deploy lại.

### 2. Giới Hạn Cần Biết
- **Không phụ thuộc máy cá nhân:** Client production kết nối đến server Render; tắt máy phát triển không làm server trên Render dừng.
- **Render Free không đảm bảo chạy liên tục:** Service ngủ sau 15 phút không nhận traffic vào server. Khi request hoặc kết nối WebSocket mới đánh thức service, cold start có thể mất khoảng một phút. Render cũng có thể khởi động lại instance.
- **Kết nối có thể bị ngắt:** Sau deploy, restart hoặc sự cố mạng, client cần kết nối lại. Trạng thái phòng Colyseus đang lưu trong bộ nhớ server, nên người chơi có thể phải vào lại và vị trí sẽ về spawn mặc định.
- **Dữ liệu bền vững:** Firebase Firestore chỉ lưu các dữ liệu được ghi rõ ràng như hồ sơ, điểm Nhà và lịch sử trao thưởng; trạng thái phòng/vị trí nhân vật hiện không được lưu vào Firestore.
- **Muốn server luôn sẵn sàng:** Dùng compute plan không sleep (có phí) hoặc chuyển Colyseus lên một máy chủ cloud luôn chạy. Render Free phù hợp thử nghiệm/hobby hơn là cam kết uptime 24/7.

---

*Hogwarts Open World Castle Virtual Office Project — Được xây dựng với niềm đam mê ma thuật và công nghệ hiện đại.* ⚡🧙‍♀️
