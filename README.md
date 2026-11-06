# XRegion-EC2 — Cloud Management & Cross-Region Migration Control Plane

> **Dự án Quản trị Điện toán Đám mây & Điều phối Di trú Máy ảo Đa Vùng**  
> Xây dựng trên nền tảng **Nuxt 4**, **Vue 3**, **TypeScript**, **AWS Serverless** và **OpenStack**, tuân thủ nghiêm ngặt phương pháp phát triển **Mock-First Architecture** và quy chuẩn vận hành **AI Agent-driven Development**.

---

## 📌 Mục lục

1. [Giới thiệu tổng quan về dự án](#1-giới-thiệu-tổng-quan-về-dự-án)
2. [Cấu trúc Monorepo](#2-cấu-trúc-monorepo)
3. [Hướng dẫn sử dụng cấu trúc `plan/`](#3-hướng-dẫn-sử-dụng-cấu-trúc-plan)
4. [Hướng dẫn sử dụng cấu trúc Agent (`AGENTS.md` & `.agents/`)](#4-hướng-dẫn-sử-dụng-cấu-trúc-agent-agentsmd--agents)
5. [Hướng dẫn sử dụng cấu trúc Memory (`memory/`)](#5-hướng-dẫn-sử-dụng-cấu-trúc-memory-memory)
6. [Hướng dẫn cài đặt & Cách chạy Frontend Dashboard](#6-hướng-dẫn-cài-đặt--cách-chạy-frontend-dashboard)
7. [Các lệnh kiểm tra chất lượng mã nguồn (Quality Gates)](#7-các-lệnh-kiểm-tra-chất-lượng-mã-nguồn-quality-gates)
8. [Tiến độ hiện tại của dự án](#8-tiến-độ-hiện-tại-của-dự-án)

---

## 1. Giới thiệu tổng quan về dự án

### 1.1. Bối cảnh & Mục tiêu

**XRegion-EC2** là một hệ thống bảng điều khiển (Control Plane Dashboard) quản trị hạ tầng điện toán đám mây theo chuẩn IaaS (tương tự trải nghiệm AWS EC2), với tính năng trọng tâm và khác biệt là **Di trú máy ảo xuyên vùng (Cross-Region VM Migration)** giữa hai vùng địa lý độc lập:
- **Region A**: Singapore (`ap-southeast-1`)
- **Region B**: N. Virginia (`us-east-1`)

Hệ thống cho phép các kỹ sư DevOps / Quản trị viên hệ thống có thể di chuyển khối lượng công việc máy ảo, sao chép dữ liệu lưu trữ (Snapshot Replication), tự động chuyển hướng tên miền (DNS Cutover với AWS Route 53) và tự động khôi phục về trạng thái an toàn (**Auto-Rollback**) nếu xảy ra sự cố trong quá trình di trú.

### 1.2. Các tính năng cốt lõi

- **Quản lý vòng đời Instance (Compute)**: Khởi tạo, theo dõi danh sách, chi tiết cấu hình phần cứng (vCPU, RAM, IP), thao tác bật/tắt (Start/Stop), khởi động lại (Restart), xoá máy ảo (Terminate).
- **Quản lý Lưu trữ & Snapshot (Storage)**: Danh mục hệ điều hành chuẩn (Ubuntu, Debian, CirrOS), tạo bản chụp ổ đĩa tức thời (Snapshot) từ máy ảo đang chạy, sao chép Snapshot 2 chiều xuyên vùng (Cross-region snapshot replication).
- **Kịch bản di trú (Migration Scenarios)**: Định nghĩa chiến lược di trú (Manual trigger hoặc lập lịch tự động thông qua EventBridge Scheduler).
- **Động cơ di trú & Tự động Rollback (Migration Engine)**: Quy trình di trú 8 bước rõ ràng: `PRE_CHECK` ➔ `STOP_SOURCE` ➔ `CREATE_SNAPSHOT` ➔ `COPY_SNAPSHOT` ➔ `CREATE_VOLUME` ➔ `RESTORE_DESTINATION` ➔ `HEALTH_CHECK` ➔ `SWITCH_DNS` ➔ `COMPLETE`. Tự động khôi phục trạng thái nguồn nếu bất kỳ bước nào thất bại.
- **Quan sát & Nhật ký (Observability)**: Giám sát chỉ số tài nguyên, độ trễ mạng giữa hai region, ghi log cấu trúc chuẩn JSON (`structured logging`).

### 1.3. Kiến trúc hệ thống (High-Level Architecture)

Toàn bộ hệ thống tuân thủ nguyên tắc **phân lớp (Layered Architecture)** và **Mock-First**: Frontend **tuyệt đối không** gọi trực tiếp vào Cloud SDK (AWS / OpenStack) mà đi qua tầng API Control Plane thống nhất.

```text
                        ADMINISTRATOR
                              │
                              ▼
                    ┌──────────────────┐
                    │  Nuxt Dashboard  │
                    │   (EC2 + Nginx)  │
                    └─────────┬────────┘
                              │ HTTPS / JSON API
                              ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    └─────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  Auth Service         Compute Service       Migration Service
  (Lambda/Keystone)   (Lambda/OpenStack)     (Lambda/DynamoDB)
                                                    │
                                           ┌────────┴────────┐
                                           ▼                 ▼
                                      AWS Route 53     CloudWatch / EBS
```

---

## 2. Cấu trúc Monorepo

Dự án được tổ chức dưới dạng monorepo sử dụng **pnpm workspaces**:

```text
Xregion-EC2/
├── .agents/                 # Quy tắc và kỹ năng dành riêng cho AI Coding Agents
│   ├── rules/               # Quy tắc chuyên biệt: frontend, backend, cloud-safety
│   └── skills/              # Quy trình tác vụ mẫu: implement-frontend-page, implement-api,...
├── apps/
│   └── dashboard/           # Ứng dụng Frontend chính (Nuxt 4 + Nuxt UI + Pinia)
├── backend/                 # Backend domain services, repositories, provider abstractions & mock state
│   ├── services/            # auth, compute, storage, migration,...
│   ├── shared/              # providers (MockCompute, MockSnapshot,...), errors, logging
│   └── tests/               # Toàn bộ test suite Vitest
├── packages/
│   └── contracts/           # Shared TypeScript interfaces, API schemas, Enums, Models
├── memory/                  # Tài liệu ghi nhớ tiến độ, báo cáo hoàn thành từng Phase
├── plan/                    # Nguồn sự thật (Source of Truth) cho kiến trúc và đặc tả 10 Phase
├── AGENTS.md                # Quy định tối thượng cho AI Coding Agent
├── ANTIGRAVITY_SETUP.md     # Hướng dẫn thiết lập môi trường cho Antigravity IDE / Gemini
├── package.json             # Root scripts điều phối monorepo
├── pnpm-workspace.yaml      # Cấu hình workspace
└── README.md                # Tài liệu hướng dẫn này
```

---

## 3. Hướng dẫn sử dụng cấu trúc `plan/`

Thư mục `plan/` là **Single Source of Truth (nguồn chân lý thiết kế)** của dự án. Tất cả lập trình viên và AI Agent **bắt buộc** phải tuân thủ và tham chiếu thư mục này trước khi viết mã nguồn.

### 3.1. Trình tự đọc tài liệu kỹ thuật chuẩn

Khi bắt đầu làm quen với dự án hoặc giao nhiệm vụ cho AI, hãy đọc các tài liệu theo thứ tự:

1. `plan/00_START_HERE.md`: Mục tiêu dự án, tech stack, triết lý Mock-first.
2. `plan/01_PROJECT_ARCHITECTURE.md`: Kiến trúc phân tầng, chi tiết luồng di trú 8 bước, cơ chế Rollback.
3. `plan/02_REPOSITORY_STRUCTURE.md`: Sắp xếp monorepo, vị trí mã nguồn dashboard, backend và contracts.
4. `plan/03_CODING_RULES.md`: 11 nguyên tắc viết mã nghiêm ngặt (TypeScript strict, cấm `any`, cấm logic cloud trên UI).
5. `plan/04_UI_UX_SPEC.md`: Quy chuẩn giao diện tối (Dark mode), layout sidebar, bảng dữ liệu, modal xác nhận.
6. `plan/05_API_CONTRACT.md`: Chuẩn định dạng RESTful API JSON envelope (`{ success, data, error, meta }`).
7. `plan/06_DATA_MODELS.md`: Định nghĩa thực thể dữ liệu (`Instance`, `Snapshot`, `MigrationScenario`, `MigrationJob`).
8. Các tài liệu Phase tương ứng với nhiệm vụ hiện tại (từ `07_PHASE_0_...` đến `17_PHASE_10_...`).

### 3.2. Lộ trình 10 Phase triển khai

| Phase | Tên giai đoạn | Mục tiêu chính | Trạng thái |
|:---:|:---|:---|:---:|
| **0** | `07_PHASE_0_PROJECT_INITIALIZATION.md` | Khởi tạo monorepo, contracts, backend mock providers, dashboard skeleton | ✅ Hoàn thành |
| **1** | `08_PHASE_1_APP_SHELL_AND_MOCKS.md` | Xây dựng App Shell, Design System Nuxt UI, Nitro mock API, Overview page | ✅ Hoàn thành |
| **2** | `09_PHASE_2_INSTANCES.md` | Quản trị vòng đời VM: List, Create, Detail, Start, Stop, Restart, Terminate | ✅ Hoàn thành |
| **3** | `10_PHASE_3_STORAGE_SNAPSHOTS.md` | Quản lý Storage: Image catalog, Snapshot management, Cross-region replication | ✅ Hoàn thành |
| **4** | `11_PHASE_4_MIGRATION_SCENARIOS.md` | Thiết lập kịch bản di trú (Manual / Scheduled) và form tham số | ⏳ Tiếp theo |
| **5** | `12_PHASE_5_MIGRATION_ENGINE.md` | Động cơ điều phối di trú đa bước, Polling tiến độ, Auto-Rollback | ⏳ Kế tiếp |
| **6** | `13_PHASE_6_OBSERVABILITY_NETWORK.md` | Giám sát chỉ số tài nguyên, biểu đồ trễ mạng, Route 53 DNS switcher | ⏳ Chưa bắt đầu |
| **7** | `14_PHASE_7_REAL_INFRA_INTEGRATION.md` | Tích hợp AWS SDK và OpenStack API thật sau lớp Provider Interface | ⏳ Chưa bắt đầu |
| **8** | `15_PHASE_8_AUTH_SECURITY.md` | Xác thực người dùng, bảo mật API Gateway và OpenStack Keystone | ⏳ Chưa bắt đầu |
| **9** | `16_PHASE_9_TESTING.md` | Kiểm thử E2E kịch bản di trú, Chaos test, phục hồi lỗi | ⏳ Chưa bắt đầu |
| **10** | `17_PHASE_10_DEPLOYMENT.md` | Triển khai Dashboard lên EC2 (Ubuntu + Nginx + HTTPS) & Lambda CI/CD | ⏳ Chưa bắt đầu |

> **Quy tắc Phase Control**: Tuyệt đối không nhảy cóc hoặc yêu cầu Agent thực hiện nhiều Phase cùng lúc trong một phiên làm việc. Luôn nghiệm thu Definition of Done (DoD) của Phase hiện tại trước khi chuyển sang Phase tiếp theo.

---

## 4. Hướng dẫn sử dụng cấu trúc Agent (`AGENTS.md` & `.agents/`)

Hệ thống được thiết kế tối ưu cho các mô hình AI Coding Agent (Antigravity, Gemini, Claude, Cursor) làm việc có kiểm soát và an toàn tuyệt đối.

### 4.1. Thứ bậc ưu tiên (Source of Truth Precedence)

Khi có bất kỳ xung đột nào về mặt yêu cầu, Agent phải tuân thủ thứ bậc sau:

```text
Yêu cầu trực tiếp của con người (Human Instruction)
                     ↓
                 AGENTS.md
                     ↓
                   plan/
                     ↓
               .agents/rules/
                     ↓
              .agents/skills/
                     ↓
            Quy ước mã nguồn hiện có
```

### 4.2. Quy tắc chuyên biệt trong `.agents/rules/`

- **`frontend.md`**:
  - Luồng dữ liệu chuẩn: `Page/Component ➔ Composable/Store ➔ useApi() ➔ XRegion Backend`.
  - Cấm nhập AWS SDK hoặc OpenStack SDK vào mã nguồn Vue/Nuxt.
  - Sử dụng Pinia **chỉ** cho trạng thái toàn cục dùng chung (`auth`, `app`); dữ liệu theo trang dùng `useAsyncData` hoặc composable riêng.
- **`backend.md`**:
  - Handlers phải mỏng (Thin Handlers), nghiệp vụ nằm trong Service, kết nối tài nguyên nằm sau Provider Interface.
  - Mã lỗi trả về phải thống nhất và có cấu trúc (ví dụ: `INSTANCE_NOT_FOUND`, `SNAPSHOT_BUSY`).
- **`cloud-safety.md` (Cực kỳ quan trọng)**:
  - Cấm tự ý tạo, sửa, xóa hoặc thay đổi hạ tầng đám mây thật (AWS / OpenStack) mà không có sự đồng ý tường minh từ con người.
  - Giữ chế độ `XREGION_PROVIDER_MODE=mock` làm chế độ an toàn mặc định cho việc phát triển và chấm điểm demo.

### 4.3. Các Kỹ năng tái sử dụng trong `.agents/skills/`

Các file `SKILL.md` đóng vai trò là quy trình từng bước chuẩn mực:
- **`implement-frontend-page`**: Quy trình xây dựng màn hình Nuxt UI chuẩn (xác định route, contracts, composable, giao diện loading/empty/error state).
- **`implement-api`**: Quy trình mở endpoint API Nitro / Lambda (request validation, service layer, provider call, response envelope).
- **`review-code`**: Bảng kiểm tra chất lượng mã (kiến trúc, bảo mật, type-safety, không hardcode secret).
- **`verify-project`**: Quy trình tự động chạy toàn bộ các cổng kiểm tra (linter, typecheck, vitest).
- **`deploy-xregion`**: Kế hoạch triển khai an toàn lên AWS EC2 và Lambda.

### 4.4. Mẫu báo cáo hoàn thành của Agent (Bắt buộc)

Sau khi hoàn thành mỗi nhiệm vụ, Agent phải xuất báo cáo theo cấu trúc 7 phần:
1. **Files created**: Danh sách file mới.
2. **Files modified**: Danh sách file chỉnh sửa.
3. **Architecture decisions**: Quyết định thiết kế đã chọn.
4. **Commands executed**: Các lệnh terminal đã chạy.
5. **Quality results**: Kết quả lint, typecheck, test, build.
6. **Assumptions**: Các giả định kỹ thuật được áp dụng.
7. **Remaining TODOs**: Các hạng mục tồn đọng cho Phase tiếp theo.

---

## 5. Hướng dẫn sử dụng cấu trúc Memory (`memory/`)

Thư mục `memory/` là **bộ nhớ dài hạn (Project Memory & History)** của dự án, nhằm giải quyết bài toán mất ngữ cảnh khi làm việc qua nhiều phiên hoặc khi nhiều thành viên/Agent cùng tham gia dự án.

### 5.1. Vai trò của `memory/`

- **Lưu giữ lịch sử hoàn thành**: Mỗi khi một Phase hoàn tất, một bản báo cáo đầy đủ (`PHASE_X_COMPLETION_REPORT.md`) được lưu trữ tại đây.
- **Theo dõi quyết định kiến trúc**: Ghi nhận các quyết định thiết kế dữ liệu, giải pháp xử lý bất đồng bộ, cách tổ chức state mock.
- **Tiếp quản liền mạch**: Khi bắt đầu một phiên làm việc mới, Agent hoặc lập trình viên chỉ cần đọc file báo cáo hoàn thành của phase trước đó để nắm bắt chính xác hiện trạng hệ thống mà không cần đọc lại toàn bộ code.

### 5.2. Các báo cáo hiện có

- [`memory/PHASE_0_COMPLETION_REPORT.md`](./memory/PHASE_0_COMPLETION_REPORT.md): Khởi tạo nền tảng monorepo, cấu trúc contracts và backend provider abstractions.
- [`memory/PHASE_1_COMPLETION_REPORT.md`](./memory/PHASE_1_COMPLETION_REPORT.md): Hoàn thành giao diện Dark Design System, App Shell, Mock Nitro API và trang Dashboard Overview.
- [`memory/PHASE_2_COMPLETION_REPORT.md`](./memory/PHASE_2_COMPLETION_REPORT.md): Hoàn thành phân hệ quản lý máy ảo (Instances Management), form tạo máy ảo, bảng điều khiển trạng thái và 30 unit tests.
- [`memory/PHASE_3_COMPLETION_REPORT.md`](./memory/PHASE_3_COMPLETION_REPORT.md): Hoàn thành phân hệ lưu trữ (Storage), danh mục OS Images, chụp Snapshot máy ảo và sao chép Snapshot xuyên vùng.

### 5.3. Quy trình cập nhật `memory/` sau mỗi Phase

Khi hoàn thành một Phase mới (ví dụ Phase 4):
1. Tạo file mới: `memory/PHASE_4_COMPLETION_REPORT.md`.
2. Nội dung gồm: Tóm tắt mục tiêu, phạm vi bao gồm/loại trừ, sơ đồ luồng kiến trúc, danh sách file mới/sửa, kết quả chạy tests và các điểm cần lưu ý cho Phase tiếp theo.
3. Cập nhật bảng chỉ mục tại `memory/README.md`.

---

## 6. Hướng dẫn cài đặt & Cách chạy Frontend Dashboard

Ứng dụng Frontend Dashboard được đặt tại thư mục `apps/dashboard`, được xây dựng với Nuxt 4 và chạy ở chế độ **Mock-First** (tích hợp sẵn Nitro Server Mock API, không phụ thuộc vào hạ tầng cloud thật khi đang phát triển).

### 6.1. Yêu cầu môi trường (Prerequisites)

- **Node.js**: Phiên bản `v20.x` LTS trở lên (khuyến nghị Node 20 hoặc Node 22).
- **Trình quản lý gói**: `pnpm` phiên bản `9.x` hoặc `10.x` / `12.x`.
  - Cài đặt pnpm nếu chưa có: `npm install -g pnpm`

### 6.2. Cài đặt Dependencies

Tại thư mục gốc của dự án (`Xregion-EC2`), chạy lệnh sau để cài đặt toàn bộ phụ thuộc cho tất cả packages trong monorepo:

```bash
pnpm install
```

### 6.3. Cấu hình biến môi trường

1. Sao chép file cấu hình mẫu `.env.example` thành `.env` tại thư mục gốc:

```bash
cp .env.example .env
```

2. Các biến môi trường mặc định phục vụ chạy cục bộ (Local Development & Mock Mode):

```ini
# Base URL cho API (mặc định trỏ về Nitro Mock Server nội bộ của Nuxt Dashboard)
NUXT_PUBLIC_API_BASE_URL=/api/v1

# Hai region mục tiêu trong kịch bản di trú
AWS_REGION_A=ap-southeast-1
AWS_REGION_B=us-east-1

# Bật chế độ mock-first (an toàn, không gọi cloud thật)
APP_ENV=development
XREGION_PROVIDER_MODE=mock
```

### 6.4. Chạy Frontend ở chế độ Development

Bạn có thể khởi động Frontend Dashboard bằng **một trong hai cách** sau:

#### Cách 1: Chạy từ thư mục gốc (Khuyến nghị)

```bash
pnpm dev
```

*(Lệnh này tự động gọi `pnpm --filter @xregion/dashboard dev`)*

#### Cách 2: Chạy trực tiếp từ thư mục `apps/dashboard`

```bash
cd apps/dashboard
pnpm dev
```

Sau khi máy chủ khởi động thành công, mở trình duyệt và truy cập:

👉 **`http://localhost:3000`**

### 6.5. Trải nghiệm các trang chức năng trên giao diện

Sau khi mở `http://localhost:3000`, bạn có thể trải nghiệm các tính năng đã hoàn thiện:
- **Trang Tổng quan (`/`)**: Bảng KPI thống kê số lượng Instance, Snapshot, kịch bản di trú, tỷ lệ chuyển đổi và danh sách hoạt động gần đây.
- **Trang Quản lý Máy ảo (`/instances`)**:
  - Xem danh sách máy ảo tại cả 2 Region (`ap-southeast-1` và `us-east-1`).
  - Lọc theo Region, trạng thái (`RUNNING`, `STOPPED`,...).
  - Thao tác: Bật (Start), Tắt (Stop), Khởi động lại (Restart), Xóa (Terminate).
  - Chi tiết máy ảo (`/instances/[id]`): Xem thông số CPU, RAM, Network IP, cấu hình Storage và các Snapshot gắn kèm.
- **Trang Tạo Máy ảo mới (`/instances/create`)**: Biểu mẫu khởi tạo máy ảo, lựa chọn Machine Image (Ubuntu, Debian, CirrOS), cấu hình flavor phần cứng.
- **Trang Quản lý Lưu trữ (`/snapshots`)**:
  - Tab **Snapshots**: Xem danh sách bản chụp ổ đĩa, dung lượng, trạng thái sao chép.
  - Thao tác **Sao chép xuyên vùng (Cross-Region Copy)**: Replicate snapshot từ Singapore sang N. Virginia hoặc ngược lại.
  - Tab **Machine Images**: Xem danh mục ảnh đĩa mẫu phục vụ boot máy ảo.

### 6.6. Build & Preview Production

Để đóng gói và chạy thử bản build production trên môi trường local:

```bash
# Build toàn bộ monorepo (bao gồm contracts và dashboard)
pnpm build

# Chạy bản build của dashboard để kiểm tra
pnpm --filter @xregion/dashboard preview
```

---

## 7. Các lệnh kiểm tra chất lượng mã nguồn (Quality Gates)

Trước khi commit mã nguồn hoặc kết thúc một Phase, dự án bắt buộc phải vượt qua các bài kiểm tra tự động:

```bash
# 1. Chạy toàn bộ Unit và Integration Test (Vitest)
pnpm test

# 2. Kiểm tra lỗi kiểu dữ liệu TypeScript (strict mode) trên toàn bộ monorepo
pnpm typecheck

# 3. Quét lỗi cú pháp và tiêu chuẩn mã nguồn (ESLint)
pnpm lint

# 4. Kiểm tra định dạng code với Prettier
pnpm format:check

# 5. Tự động sửa định dạng toàn bộ dự án
pnpm format
```

> Hiện tại, toàn bộ **47/47 tests** của hệ thống đều vượt qua thành công với 0 lỗi TypeScript và 0 cảnh báo Lint.

---

## 8. Tiến độ hiện tại của dự án

- [x] **Phase 0: Project Initialization**: Monorepo skeleton, contracts package, layered backend, test suite cơ bản.
- [x] **Phase 1: App Shell & Mocks**: Dark design system Nuxt UI, layout responsive, mock API Nitro server, Dashboard Overview.
- [x] **Phase 2: Instance Management**: Đầy đủ tính năng quản trị máy ảo (CRUD, lifecycle state transitions, 30 tests).
- [x] **Phase 3: Storage & Snapshots Management**: Danh mục OS Image, Snapshot console, sao chép xuyên vùng, 47 tests.
- [ ] **Phase 4: Migration Scenarios (Kế hoạch tiếp theo)**: Xây dựng giao diện tạo kịch bản di trú và form cấu hình tham số.
- [ ] **Phase 5: Migration Execution Engine**: Động cơ điều phối di trú đa bước, polling trạng thái và tự động rollback.
- [ ] **Phase 6: Observability & DNS Cutover**: Tích hợp CloudWatch metrics và Route 53 DNS switching.
- [ ] **Phase 7: Real Cloud Infrastructure**: Tích hợp AWS SDK và OpenStack API thật.
- [ ] **Phase 8: Security & Authentication**: Tích hợp xác thực OpenStack Keystone và bảo mật API Gateway.
- [ ] **Phase 9: End-to-End Validation**: Kiểm thử tích hợp toàn diện và kiểm thử kịch bản phục hồi lỗi (Disaster Recovery).
- [ ] **Phase 10: Production Deployment**: Triển khai Dashboard lên AWS EC2 (Ubuntu + Nginx + Let's Encrypt) và backend Lambda.

---

## 📞 Hỗ trợ & Liên hệ

Dự án được bảo trì và phát triển trong khuôn khổ Đồ án Tốt nghiệp Điện toán Đám mây (Cloud Computing Capstone Project).  
Mọi thắc mắc về kiến trúc và quy trình triển khai, vui lòng tham khảo chi tiết tại thư mục [`plan/`](./plan) và [`memory/`](./memory).
